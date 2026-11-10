import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { changeMockUser, mockAuthService, mockDocuments, mockFirestoreSdk, mockUser, resetAccountMocks, seedSignedInMember } from './accountMocks.js';

vi.mock('../services/authService.js', async () => (await import('./accountMocks.js')).mockAuthService);
vi.mock('../services/firebaseClient.js', async () => (await import('./accountMocks.js')).mockFirebaseClient);

const staffEmail = 'staff@example.com';
const testPassword = 'TestFixture1!';

function Location() {
  return <output data-testid="staff-path" hidden>{useLocation().pathname}</output>;
}

function renderAt(path) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}>
      <App />
      <Location />
    </MemoryRouter>,
  );
}

async function submitLogin({ email = staffEmail, staffPage = true } = {}) {
  const main = within(screen.getByRole('main'));
  const submit = await main.findByRole('button', { name: staffPage ? 'Staff sign in' : 'Log in' });
  fireEvent.change(main.getByLabelText(staffPage ? /^Staff email/ : /^Email address/), { target: { value: email } });
  fireEvent.change(main.getByLabelText(/^Password/), { target: { value: testPassword } });
  fireEvent.click(submit);
}

describe('Staff authentication and routes', () => {
  beforeEach(resetAccountMocks);

  it('waits for auth and redirects a signed-out visitor from any protected admin path', async () => {
    mockAuthService.onAuthChange.mockImplementation(() => () => {});
    renderAt('/admin/requests');
    expect(within(screen.getByRole('main')).getByRole('status')).toHaveTextContent('Checking staff access');
    expect(screen.getByTestId('staff-path')).toHaveTextContent('/admin/requests');

    await act(async () => {
      for (const [listener] of mockAuthService.onAuthChange.mock.calls) listener(null);
    });

    expect(await screen.findByRole('heading', { name: 'Staff login', level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('staff-path')).toHaveTextContent('/admin/login');
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  });

  it('authorises a staff UID and signs out from the protected page', async () => {
    mockDocuments.set('admins/uid-staff', {});
    mockAuthService.login.mockImplementationOnce(async (email) => {
      const staff = { uid: 'uid-staff', email };
      changeMockUser(staff);
      return staff;
    });
    renderAt('/admin/login');
    await submitLogin();

    expect(await screen.findByRole('heading', { name: 'Staff area', level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('staff-path')).toHaveTextContent('/admin');
    expect(within(screen.getByRole('main')).getByText(staffEmail)).toBeInTheDocument();
    expect(mockFirestoreSdk.getDoc).toHaveBeenCalledWith('admins/uid-staff');
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');

    fireEvent.click(screen.getByRole('button', { name: 'Sign out of staff area' }));
    expect(await screen.findByRole('heading', { name: 'Staff login', level: 1 })).toBeInTheDocument();
    expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
  });

  it('waits for staff verification at normal login, then opens the same dashboard as staff login', async () => {
    const staff = { uid: 'uid-staff', email: staffEmail };
    const staffPath = 'admins/' + staff.uid;
    mockDocuments.set(staffPath, {});
    mockAuthService.login.mockImplementationOnce(async () => {
      changeMockUser(staff);
      return staff;
    });
    const getDoc = mockFirestoreSdk.getDoc.getMockImplementation();
    let finishCheck;
    mockFirestoreSdk.getDoc.mockImplementation(async (path) => {
      if (path === staffPath && !finishCheck) {
        await new Promise((resolve) => { finishCheck = resolve; });
      }
      return getDoc(path);
    });

    renderAt('/login?next=%2Fadopt%3FpetId%3Dmilo');
    await submitLogin({ staffPage: false });
    await waitFor(() => expect(finishCheck).toBeTypeOf('function'));
    expect(screen.getByTestId('staff-path')).toHaveTextContent(/^\/login$/);
    expect(within(screen.getByRole('main')).getByRole('status')).toHaveTextContent('Checking staff access');
    await act(async () => finishCheck());

    expect(await screen.findByRole('heading', { name: 'Staff area', level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('staff-path')).toHaveTextContent(/^\/admin$/);
    expect(mockAuthService.logout).not.toHaveBeenCalled();
  });

  it('keeps the normal member destination when staff verification fails', async () => {
    seedSignedInMember();
    const getDoc = mockFirestoreSdk.getDoc.getMockImplementation();
    mockFirestoreSdk.getDoc.mockImplementation(async (path) => {
      if (path.startsWith('admins/')) throw new Error('Offline');
      return getDoc(path);
    });
    renderAt('/login?next=%2Fmember%23requests');

    expect(await screen.findByRole('heading', { name: 'My Requests' })).toBeInTheDocument();
    expect(screen.getByTestId('staff-path')).toHaveTextContent(/^\/member$/);
    expect(mockFirestoreSdk.getDoc).toHaveBeenCalledWith('admins/' + mockUser.uid);
    expect(mockAuthService.logout).not.toHaveBeenCalled();
  });

  it('signs out an existing member who visits a protected staff route', async () => {
    seedSignedInMember();
    renderAt('/admin');

    expect(await screen.findByRole('alert')).toHaveTextContent('This account is not authorised.');
    expect(screen.getByTestId('staff-path')).toHaveTextContent('/admin/login');
    expect(mockFirestoreSdk.getDoc).toHaveBeenCalledWith('admins/' + mockUser.uid);
    expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('heading', { name: 'Staff area', level: 1 })).toBeNull();
  });

  it('blocks a regular member who submits valid credentials at staff login', async () => {
    renderAt('/admin/login');
    await submitLogin({ email: mockUser.email });
    expect(await screen.findByRole('alert')).toHaveTextContent('This account is not authorised.');
    expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('staff-path')).toHaveTextContent('/admin/login');
  });

  it('shows friendly sign-in errors on the staff login page', async () => {
    mockAuthService.login.mockRejectedValueOnce(new Error('That email or password is incorrect. Please try again.'));
    renderAt('/admin/login');
    await submitLogin();
    expect(await screen.findByRole('alert')).toHaveTextContent('That email or password is incorrect.');
    expect(mockAuthService.logout).not.toHaveBeenCalled();
    expect(screen.getByTestId('staff-path')).toHaveTextContent('/admin/login');
  });

  it('keeps staff content hidden if Firestore cannot verify access', async () => {
    const getDoc = mockFirestoreSdk.getDoc.getMockImplementation();
    mockFirestoreSdk.getDoc.mockImplementation(async (path) => {
      if (path.startsWith('admins/')) throw new Error('Offline');
      return getDoc(path);
    });
    seedSignedInMember();
    renderAt('/admin');

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not verify staff access.');
    expect(screen.queryByRole('heading', { name: 'Staff area', level: 1 })).toBeNull();
    expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
  });

  it('keeps the staff link in the footer and removes noindex when leaving the staff pages', async () => {
    renderAt('/admin/login');
    expect(document.head.querySelector('meta[name="robots"]')).not.toBeNull();
    const navbar = within(screen.getByRole('navigation', { name: 'Main navigation' }));
    expect(navbar.queryByRole('link', { name: 'Staff login' })).toBeNull();
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByRole('link', { name: 'Staff login' })).toHaveAttribute('href', '/admin/login');

    fireEvent.click(navbar.getByRole('link', { name: 'Home' }));
    await waitFor(() => expect(screen.getByTestId('staff-path')).toHaveTextContent(/^\/$/));
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('does not check staff access or sign out a member who is viewing My Requests', async () => {
    seedSignedInMember();
    renderAt('/member#requests');

    expect(await screen.findByRole('heading', { name: 'My Requests' })).toBeInTheDocument();
    expect(mockFirestoreSdk.getDoc).not.toHaveBeenCalledWith('admins/' + mockUser.uid);
    expect(mockAuthService.logout).not.toHaveBeenCalled();
  });
});

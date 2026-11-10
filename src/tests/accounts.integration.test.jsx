import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import {
  mockAuthService,
  mockDocuments,
  mockFirestoreSdk,
  mockMember,
  mockUser,
  resetAccountMocks,
  seedSignedInMember,
} from './accountMocks.js';

vi.mock('../services/firebaseClient.js', async () => (await import('./accountMocks.js')).mockFirebaseClient);
vi.mock('../services/authService.js', async () => (await import('./accountMocks.js')).mockAuthService);
vi.mock('../services/emailService.js', () => ({
  sendFormEmails: vi.fn(async () => ({ sent: true, acknowledgementSent: true, reason: '' })),
}));

function CurrentLocation() {
  const { pathname, search, hash } = useLocation();
  return <span data-testid="route-location" hidden>{pathname}{search}{hash}</span>;
}

function renderAt(path) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}>
      <App />
      <CurrentLocation />
    </MemoryRouter>,
  );
}

function locationPath() {
  return screen.getByTestId('route-location').textContent;
}

async function submitLogin() {
  const main = within(screen.getByRole('main'));
  const submit = await main.findByRole('button', { name: 'Log in' });
  fireEvent.change(main.getByLabelText(/^Email address/), { target: { value: mockUser.email } });
  fireEvent.change(main.getByLabelText(/^Password/), { target: { value: 'GoodPass1!' } });
  fireEvent.click(submit);
}

describe('Member accounts and Get Involved', () => {
  beforeEach(resetAccountMocks);

  it('shows an account spinner and waits for the auth observer before redirecting', async () => {
    mockAuthService.onAuthChange.mockImplementation(() => () => {});
    renderAt('/member');
    expect(within(screen.getByRole('main')).getByRole('status')).toHaveTextContent('Loading your account');
    expect(locationPath()).toBe('/member');
    await act(async () => mockAuthService.onAuthChange.mock.calls[0][0](null));
    expect(await within(screen.getByRole('main')).findByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('returns to the originally requested member section after signing in', async () => {
    mockDocuments.set(`members/${mockUser.uid}`, mockMember);
    renderAt('/member#requests');
    await within(screen.getByRole('main')).findByRole('button', { name: 'Log in' });
    const redirected = new URL(locationPath(), 'https://pet-heaven.test');
    expect(redirected.pathname).toBe('/login');
    expect(redirected.searchParams.get('next')).toBe('/member#requests');

    await submitLogin();
    expect(await screen.findByRole('heading', { name: 'My Requests' })).toBeInTheDocument();
    expect(locationPath()).toBe('/member#requests');
    expect(mockAuthService.login).toHaveBeenCalledWith(mockUser.email, 'GoodPass1!');
  });

  it('displays the friendly login error and stays on the sign-in page', async () => {
    const message = 'That email or password is incorrect. Please try again.';
    mockAuthService.login.mockRejectedValueOnce(new Error(message));
    renderAt('/login');
    await submitLogin();
    expect(await within(screen.getByRole('main')).findByRole('alert')).toHaveTextContent(message);
    expect(locationPath()).toBe('/login');
  });

  it('opens the password reset route and sends the reset request to Firebase', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    const main = within(screen.getByRole('main'));
    await user.click(main.getByRole('link', { name: 'Forgot password?' }));
    const submit = await main.findByRole('button', { name: 'Send reset email' });
    fireEvent.change(main.getByLabelText(/^Email address/), { target: { value: mockUser.email } });
    await user.click(submit);
    await waitFor(() => expect(mockAuthService.resetPassword).toHaveBeenCalledWith(mockUser.email));
    expect(locationPath()).toBe('/forgot-password');
  });

  it('opens the member dropdown by keyboard and signs out from the navbar', async () => {
    seedSignedInMember();
    const user = userEvent.setup();
    renderAt('/member');
    await screen.findByRole('heading', { name: /My Membership/i, level: 1 });
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    const nav = within(screen.getByRole('navigation', { name: 'Main navigation' }));
    const chip = nav.getByRole('button', { name: 'Hi, Jamie' });
    chip.focus();
    await user.keyboard('{Enter}');
    expect(chip).toHaveAttribute('aria-expanded', 'true');
    expect(nav.getByRole('link', { name: 'My Membership' })).toHaveAttribute('href', '/member');
    expect(nav.getByRole('link', { name: 'My Requests' })).toHaveAttribute('href', '/member#requests');
    await user.keyboard('{Escape}');
    expect(chip).toHaveAttribute('aria-expanded', 'false');
    expect(chip).toHaveFocus();

    await user.click(chip);
    await user.click(nav.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(mockAuthService.logout).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Hi, Jamie' })).toBeNull());
    expect(screen.getAllByRole('link', { name: 'Log in', exact: true }).some((link) => link.getAttribute('href') === '/login')).toBe(true);
  });

  it('lists only the signed-in member’s requests and includes unsynced requests for that member', async () => {
    seedSignedInMember();
    const own = {
      userId: mockUser.uid,
      referenceId: 'AD-2026-OWN1',
      petName: 'Milo',
      status: 'Submitted',
      createdAt: '2026-11-09T02:00:00.000Z',
    };
    mockDocuments.set('adoption_requests/own-request', own);
    mockDocuments.set('adoption_requests/other-request', { ...own, userId: 'uid-another-member', referenceId: 'AD-2026-OTH1' });
    localStorage.setItem('pet-heaven-adoption_requests', JSON.stringify([
      own,
      { ...own, referenceId: 'AD-2026-LOC1', petName: 'Luna' },
      { ...own, userId: 'uid-another-member', referenceId: 'AD-2026-OTH2' },
    ]));
    renderAt('/member#requests');
    await screen.findByRole('heading', { name: 'My Requests' });
    const requests = within(document.getElementById('requests'));
    expect(await requests.findByText('AD-2026-OWN1')).toBeInTheDocument();
    expect(requests.getByText('AD-2026-LOC1')).toBeInTheDocument();
    expect(requests.getByText('Milo')).toBeInTheDocument();
    expect(requests.getAllByText('New')).toHaveLength(2);
    expect(requests.queryByText('AD-2026-OTH1')).toBeNull();
    expect(requests.queryByText('AD-2026-OTH2')).toBeNull();
    expect(mockFirestoreSdk.where).toHaveBeenCalledWith('userId', '==', mockUser.uid);
  });

  it('updates editable profile fields and keeps the membership ID and status', async () => {
    seedSignedInMember();
    const user = userEvent.setup();
    renderAt('/member');
    await user.click(await screen.findByRole('button', { name: 'Edit details' }));
    const name = await screen.findByLabelText(/Full name/);
    const form = within(name.closest('form'));
    fireEvent.change(name, { target: { value: 'Alex Lim' } });
    fireEvent.change(form.getByLabelText(/Phone number/), { target: { value: '91234567' } });
    await user.click(form.getByRole('button', { name: /Save/i }));
    await waitFor(() => expect(mockDocuments.get(`members/${mockUser.uid}`)).toMatchObject({
      uid: mockUser.uid,
      fullName: 'Alex Lim',
      firstName: 'Alex',
      phone: '91234567',
      memberId: mockMember.memberId,
      status: mockMember.status,
      createdAt: mockMember.createdAt,
    }));
  });

  it('adds and removes Adopter in My Details and requires at least one role', async () => {
    seedSignedInMember();
    renderAt('/member');
    fireEvent.click(await screen.findByRole('button', { name: 'Edit details' }));
    const dialog = within(await screen.findByRole('dialog'));
    fireEvent.click(dialog.getByRole('checkbox', { name: 'Adopter' }));
    fireEvent.click(dialog.getByRole('button', { name: 'Save details' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const profile = () => mockDocuments.get('members/' + mockUser.uid);
    expect(profile().roles).toEqual(['adopter', 'volunteer']);

    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }));
    const edit = within(await screen.findByRole('dialog'));
    expect(edit.getByRole('checkbox', { name: 'Adopter' })).toBeChecked();
    fireEvent.click(edit.getByRole('checkbox', { name: 'Adopter' }));
    fireEvent.click(edit.getByRole('checkbox', { name: 'Volunteer' }));
    fireEvent.click(edit.getByRole('button', { name: 'Save details' }));
    expect(edit.getByRole('alert')).toHaveTextContent('Choose at least one option, or Adopter if you only want to adopt.');
    expect(profile().roles).toEqual(['adopter', 'volunteer']);
    fireEvent.click(edit.getByRole('checkbox', { name: 'Volunteer' }));
    fireEvent.click(edit.getByRole('button', { name: 'Save details' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(profile().roles).toEqual(['volunteer']);
  });

  it('shows the adoption form for a completed Adopter-only profile', async () => {
    seedSignedInMember();
    mockDocuments.set('members/' + mockUser.uid, { ...mockMember, roles: ['adopter'] });
    renderAt('/adopt?petId=milo');
    expect(await screen.findByLabelText(/Pet you would like to meet/)).toHaveValue('milo');
  });

  it('links signed-out visitors to Adopter registration from pet details and Get Involved', async () => {
    const petView = renderAt('/pets/milo');
    const dialog = within(await screen.findByRole('dialog', { name: 'Meet Milo' }));
    expect(dialog.getByRole('link', { name: 'Become a member to adopt' })).toHaveAttribute('href', '/join?role=adopter');
    petView.unmount();
    renderAt('/get-involved');
    const strip = within(screen.getByRole('region', { name: 'Want to adopt?' }));
    expect(strip.getByRole('link', { name: 'Browse pets' })).toHaveAttribute('href', '/pets');
    expect(strip.getByRole('link', { name: 'Join as an Adopter' })).toHaveAttribute('href', '/join?role=adopter');
  });

  it('preselects the role linked from the hub and toggles each role’s questions independently', async () => {
    const user = userEvent.setup();
    renderAt('/get-involved#foster');
    await user.click(screen.getByRole('link', { name: 'Apply as a foster carer' }));
    const foster = await screen.findByRole('checkbox', { name: 'Foster a pet' });
    expect(foster).toBeChecked();
    expect(screen.getByLabelText(/Housing type/)).toBeVisible();
    expect(screen.queryByLabelText(/Pledge type/)).toBeNull();
    await user.click(screen.getByRole('checkbox', { name: 'Donor / Sponsor' }));
    expect(screen.getByLabelText(/Pledge type/)).toBeVisible();
    expect(screen.getByLabelText(/Pet to sponsor/)).toHaveTextContent('Milo');
    await user.click(foster);
    expect(screen.queryByLabelText(/Housing type/)).toBeNull();
    expect(screen.getByLabelText(/Pledge type/)).toBeVisible();
    await user.click(screen.getByRole('checkbox', { name: 'Volunteer' }));
    expect(screen.getByLabelText(/Hours per week/)).toBeVisible();
  });
});

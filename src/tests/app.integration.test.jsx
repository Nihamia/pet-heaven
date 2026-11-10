import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { sendFormEmails } from '../services/emailService.js';
import { mockAuthService, mockDocuments, mockFirestoreSdk, mockUser, resetAccountMocks } from './accountMocks.js';

vi.mock('../services/firebaseClient.js', async () => (await import('./accountMocks.js')).mockFirebaseClient);
vi.mock('../services/authService.js', async () => (await import('./accountMocks.js')).mockAuthService);

// Avoid sending network email while still checking the form success flow.
vi.mock('../services/emailService.js', () => ({
  sendFormEmails: vi.fn(async () => ({ sent: true, acknowledgementSent: true, reason: '' })),
}));

function renderAt(path = '/') {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

async function openMobileNavigation(user) {
  const menuButton = screen.queryByRole('button', { name: 'Open navigation menu' });
  if (menuButton) await user.click(menuButton);
}

function fillContact(subject = 'Adoption question') {
  fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: 'Alex Lim' } });
  fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: 'alex@example.com' } });
  fireEvent.change(screen.getByLabelText(/Subject/), { target: { value: subject } });
  fireEvent.change(screen.getByLabelText(/Message/), {
    target: { value: 'Could you tell me when I can visit the shelter?' },
  });
}

function fillJoinIdentity() {
  const values = [
    [/Full name/, 'Jamie Tan'],
    [/Email address/, 'jamie@example.com'],
    [/Phone number/, '81234567'],
    [/Create a password/, 'GoodPass1!'],
    [/Confirm password/, 'GoodPass1!'],
    [/Home address/, '10 River Valley Road'],
  ];
  for (const [label, value] of values) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
}

async function fillVolunteerRegistration(user) {
  fillJoinIdentity();
  const volunteer = screen.getByRole('checkbox', { name: 'Volunteer' });
  if (!volunteer.checked) await user.click(volunteer);
  await user.click(screen.getByRole('checkbox', { name: 'Monday' }));
  fireEvent.change(screen.getByLabelText(/Hours per week/), { target: { value: '3' } });
  await user.type(screen.getByLabelText(/Skills you can share/), 'Animal care');
  await user.click(screen.getByLabelText(/I confirm that I am at least 18 years old/));
  await user.click(screen.getByLabelText(/I agree to the use of my information/));
}

describe('Pet Heaven user journeys', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetAccountMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('navigates from Home to About in the single-page app', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await openMobileNavigation(user);
    await user.click(screen.getByRole('button', { name: 'About' }));
    await user.click(screen.getByRole('link', { name: 'Our Story' }));

    expect(await screen.findByRole('heading', { name: 'A little care can change a whole life.' })).toBeInTheDocument();
    expect(document.title).toBe('About us | Pet Heaven');
  });

  it('filters the pet cards by a debounced name search', async () => {
    const user = userEvent.setup();
    renderAt('/pets');
    await user.type(screen.getByRole('searchbox', { name: 'Search pets' }), 'Milo');

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 18 pets');
    });
    expect(screen.getByRole('heading', { name: 'Milo' })).toBeInTheDocument();
  });

  it('filters the gallery by species', async () => {
    const user = userEvent.setup();
    renderAt('/pets');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Species' }), 'Cat');

    await waitFor(() => {
      const petCards = screen.getAllByRole('article');
      expect(petCards.length).toBeGreaterThan(0);
      expect(petCards.every((card) => within(card).getByText('Cat', { exact: true }))).toBe(true);
    });
  });

  it('shows the empty state when search has no matches', async () => {
    const user = userEvent.setup();
    renderAt('/pets');
    await user.type(screen.getByRole('searchbox', { name: 'Search pets' }), 'no-such-pet-2048');

    expect(await screen.findByText('No pets match those filters yet.')).toBeInTheDocument();
  });

  it('persists a favourite after the gallery remounts', async () => {
    const user = userEvent.setup();
    const firstRender = renderAt('/pets');
    await user.click(screen.getByRole('button', { name: 'Add Milo to favourites' }));

    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('pet-heaven-favourites'))).toContain('milo');
    });
    firstRender.unmount();
    renderAt('/pets');

    expect(await screen.findByRole('button', { name: 'Remove Milo from favourites' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows inline validation errors when the Join form is empty', async () => {
    const user = userEvent.setup();
    renderAt('/join');
    await user.click(screen.getByRole('button', { name: 'Join the community' }));

    expect(await screen.findByText('Full name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Data consent is required.')).toBeInTheDocument();
    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(screen.getByText('Choose at least one option, or Adopter if you only want to adopt.')).toBeInTheDocument();
  });

  it('registers an account with the selected roles and sends the welcome emails', async () => {
    const user = userEvent.setup();
    renderAt('/join?role=volunteer');

    expect(screen.getByRole('checkbox', { name: 'Volunteer' })).toBeChecked();
    await fillVolunteerRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Join the community' }));

    expect(await screen.findByRole('heading', { name: /My Membership/i, level: 1 })).toBeInTheDocument();
    expect(mockAuthService.register).toHaveBeenCalledWith('jamie@example.com', 'GoodPass1!');
    const saved = mockDocuments.get(`members/${mockUser.uid}`);
    expect(saved).toMatchObject({
      uid: mockUser.uid,
      fullName: 'Jamie Tan',
      firstName: 'Jamie',
      status: 'Active',
      roles: ['volunteer'],
      dataConsent: true,
      memberId: expect.stringMatching(/^PH-[A-HJ-NP-Z2-9]{6}$/),
      email: mockUser.email,
      roleDetails: { volunteer: { volunteerDays: ['Monday'], volunteerHours: 3, volunteerSkills: 'Animal care' } },
      updatedAt: saved.createdAt,
    });
    expect(saved).not.toHaveProperty('password');
    expect(saved).not.toHaveProperty('confirmPassword');
    expect(JSON.stringify(localStorage)).not.toContain('GoodPass1!');
    expect(sendFormEmails).toHaveBeenCalledWith(expect.objectContaining({
      formType: 'join',
      reference: saved.memberId,
      data: expect.objectContaining({
        fullName: 'Jamie Tan',
        email: 'jamie@example.com',
        phone: '81234567',
        roles: ['volunteer'],
        roleDetails: saved.roleDetails,
      }),
    }));
    expect(JSON.stringify(sendFormEmails.mock.calls[0][0])).not.toContain('GoodPass1!');
  });

  it('preselects and toggles the first Adopter card, then registers without extra answers', async () => {
    renderAt('/join?role=adopter');
    const adopter = screen.getByRole('checkbox', { name: 'Adopter' });
    expect(within(document.getElementById('support-interests')).getAllByRole('checkbox')[0]).toBe(adopter);
    expect(adopter).toBeChecked();
    fireEvent.click(adopter);
    expect(adopter).not.toBeChecked();
    fireEvent.click(adopter);
    expect(adopter).toBeChecked();
    expect(screen.queryByRole('group', { name: /Adopter details/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Hours per week|Housing type|Pledge type/)).not.toBeInTheDocument();
    fillJoinIdentity();
    fireEvent.click(screen.getByLabelText(/I confirm that I am at least 18 years old/));
    fireEvent.click(screen.getByLabelText(/I agree to the use of my information/));
    fireEvent.click(screen.getByRole('button', { name: 'Join the community' }));
    expect(await screen.findByRole('heading', { name: /My Membership/i, level: 1 })).toBeInTheDocument();
    expect(mockDocuments.get('members/' + mockUser.uid)).toMatchObject({ roles: ['adopter'], roleDetails: {} });
    expect(within(screen.getByRole('region', { name: 'Membership card' })).getByText('Adopter')).toBeInTheDocument();
  });

  it('redirects a signed-out visitor from the adoption application and offers registration', async () => {
    renderAt('/adopt');

    const main = within(await screen.findByRole('main'));
    expect(await main.findByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(main.getByRole('link', { name: 'Become a member to adopt' })).toHaveAttribute('href', '/join?role=adopter');
    expect(screen.queryByLabelText('Pet you would like to meet')).not.toBeInTheDocument();
  });

  it('rejects an invalid Singapore phone number on the Release form', async () => {
    const user = userEvent.setup();
    renderAt('/release');

    await user.type(screen.getByLabelText(/Phone number/), '12345678');
    await user.click(screen.getByRole('button', { name: 'Send a support request' }));

    expect(await screen.findByText(/Enter an 8-digit Singapore number/)).toBeInTheDocument();
    expect(window.localStorage.getItem('pet-heaven-release_requests')).toBeNull();
  });

  it('submits a validated Contact message to browser storage', async () => {
    const user = userEvent.setup();
    renderAt('/contact');

    await user.type(screen.getByLabelText(/Your name/), 'Alex Lim');
    await user.type(screen.getByLabelText(/Email address/), 'alex@example.com');
    await user.type(screen.getByLabelText(/Subject/), 'Adoption question');
    await user.type(screen.getByLabelText(/Message/), 'Could you tell me when I can visit the shelter?');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('Your form has been sent.')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('pet-heaven-contact_messages'))[0]).toMatchObject({ name: 'Alex Lim', status: 'New', type: 'contact' });
  });

  it('retries a failed Contact email with the original reference and one saved record', async () => {
    const user = userEvent.setup();
    let finishFirstSend;
    let finishRetry;
    vi.mocked(sendFormEmails)
      .mockImplementationOnce(() => new Promise((resolve) => { finishFirstSend = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { finishRetry = resolve; }));

    renderAt('/contact');
    fillContact('Email retry test');

    const submit = screen.getByRole('button', { name: 'Send message' });
    await user.click(submit);
    await waitFor(() => expect(sendFormEmails).toHaveBeenCalledTimes(1));
    expect(submit).toBeDisabled();
    expect(screen.queryByText('Your form has been sent.')).toBeNull();

    await act(async () => finishFirstSend({ sent: false, acknowledgementSent: false, reason: 'send-failed' }));
    const retry = await screen.findByRole('button', { name: 'Retry email' });
    expect(screen.getByRole('alert')).toHaveTextContent(/email/i);
    expect(screen.queryByText('Your form has been sent.')).toBeNull();
    const stored = JSON.parse(window.localStorage.getItem('pet-heaven-contact_messages'));
    expect(stored).toHaveLength(1);
    expect(stored[0].referenceId).toMatch(/^CT-\d{4}-[A-Z0-9]{4}$/);
    expect(sendFormEmails).toHaveBeenNthCalledWith(1, expect.objectContaining({
      formType: 'contact',
      reference: stored[0].referenceId,
    }));

    await user.click(retry);
    expect(sendFormEmails).toHaveBeenCalledTimes(1);
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 30_001);
    await user.click(retry);
    await waitFor(() => expect(sendFormEmails).toHaveBeenCalledTimes(2));
    expect(retry).toBeDisabled();
    expect(sendFormEmails.mock.calls[1]).toEqual(sendFormEmails.mock.calls[0]);
    expect(screen.queryByText('Your form has been sent.')).toBeNull();

    await act(async () => finishRetry({ sent: true, acknowledgementSent: true, reason: '' }));
    expect(await screen.findByText('Your form has been sent.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry email' })).toBeNull();
    expect(JSON.parse(window.localStorage.getItem('pet-heaven-contact_messages'))).toEqual(stored);
    expect(mockFirestoreSdk.addDoc).toHaveBeenCalledTimes(1);
    expect(mockFirestoreSdk.addDoc).toHaveBeenCalledWith('contact_messages', expect.objectContaining({
      referenceId: stored[0].referenceId,
      status: 'New',
    }));
  });

  it('reports acknowledgement failure after the administrator email succeeds', async () => {
    const user = userEvent.setup();
    vi.mocked(sendFormEmails).mockResolvedValueOnce({
      sent: true,
      acknowledgementSent: false,
      reason: 'ack-send-failed',
    });
    renderAt('/contact');
    fillContact();
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('Your form has been sent.')).toBeInTheDocument();
    expect(screen.getByText('Your confirmation email could not be sent.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry email' })).toBeNull();
  });

  it('rejects a filled honeypot before saving or sending', async () => {
    const user = userEvent.setup();
    const view = renderAt('/contact');
    fillContact();
    const website = view.container.querySelector('input[name="website"]');
    expect(website).toBeInTheDocument();
    expect(website).not.toBeVisible();
    fireEvent.change(website, { target: { value: 'https://spam.example' } });
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(sendFormEmails).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('pet-heaven-contact_messages')).toBeNull();
    expect(screen.getByText(/could not accept this submission/i)).toBeInTheDocument();
  });

  it('applies the same cooldown after opening another form', async () => {
    const user = userEvent.setup();
    const first = renderAt('/contact');
    fillContact('First valid message');
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Your form has been sent.')).toBeInTheDocument();
    first.unmount();

    renderAt('/join');
    await fillVolunteerRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Join the community' }));

    expect(sendFormEmails).toHaveBeenCalledTimes(1);
    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(mockDocuments.has(`members/${mockUser.uid}`)).toBe(false);
    expect(screen.getByText(/wait.*(?:second|before)/i)).toBeInTheDocument();
  });
});

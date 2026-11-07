import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';

// Keep tests deterministic and exercise the app's real browser-storage fallback.
vi.mock('../services/firebaseClient.js', () => ({
  isFirebaseConfigured: false,
  getFirestoreClient: vi.fn(async () => null),
}));

// Avoid sending network email while still checking the form success flow.
vi.mock('../services/emailService.js', () => ({
  sendAdminEmail: vi.fn(async () => ({ sent: true, reason: '' })),
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

describe('Pet Heaven user journeys', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('navigates from Home to About in the single-page app', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await openMobileNavigation(user);
    await user.click(screen.getByRole('link', { name: 'About' }));

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
    expect(screen.getByText('Choose at least one way you would like to support the society.')).toBeInTheDocument();
  });

  it('registers a member and never stores the password', async () => {
    const user = userEvent.setup();
    renderAt('/join');

    await user.type(screen.getByLabelText(/Full name/), 'Jamie Tan');
    await user.type(screen.getByLabelText(/Email address/), 'jamie@example.com');
    await user.type(screen.getByLabelText(/Phone number/), '81234567');
    await user.type(screen.getByLabelText(/Create a password/), 'GoodPass1!');
    await user.type(screen.getByLabelText(/Confirm password/), 'GoodPass1!');
    await user.type(screen.getByLabelText(/Home address/), '10 River Valley Road');
    await user.click(screen.getByLabelText('Make a donation'));
    await user.click(screen.getByLabelText(/I confirm that I am at least 18 years old/));
    await user.click(screen.getByRole('button', { name: 'Join the community' }));

    expect(await screen.findByRole('heading', { name: 'Your member ID' })).toBeInTheDocument();
    const savedMembers = JSON.parse(window.localStorage.getItem('pet-heaven-members'));
    expect(savedMembers[0].fullName).toBe('Jamie Tan');
    expect(savedMembers[0]).not.toHaveProperty('password');
    expect(savedMembers[0]).not.toHaveProperty('confirmPassword');
  });

  it('keeps non-members out of the adoption application and offers the Join page', async () => {
    const user = userEvent.setup();
    renderAt('/adopt');

    await user.type(screen.getByLabelText(/Membership email/), 'visitor@example.com');
    await user.type(screen.getByLabelText(/Member ID/), 'PH-2026-1234');
    expect(screen.getByLabelText(/Membership email/)).toHaveValue('visitor@example.com');
    expect(screen.getByLabelText(/Member ID/)).toHaveValue('PH-2026-1234');
    await user.click(screen.getByRole('button', { name: 'Verify membership' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/We could not find that membership on this browser/);
    expect(screen.getByRole('link', { name: 'Join Pet Heaven' })).toHaveAttribute('href', '/join');
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
    expect(JSON.parse(window.localStorage.getItem('pet-heaven-contact_messages'))[0].name).toBe('Alex Lim');
  });
});

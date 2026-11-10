import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import fallbackPets from '../data/pets.json';
import { imageCredits } from '../data/images.js';
import { mockDocuments, mockMember, mockUser, resetAccountMocks, seedSignedInMember } from './accountMocks.js';

vi.mock('../services/firebaseClient.js', async () => (await import('./accountMocks.js')).mockFirebaseClient);
vi.mock('../services/authService.js', async () => (await import('./accountMocks.js')).mockAuthService);
vi.mock('../services/emailService.js', () => ({ sendFormEmails: vi.fn(async () => ({ sent: true, acknowledgementSent: true, reason: '' })) }));

function renderAt(path = '/') {
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}><App /></MemoryRouter>);
}

describe('Charity website design interactions', () => {
  beforeEach(resetAccountMocks);

  it('opens a navigation disclosure and returns keyboard focus when Escape closes it', async () => {
    const user = userEvent.setup();
    renderAt('/contact');
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    const adopt = screen.getByRole('button', { name: 'Adopt' });
    expect(adopt).toHaveAttribute('aria-haspopup', 'true');
    expect(screen.queryByRole('link', { name: 'Available Pets' })).not.toBeInTheDocument();
    await user.click(adopt);
    expect(adopt).toHaveAttribute('aria-expanded', 'true');
    await user.tab();
    expect(screen.getByRole('link', { name: 'Available Pets' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(adopt).toHaveFocus();
    expect(adopt).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles a dropdown with Enter and closes when Tab leaves its links', async () => {
    const user = userEvent.setup();
    renderAt('/contact');
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    const adopt = screen.getByRole('button', { name: 'Adopt' });
    adopt.focus();
    await user.keyboard('{Enter}');
    expect(adopt).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Enter}');
    expect(adopt).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{Enter}');
    await user.tab();
    expect(screen.getByRole('link', { name: 'Available Pets' })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Release a Pet' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Get Involved' })).toHaveFocus();
    expect(adopt).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes a dropdown when its trigger is clicked again or a pointer clicks outside', async () => {
    const user = userEvent.setup();
    renderAt('/contact');
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    const adopt = screen.getByRole('button', { name: 'Adopt' });
    await user.click(adopt);
    expect(adopt).toHaveAttribute('aria-expanded', 'true');
    await user.click(adopt);
    expect(adopt).toHaveAttribute('aria-expanded', 'false');
    await user.click(adopt);
    await user.click(screen.getByRole('main'));
    expect(adopt).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Available Pets' })).not.toBeInTheDocument();
  });

  it('navigates through the mobile accordion and closes the hamburger after choosing a link', async () => {
    const user = userEvent.setup();
    renderAt('/contact');
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    await user.click(screen.getByRole('button', { name: 'About' }));
    await user.click(screen.getByRole('link', { name: 'Our Story' }));
    expect(await screen.findByRole('heading', { name: 'A little care can change a whole life.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens a submenu with ArrowDown and follows its active section link', async () => {
    const user = userEvent.setup();
    renderAt('/about');
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(screen.getByRole('button', { name: 'About' })).toHaveClass('nav-link--active');
    expect(screen.getByRole('button', { name: 'Adopt' })).not.toHaveClass('nav-link--active');
    const about = screen.getByRole('button', { name: 'About' });
    about.focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('link', { name: 'Our Story' })).toHaveFocus());
    await user.click(within(screen.getByRole('navigation', { name: 'Main navigation' })).getByRole('link', { name: 'Facilities', exact: true }));
    expect(document.getElementById('about-facilities-title')).toBeInTheDocument();
  });

  it('links the Get Involved dropdown to the hub, role sections, and Join', async () => {
    const user = userEvent.setup();
    renderAt('/contact');
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    await user.click(screen.getByRole('button', { name: 'Get Involved' }));
    const nav = within(screen.getByRole('navigation', { name: 'Main navigation' }));
    const targets = [
      ['Overview', '/get-involved'],
      ['Volunteer', '/get-involved#volunteer'],
      ['Foster a Pet', '/get-involved#foster'],
      ['Donate and Sponsor', '/get-involved#donate'],
      ['Join Us', '/join'],
    ];
    for (const [name, href] of targets) {
      expect(nav.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
    }
    await user.click(nav.getByRole('link', { name: 'Donate and Sponsor', exact: true }));
    await waitFor(() => expect(document.getElementById('donate')).toBeInTheDocument());
  });

  it('keeps the Home support section and expandable news stories', async () => {
    const user = userEvent.setup();
    renderAt('/');
    expect(document.getElementById('sponsor')).toBeInTheDocument();
    const news = screen.getAllByText('Read more', { exact: false, selector: 'summary' })[0];
    await user.click(news);
    expect(news.closest('details')).toHaveAttribute('open');
  });

  it('validates newsletter input and saves an honest browser-only signup', async () => {
    const user = userEvent.setup();
    renderAt('/contact');
    const footer = within(screen.getByRole('contentinfo'));
    await user.click(footer.getByRole('button', { name: 'Join list' }));
    expect(await footer.findByText('Email is required.')).toBeInTheDocument();
    await user.type(footer.getByLabelText(/Your email address/), 'reader@example.com');
    await user.click(footer.getByRole('button', { name: 'Join list' }));
    expect(await footer.findByText(/No newsletter email has been sent/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('pet-heaven-newsletter')).email).toBe('reader@example.com');
  });

  it('opens the footer legal and image-credit pages', async () => {
    const user = userEvent.setup();
    renderAt('/contact');
    await user.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Privacy' }));
    expect(await screen.findByRole('heading', { name: 'Privacy and your information' })).toBeInTheDocument();
    await user.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Terms' }));
    expect(await screen.findByRole('heading', { name: 'Terms of this coursework demonstration' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'View image credits' }));
    expect(await screen.findByRole('heading', { name: 'Image credits' })).toBeInTheDocument();
  });

  it('combines the HDB-friendly filter with sorting and restores the gallery when cleared', async () => {
    const user = userEvent.setup();
    renderAt('/pets');
    const hdbFilter = screen.getByRole('combobox', { name: 'HDB-friendly' });
    await user.selectOptions(hdbFilter, 'true');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'name');
    const expected = fallbackPets.filter((pet) => pet.hdbFriendly && pet.status === 'Available').map((pet) => pet.name).sort((a, b) => a.localeCompare(b));
    const results = within(screen.getByRole('region', { name: 'Pets looking for a home' }));
    await waitFor(() => {
      const cards = results.getAllByRole('article');
      expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual(expected);
      cards.forEach((card) => expect(within(card).getByText('HDB-friendly').nextElementSibling).toHaveTextContent('Yes'));
    });
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(hdbFilter).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 18 of 18 pets');
  });

  it('shows only the No group for HDB-friendly and keeps species filtering compatible', async () => {
    const user = userEvent.setup();
    renderAt('/pets');
    await user.selectOptions(screen.getByRole('combobox', { name: 'HDB-friendly' }), 'false');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Species' }), 'Dog');
    const expected = fallbackPets.filter((pet) => pet.hdbFriendly === false && pet.species === 'Dog' && pet.status === 'Available');
    const results = within(screen.getByRole('region', { name: 'Pets looking for a home' }));
    await waitFor(() => {
      expect(results.getAllByRole('article')).toHaveLength(expected.length);
      results.getAllByRole('article').forEach((card) => expect(within(card).getByText('HDB-friendly').nextElementSibling).toHaveTextContent('No'));
    });
  });

  it('renders the generated image-credit catalogue with every local image path', () => {
    renderAt('/credits');
    expect(screen.getByRole('heading', { name: 'Image credits', level: 1 })).toBeInTheDocument();
    imageCredits.forEach((asset) => expect(screen.getByText(asset.path, { exact: true })).toBeInTheDocument());
  });

  it.each(['/about', '/pets', '/join', '/release', '/adopt', '/contact', '/get-involved'])('provides a local banner, breadcrumb, and one main heading on %s', async (path) => {
    if (path === '/adopt') seedSignedInMember();
    renderAt(path);
    expect(await screen.findByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(document.querySelector('.page-banner img').getAttribute('src')).toMatch(/^\/images\/banners\//);
  });

  it('returns a signed-out visitor from the pet detail to a preselected adoption after login', async () => {
    mockDocuments.set(`members/${mockUser.uid}`, mockMember);
    const user = userEvent.setup();
    renderAt('/pets/milo');
    const dialog = within(await screen.findByRole('dialog', { name: 'Meet Milo' }));
    const milo = fallbackPets.find((pet) => pet.id === 'milo');
    expect(dialog.getAllByRole('button', { name: /Show Milo photo/ })).toHaveLength(milo.gallery.length);
    expect(document.querySelector('.pet-detail__main-image')).toHaveAttribute('src', milo.image);
    await user.click(dialog.getByRole('link', { name: 'Ask to adopt Milo' }));
    const loginForm = within(await screen.findByRole('main'));
    await user.type(await loginForm.findByLabelText(/Email address/), mockUser.email);
    await user.type(loginForm.getByLabelText(/^Password/), 'GoodPass1!');
    await user.click(loginForm.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByLabelText(/Pet you would like to meet/)).toHaveValue('milo');
  });
});

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import pets from '../data/pets.json';
import { sendAdminEmail } from '../services/emailService.js';

vi.mock('../services/firebaseClient.js', () => ({ isFirebaseConfigured: false, getFirestoreClient: vi.fn(async () => null) }));
vi.mock('../services/emailService.js', () => ({ sendAdminEmail: vi.fn(async () => ({ sent: true, reason: '' })) }));

const routes = ['/', '/about', '/pets', '/join', '/adopt', '/release', '/contact', '/privacy', '/terms', '/credits', '/not-a-page'];

function renderAt(path = '/') {
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}><App /></MemoryRouter>);
}

function futureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

describe('Polished inner pages', () => {
  let consoleError;
  let consoleWarning;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    try {
      expect(consoleError).not.toHaveBeenCalled();
      expect(consoleWarning).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
      consoleWarning.mockRestore();
    }
  });

  it.each([
    ['/join', 'More hands, more hope.'],
    ['/adopt', 'Your adoption journey'],
    ['/release', 'Support without judgement'],
    ['/contact', 'A clear route to the team'],
  ])('keeps the %s form beside helpful, labelled next steps', (path, title) => {
    renderAt(path);
    const guide = within(screen.getByRole('complementary'));
    expect(guide.getByRole('heading', { name: title, level: 2 })).toBeInTheDocument();
    expect(guide.getByRole('heading', { name: 'What happens next', level: 3 })).toBeInTheDocument();
    expect(guide.getAllByRole('list').some((list) => list.tagName === 'OL' && list.children.length >= 3)).toBe(true);
    expect(document.querySelector('main form')).toBeInTheDocument();
  });

  it('reuses numbered cards and retains the About timeline, photos, FAQ and opening hours', async () => {
    const user = userEvent.setup();
    renderAt('/about');
    expect(document.querySelectorAll('.about-mission-grid .home-step-card')).toHaveLength(4);
    expect(document.querySelectorAll('.about-adoption-steps .home-step-card')).toHaveLength(4);
    expect(document.querySelectorAll('.about-timeline > li')).toHaveLength(4);
    expect(document.querySelectorAll('.about-facility-card img')).toHaveLength(4);
    expect(document.querySelectorAll('.about-team-card img')).toHaveLength(4);
    const question = screen.getByRole('button', { name: 'Is there an adoption fee?' });
    await user.click(question);
    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'Is there an adoption fee?' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Opening hours' })).toBeInTheDocument();
    expect(document.getElementById('about-visit-title')).toBeInTheDocument();
  });

  it.each(routes)('keeps one main heading, ordered headings, unique IDs and reserved images on %s', (path) => {
    renderAt(path);
    const main = screen.getByRole('main');
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const headings = [...main.querySelectorAll('h1,h2,h3,h4,h5,h6')];
    for (let index = 1; index < headings.length; index += 1) {
      expect(Number(headings[index].tagName.slice(1))).toBeLessThanOrEqual(Number(headings[index - 1].tagName.slice(1)) + 1);
    }
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    document.querySelectorAll('img').forEach((image) => {
      expect(image).toHaveAttribute('alt');
      expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
      if (!image.closest('.page-banner, .home-hero')) expect(image).toHaveAttribute('loading', 'lazy');
    });
    document.querySelectorAll('iframe').forEach((frame) => {
      expect(frame).toHaveAttribute('title');
      expect(Number(frame.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(frame.getAttribute('height'))).toBeGreaterThan(0);
      expect(frame).toHaveAttribute('loading', 'lazy');
    });
  });

  it('resolves every rendered navbar, footer, tile and button link to an existing route or section', () => {
    const targets = new Map();
    const links = [];
    for (const path of routes) {
      const view = renderAt(path);
      targets.set(path, new Set([...document.querySelectorAll('[id]')].map((node) => node.id)));
      document.querySelectorAll('a[href]').forEach((link) => links.push(new URL(link.getAttribute('href'), `https://pet-heaven.test${path}`)));
      view.unmount();
    }
    expect(links.length).toBeGreaterThan(60);
    for (const link of links) {
      expect(link.href).not.toContain('mailto:hello@petheaven.example');
      if (link.origin !== 'https://pet-heaven.test') continue;
      const isPet = pets.some((pet) => link.pathname === `/pets/${pet.id}`);
      expect(targets.has(link.pathname) || isPet, link.href).toBe(true);
      if (link.hash) expect(targets.get(link.pathname)?.has(decodeURIComponent(link.hash.slice(1))), link.href).toBe(true);
    }
  });

  it('keeps the retired component-demo path on the friendly not-found page', () => {
    renderAt('/components-demo');
    expect(document.title).toBe('Page not found | Pet Heaven');
    expect(screen.getByRole('main').querySelector('form')).not.toBeInTheDocument();
  });

  it('keeps Contact errors linked to inputs while the guidance panel stays available', async () => {
    const user = userEvent.setup();
    renderAt('/contact');
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    const email = screen.getByLabelText(/Email address/);
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById(email.getAttribute('aria-describedby'))).toHaveTextContent('Email is required.');
    expect(screen.getByRole('heading', { name: 'A clear route to the team' })).toBeInTheDocument();
    expect(localStorage.getItem('pet-heaven-contact_messages')).toBeNull();
  });

  it('preserves member verification, draft, review, adoption save and calendar confirmation', async () => {
    const member = { fullName: 'Jamie Tan', email: 'jamie@example.com', phone: '81234567', memberId: 'PH-DEMO-1' };
    localStorage.setItem('pet-heaven-members', JSON.stringify([member]));
    const user = userEvent.setup();
    renderAt('/adopt?petId=milo');
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Membership email/), member.email);
    await user.type(screen.getByLabelText(/Member ID/), member.memberId);
    await user.click(screen.getByRole('button', { name: 'Verify membership' }));
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByLabelText(/Pet you would like to meet/)).toHaveValue('milo');
    await user.selectOptions(screen.getByLabelText(/Housing type/), 'Condominium');
    await user.selectOptions(screen.getByLabelText(/Do you own or rent/), 'rent');
    await user.click(screen.getByLabelText(/My landlord has agreed/));
    await user.type(screen.getByLabelText(/Who lives in your household/), 'Two adults');
    await user.type(screen.getByLabelText(/Your pet care experience/), 'I have cared for family dogs for five years.');
    await user.selectOptions(screen.getByLabelText(/Typical work or study schedule/), 'mostly-home');
    await user.type(screen.getByLabelText(/Why would you like to adopt/), 'We can offer patient daily care and a calm home for Milo.');
    await user.click(screen.getByLabelText(/I am ready to care/));
    await user.click(screen.getByLabelText(/I can plan for everyday/));
    await user.click(screen.getByLabelText(/I agree to an adoption conversation/));
    fireEvent.change(screen.getByLabelText(/Preferred interview date/), { target: { value: futureDate() } });
    await user.selectOptions(screen.getByLabelText(/Preferred time/), '10:00');
    expect(JSON.parse(localStorage.getItem('pet-heaven-adoption-draft')).petId).toBe('milo');
    await user.click(screen.getByRole('button', { name: 'Review my enquiry' }));
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Check your enquiry before sending.' })).toBeInTheDocument();
    expect(localStorage.getItem('pet-heaven-adoption_requests')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Confirm and send enquiry' }));
    expect(await screen.findByRole('heading', { name: 'Your enquiry reference' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('pet-heaven-adoption_requests'))[0]).toMatchObject({ petId: 'milo', memberId: member.memberId, landlordPermission: true });
    // The existing storage hook resets to its initial draft rather than keeping the submitted answers.
    expect(JSON.parse(localStorage.getItem('pet-heaven-adoption-draft'))).toMatchObject({ petId: 'milo', reason: '', experience: '', preferredDate: '', commitmentLongTerm: false });
    const calendar = new URL(screen.getByRole('link', { name: /Add to calendar/ }).href);
    expect(calendar.hostname).toBe('calendar.google.com');
    expect(calendar.searchParams.get('dates')).toContain(futureDate().replaceAll('-', ''));
    expect(sendAdminEmail).toHaveBeenCalledTimes(1);
  }, 20000);

  it('keeps Release photo validation and valid submission working beside the support guide', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderAt('/release');
    const photo = screen.getByLabelText(/Pet photo \(optional\)/);
    await user.upload(photo, new File(['text'], 'notes.txt', { type: 'text/plain' }));
    await user.click(screen.getByRole('button', { name: 'Send a support request' }));
    expect(screen.getByText('Choose an image file.')).toBeInTheDocument();
    expect(localStorage.getItem('pet-heaven-release_requests')).toBeNull();
    await user.upload(photo, new File([new Uint8Array(2 * 1024 * 1024)], 'too-big.png', { type: 'image/png' }));
    expect(screen.getByText('Each image must be smaller than 2 MB.')).toBeInTheDocument();
    await user.upload(photo, new File(['image'], 'pet.png', { type: 'image/png' }));
    await user.type(screen.getByLabelText(/Your name/), 'Alex Lim');
    await user.type(screen.getByLabelText(/Email address/), 'alex@example.com');
    await user.type(screen.getByLabelText(/Phone number/), '81234567');
    await user.type(screen.getByLabelText(/Pet's name/), 'Clover');
    await user.selectOptions(screen.getByLabelText('Species', { exact: false }), 'Cat');
    await user.type(screen.getByLabelText(/Breed or best guess/), 'Domestic Shorthair');
    await user.type(screen.getByLabelText(/Age in years/), '3');
    await user.selectOptions(screen.getByLabelText('Gender', { exact: false }), 'Female');
    await user.selectOptions(screen.getByLabelText('Size', { exact: false }), 'Small');
    await user.type(screen.getByLabelText(/Colour/), 'Tabby');
    await user.selectOptions(screen.getByLabelText(/Vaccinated\?/), 'Yes');
    await user.selectOptions(screen.getByLabelText(/Sterilised\?/), 'Yes');
    await user.selectOptions(screen.getByLabelText(/What is the main reason/), 'housing');
    await user.type(screen.getByLabelText(/Tell us a little more/), 'Our housing changed and we would like advice about safe options.');
    fireEvent.change(screen.getByLabelText(/Preferred handover date/), { target: { value: futureDate() } });
    await user.click(screen.getByLabelText(/I agree that the Pet Heaven team/));
    await user.click(screen.getByRole('button', { name: 'Send a support request' }));
    expect(await screen.findByRole('heading', { name: 'Your request reference' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('pet-heaven-release_requests'))[0]).toMatchObject({ petName: 'Clover', photoFileName: 'pet.png', photoFileType: 'image/png' });
    expect(sendAdminEmail).toHaveBeenCalledTimes(1);
    expect(sendAdminEmail.mock.calls[0][1]).toBeInstanceOf(HTMLFormElement);
  }, 20000);
});

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import pets from '../data/pets.json';
import { sendFormEmails } from '../services/emailService.js';
import { mockMember, mockUser, resetAccountMocks, seedSignedInMember } from './accountMocks.js';

vi.mock('../services/firebaseClient.js', async () => (await import('./accountMocks.js')).mockFirebaseClient);
vi.mock('../services/authService.js', async () => (await import('./accountMocks.js')).mockAuthService);
vi.mock('../services/emailService.js', () => ({ sendFormEmails: vi.fn(async () => ({ sent: true, acknowledgementSent: true, reason: '' })) }));

const routes = [
  '/', '/about', '/pets', '/join', '/adopt', '/release', '/contact', '/privacy', '/terms', '/credits',
  '/get-involved', '/login', '/forgot-password', '/member', '/admin/login', '/not-a-page',
];

function renderAt(path = '/') {
  if (path === '/member' || path.startsWith('/adopt')) seedSignedInMember();
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
    resetAccountMocks();
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
  ])('keeps the %s form beside helpful, labelled next steps', async (path, title) => {
    renderAt(path);
    const guide = within(await screen.findByRole('complementary'));
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

  it.each(routes)('keeps one main heading, ordered headings, unique IDs and reserved images on %s', async (path) => {
    renderAt(path);
    const main = screen.getByRole('main');
    await within(main).findByRole('heading', { level: 1 });
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

  it('resolves every rendered navbar, footer, tile and button link to an existing route or section', async () => {
    const targets = new Map();
    const links = [];
    for (const path of routes) {
      resetAccountMocks();
      const view = renderAt(path);
      await within(screen.getByRole('main')).findByRole('heading', { level: 1 });
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

  it('prefills the signed-in account and preserves draft, review, adoption save and calendar confirmation', async () => {
    const user = userEvent.setup();
    renderAt('/adopt?petId=milo');
    const name = await screen.findByLabelText(/Applicant name/);
    const form = within(name.closest('form'));
    expect(name).toHaveValue(mockMember.fullName);
    expect(form.getByLabelText(/Phone number/)).toHaveValue(mockMember.phone);
    expect(form.getByLabelText('Email address')).toHaveValue(mockUser.email);
    expect(form.getByLabelText('Email address')).toHaveAttribute('readonly');
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
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
    const draftKey = `pet-heaven-adoption-draft-${mockUser.uid}`;
    expect(JSON.parse(localStorage.getItem(draftKey))).toMatchObject({ petId: 'milo' });
    await user.click(screen.getByRole('button', { name: 'Review my enquiry' }));
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Check your enquiry before sending.' })).toBeInTheDocument();
    expect(localStorage.getItem('pet-heaven-adoption_requests')).toBeNull();
    expect(sendFormEmails).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Confirm and send enquiry' }));
    expect(await screen.findByRole('heading', { name: 'Your enquiry reference' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('pet-heaven-adoption_requests'))[0]).toMatchObject({
      petId: 'milo',
      memberId: mockMember.memberId,
      userId: mockUser.uid,
      landlordPermission: true,
      status: 'Submitted',
    });
    expect(JSON.parse(localStorage.getItem(draftKey))).toBeNull();
    const calendar = new URL(screen.getByRole('link', { name: /Add to calendar/ }).href);
    expect(calendar.hostname).toBe('calendar.google.com');
    expect(calendar.searchParams.get('dates')).toContain(futureDate().replaceAll('-', ''));
    expect(sendFormEmails).toHaveBeenCalledTimes(1);
    expect(sendFormEmails).toHaveBeenCalledWith(expect.objectContaining({
      formType: 'adopt',
      reference: expect.stringMatching(/^AD-\d{4}-[A-Z0-9]{4}$/),
      data: expect.objectContaining({
        applicantName: mockMember.fullName,
        email: mockUser.email,
        phone: mockMember.phone,
      }),
    }));
  }, 20000);

  it('keeps Release photo validation and valid submission working beside the support guide', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const previewUrl = 'blob:https://pet-heaven.test/photo';
    const createObjectURL = vi.fn(() => previewUrl);
    const revokeObjectURL = vi.fn();
    const BrowserUrl = URL;
    vi.stubGlobal('URL', Object.assign(class extends BrowserUrl {}, { createObjectURL, revokeObjectURL }));
    renderAt('/release');
    const photo = screen.getByLabelText(/Pet photo \(optional\)/);
    await user.upload(photo, new File(['text'], 'notes.txt', { type: 'text/plain' }));
    await user.click(screen.getByRole('button', { name: 'Send a support request' }));
    expect(screen.getByText('Choose an image file.')).toBeInTheDocument();
    expect(localStorage.getItem('pet-heaven-release_requests')).toBeNull();
    await user.upload(photo, new File([new Uint8Array(2 * 1024 * 1024)], 'too-big.png', { type: 'image/png' }));
    expect(screen.getByText('Each image must be smaller than 2 MB.')).toBeInTheDocument();
    expect(createObjectURL).not.toHaveBeenCalled();
    const selectedPhoto = new File(['image'], 'pet.png', { type: 'image/png' });
    await user.upload(photo, selectedPhoto);
    expect(await screen.findByRole('img', { name: 'Selected pet photo preview' })).toHaveAttribute('src', previewUrl);
    expect(createObjectURL).toHaveBeenCalledWith(selectedPhoto);
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
    await user.click(screen.getByLabelText('Mark this request as urgent'));
    await user.click(screen.getByLabelText(/I agree that the Pet Heaven team/));
    await user.click(screen.getByRole('button', { name: 'Send a support request' }));
    expect(await screen.findByRole('heading', { name: 'Your request reference' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('pet-heaven-release_requests'))[0]).toMatchObject({ petName: 'Clover', photoFileName: 'pet.png', photoFileType: 'image/png', urgent: true, status: 'New' });
    expect(revokeObjectURL).toHaveBeenCalledWith(previewUrl);
    expect(sendFormEmails).toHaveBeenCalledTimes(1);
    expect(sendFormEmails).toHaveBeenCalledWith(expect.objectContaining({
      formType: 'release',
      reference: expect.stringMatching(/^RL-\d{4}-[A-Z0-9]{4}$/),
      data: expect.objectContaining({ photoFileName: 'pet.png', photoFileSize: 5, urgent: true }),
    }));
    expect(sendFormEmails.mock.calls[0][0].data).not.toHaveProperty('petPhoto');
  }, 20000);
});

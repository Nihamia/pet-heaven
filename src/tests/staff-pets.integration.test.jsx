import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { getPetRecords } from '../services/petService.js';
import { changeMockUser, mockAuthService, mockDocuments, mockFirestoreSdk, resetAccountMocks, seedSignedInMember } from './accountMocks.js';

vi.mock('../services/authService.js', async () => (await import('./accountMocks.js')).mockAuthService);
vi.mock('../services/firebaseClient.js', async () => (await import('./accountMocks.js')).mockFirebaseClient);
vi.mock('../utils/imageProcessing.js', async (original) => ({
  ...await original(),
  processPetImage: vi.fn(async (file) => 'data:image/webp;base64,' + btoa(file.name)),
}));

const staff = { uid: 'uid-staff-pets', email: 'staff@example.com' };
const id = 'toast-cat-a123';
const mainPhoto = 'data:image/webp;base64,AAAA';
const extraPhoto = 'data:image/webp;base64,BBBB';
const timestamp = '2026-11-12T04:00:00.000Z';
const sample = {
  id, name: 'Toast', species: 'Cat', breed: 'Domestic Shorthair', gender: 'Female', ageYears: 2, ageMonths: 3,
  ageGroup: 'Adult', size: 'Small', colour: 'Ginger', temperament: ['Gentle'], story: 'Toast enjoys a quiet home.',
  vaccinated: true, sterilised: true, microchip: true, goodWithKids: false, goodWithPets: true, hdbFriendly: true,
  energyLevel: 'Low', healthNotes: '', specialNeeds: '', archived: false, source: 'staff',
  createdBy: staff.uid, createdAt: timestamp, updatedAt: timestamp, image: mainPhoto, imageAlt: 'Toast, a ginger cat',
  photoCredit: { type: 'stock', photographer: 'Test Photographer', source: 'Test Library', url: 'https://example.com/photos/toast' },
};

function renderAt(path) {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}><App /></MemoryRouter>,
  );
}

function seedStaff() {
  mockDocuments.set('admins/' + staff.uid, {});
  changeMockUser(staff);
}

function field(dialog, name, value, role = 'textbox') {
  fireEvent.change(dialog.getByRole(role, { name }), { target: { value } });
}

async function next(dialog) {
  const button = dialog.getByRole('button', { name: 'Next' });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}

describe('Staff pet management', () => {
  beforeEach(resetAccountMocks);

  it.each(['signed out', 'member'])('keeps staff actions hidden on Pets when %s', async (session) => {
    if (session === 'member') seedSignedInMember();
    renderAt('/pets');
    await screen.findByText('18 pet profiles');
    if (session === 'member') await waitFor(() => expect(mockFirestoreSdk.getDoc).toHaveBeenCalledWith('admins/uid-jamie'));
    expect(screen.queryByRole('button', { name: '+ Add pet' })).not.toBeInTheDocument();
    expect(mockAuthService.logout).not.toHaveBeenCalled();
  });

  it('shows staff navigation and uses the species filter when opening the public editor', async () => {
    seedStaff();
    renderAt('/pets');
    fireEvent.change(screen.getByRole('combobox', { name: 'Species' }), { target: { value: 'Cat' } });
    fireEvent.click(await screen.findByRole('button', { name: '+ Add pet' }));
    const dialog = within(await screen.findByRole('dialog', { name: 'Add pet' }));
    expect(dialog.getByRole('combobox', { name: 'Species' })).toHaveValue('Cat');
    fireEvent.click(dialog.getByRole('button', { name: 'Close dialog' }));
    const nav = within(screen.getByRole('navigation', { name: 'Main navigation' }));
    fireEvent.click(nav.getByRole('button', { name: 'My account' }));
    expect(await nav.findByRole('link', { name: 'Staff dashboard' })).toHaveAttribute('href', '/admin');
  });

  it('validates steps, preserves edits on Back, and publishes three photos without a reload', async () => {
    seedStaff();
    renderAt('/pets');
    fireEvent.click(await screen.findByRole('button', { name: '+ Add pet' }));
    const dialog = within(await screen.findByRole('dialog', { name: 'Add pet' }));
    await next(dialog);
    expect(dialog.getByText('Pet name is required.')).toBeInTheDocument();
    field(dialog, 'Pet name', 'Clover');
    field(dialog, 'Species', 'Dog', 'combobox');
    field(dialog, 'Breed', 'Terrier mix');
    field(dialog, 'Gender', 'Female', 'combobox');
    field(dialog, 'Age in years', '3', 'spinbutton');
    field(dialog, 'Size', 'Small', 'combobox');
    field(dialog, 'Colour', 'Brown');
    await next(dialog);
    await dialog.findByRole('heading', { name: 'Health and suitability' });
    fireEvent.click(dialog.getByRole('button', { name: 'Back' }));
    expect(dialog.getByRole('textbox', { name: 'Pet name' })).toHaveValue('Clover');
    await next(dialog);
    field(dialog, 'Energy level', 'Moderate', 'combobox');
    fireEvent.click(dialog.getByRole('checkbox', { name: 'Vaccinated' }));
    await next(dialog);
    await dialog.findByRole('heading', { name: 'Story and photos' });
    await next(dialog);
    expect(dialog.getByText('Add a main photo.')).toBeInTheDocument();
    field(dialog, 'Story', 'Clover likes quiet walks with her people.');
    fireEvent.click(dialog.getByRole('button', { name: 'Gentle' }));
    const photos = ['first', 'second', 'third'].map((name) => new File(['photo'], name + '.jpg', { type: 'image/jpeg' }));
    fireEvent.change(dialog.getByLabelText('Add photos'), { target: { files: photos } });
    expect(await dialog.findByRole('textbox', { name: 'Photo 3 alt text' })).toHaveValue('Clover, a brown dog');
    fireEvent.click(dialog.getByRole('button', { name: 'Set photo 2 as main photo' }));
    field(dialog, 'Photo 1 alt text', 'Clover walking in the grass');
    field(dialog, 'Photo credit', 'staff', 'combobox');
    await next(dialog);
    await dialog.findByRole('heading', { name: 'Review and publish' });
    expect(dialog.getByText(/Main photo · Clover walking/)).toBeInTheDocument();
    await waitFor(() => expect(dialog.getByRole('button', { name: 'Publish pet' })).toBeEnabled());
    fireEvent.click(dialog.getByRole('button', { name: 'Publish pet' }));

    expect(await screen.findByText('Clover was published.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Clover' })).toBeInTheDocument();
    const saved = [...mockDocuments.entries()].find(([path]) => path.startsWith('staff_pets/'))?.[1];
    expect(saved).toMatchObject({ id: expect.stringMatching(/^clover-[a-z0-9]{4}$/), archived: false, ageGroup: 'Adult',
      species: 'Dog', vaccinated: true, imageAlt: 'Clover walking in the grass' });
    expect(mockDocuments.get('pet_images/' + saved.id).gallery).toHaveLength(2);
  }, 10_000);

  it('merges and deduplicates published records before applying availability', async () => {
    mockDocuments.set('staff_pets/milo', { ...sample, id: 'milo', name: 'Staff Milo' });
    mockDocuments.set('staff_pets/' + id, sample);
    mockDocuments.set('staff_pets/hidden-x123', { ...sample, archived: true, name: 'Hidden Cat' });
    mockDocuments.set('pet_availability/' + id, { status: 'Reserved' });

    const { pets } = await getPetRecords();
    expect(pets.filter((pet) => pet.id === 'milo')).toEqual([expect.objectContaining({ name: 'Staff Milo' })]);
    expect(pets.find((pet) => pet.id === id)).toMatchObject({ status: 'Reserved' });
    expect(pets.some((pet) => pet.name === 'Hidden Cat')).toBe(false);
    expect(mockFirestoreSdk.where).toHaveBeenCalledWith('archived', '==', false);
    expect(mockFirestoreSdk.query).toHaveBeenCalledWith('staff_pets', { field: 'archived', operator: '==', value: false });
  });

  it('features available staff pets on Home and offers them in the Adopt selector', async () => {
    mockDocuments.set('staff_pets/' + id, sample);
    mockDocuments.set('staff_pets/reserved-cat-x123', { ...sample, id: 'reserved-cat-x123', name: 'Reserved Cat' });
    mockDocuments.set('staff_pets/hidden-cat-x123', { ...sample, id: 'hidden-cat-x123', name: 'Hidden Cat', archived: true });
    mockDocuments.set('pet_availability/reserved-cat-x123', { status: 'Reserved' });
    const home = renderAt('/');
    const featured = within(screen.getByRole('region', { name: 'Looking for their person' }));
    expect(await featured.findByRole('heading', { name: 'Toast' })).toBeInTheDocument();
    expect(featured.queryByRole('heading', { name: 'Reserved Cat' })).not.toBeInTheDocument();
    home.unmount();

    seedSignedInMember();
    renderAt('/adopt?petId=' + id);
    const select = await screen.findByRole('combobox', { name: 'Pet you would like to meet' });
    const options = within(select);
    expect(await options.findByRole('option', { name: /Toast/ })).toBeInTheDocument();
    expect(select).toHaveValue(id);
    expect(options.queryByRole('option', { name: /Reserved Cat|Hidden Cat/ })).not.toBeInTheDocument();
  });

  it('loads extra photos by ID only in the detail modal and uses their saved alt text', async () => {
    mockDocuments.set('staff_pets/' + id, sample);
    mockDocuments.set('pet_images/' + id, { gallery: [extraPhoto], alts: ['Toast under a chair'] });
    renderAt('/pets');
    const card = within((await screen.findByRole('heading', { name: 'Toast' })).closest('article'));
    expect(card.getByRole('img', { name: sample.imageAlt })).toBeInTheDocument();
    expect(mockFirestoreSdk.getDoc).not.toHaveBeenCalledWith('pet_images/' + id);
    fireEvent.click(card.getByRole('link', { name: /View details/ }));
    const dialog = within(await screen.findByRole('dialog', { name: 'Meet Toast' }));
    const thumb = await dialog.findByRole('button', { name: 'Show Toast photo 2' });
    fireEvent.click(thumb);
    expect(dialog.getAllByRole('img', { name: 'Toast under a chair' })).toHaveLength(2);
  });

  it('shows credits for published staff pets only', async () => {
    mockDocuments.set('staff_pets/' + id, sample);
    mockDocuments.set('staff_pets/hidden-x123', { ...sample, archived: true, name: 'Hidden Cat' });
    renderAt('/credits');
    const credits = within(screen.getByRole('region', { name: 'Staff-added pet photos' }));
    expect(await credits.findByText('Toast')).toBeInTheDocument();
    expect(credits.getByText(/Test Photographer · Test Library/)).toBeInTheDocument();
    expect(credits.getByRole('link', { name: 'View original photo source' })).toHaveAttribute('href', sample.photoCredit.url);
    expect(credits.queryByText('Hidden Cat')).not.toBeInTheDocument();
  });

  it('changes availability through the existing confirmation and archives and restores a staff pet', async () => {
    seedStaff();
    mockDocuments.set('staff_pets/' + id, sample);
    const dashboard = renderAt('/admin/pets');
    const row = within((await screen.findByRole('cell', { name: 'Toast' })).closest('tr'));
    expect(screen.getByRole('button', { name: '+ Add pet' })).toBeInTheDocument();
    fireEvent.click(row.getByRole('button', { name: 'Edit' }));
    expect(await screen.findByRole('textbox', { name: 'Pet name' })).toHaveValue('Toast');
    const edit = within(screen.getByRole('dialog', { name: 'Edit pet' }));
    fireEvent.click(edit.getByRole('button', { name: 'Close dialog' }));
    field(row, 'Pet availability status for Toast', 'Reserved', 'combobox');
    fireEvent.click(row.getByRole('button', { name: 'Change availability' }));
    const availability = within(await screen.findByRole('dialog', { name: 'Change availability' }));
    fireEvent.click(availability.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(mockDocuments.get('pet_availability/' + id)).toMatchObject({ status: 'Reserved' }));
    expect(mockDocuments.get('admin_notes/staff_pets_' + id).history[0]).toMatchObject({ fromStatus: 'Available', toStatus: 'Reserved' });

    fireEvent.click(row.getByRole('button', { name: 'Archive' }));
    const archive = within(await screen.findByRole('dialog', { name: 'Archive pet' }));
    fireEvent.click(archive.getByRole('button', { name: 'Archive pet' }));
    expect(await screen.findByText('Toast was archived.')).toBeInTheDocument();
    expect((await getPetRecords()).pets.some((pet) => pet.id === id)).toBe(false);
    fireEvent.click(row.getByRole('button', { name: 'Restore' }));
    const restore = within(await screen.findByRole('dialog', { name: 'Restore pet' }));
    fireEvent.click(restore.getByRole('button', { name: 'Restore pet' }));
    expect(await screen.findByText('Toast was restored.')).toBeInTheDocument();
    expect((await getPetRecords()).pets.find((pet) => pet.id === id)).toMatchObject({ status: 'Reserved' });
    dashboard.unmount();
  }, 10_000);
});

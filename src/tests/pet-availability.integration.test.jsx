import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { mockDocuments, mockFirestoreSdk, resetAccountMocks, seedSignedInMember } from './accountMocks.js';

vi.mock('../services/authService.js', async () => (await import('./accountMocks.js')).mockAuthService);
vi.mock('../services/firebaseClient.js', async () => (await import('./accountMocks.js')).mockFirebaseClient);

function renderAt(path) {
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}><App /></MemoryRouter>);
}

describe('Public pet availability', () => {
  beforeEach(() => {
    resetAccountMocks();
    mockDocuments.set('pet_availability/milo', { status: 'Adopted', adoptionRef: 'AD-2026-A123' });
  });

  it.each(['Reserved', 'Adopted'])('hides %s pets by default and disables them when shown', async (status) => {
    mockDocuments.set('pet_availability/milo', { status });
    renderAt('/pets');
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Milo' })).toBeNull());
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show reserved and adopted pets' }));
    const title = await screen.findByRole('heading', { name: 'Milo' });
    const card = within(title.closest('article'));
    expect(card.getByText(status)).toBeInTheDocument();
    expect(card.getByRole('button', { name: 'Not available' })).toBeDisabled();
    fireEvent.click(card.getByRole('link', { name: /View details/ }));
    const modal = within(await screen.findByRole('dialog'));
    expect(modal.getByText(status)).toBeInTheDocument();
    expect(modal.getByRole('button', { name: 'Not available' })).toBeDisabled();
  });

  it.each([['Reserved', 'This pet is currently reserved'], ['Adopted', 'This pet has already been adopted']])('blocks a %s pet on a direct adoption URL', async (status, heading) => {
    mockDocuments.set('pet_availability/milo', { status });
    seedSignedInMember();
    renderAt('/adopt?petId=milo');
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse other pets' })).toHaveAttribute('href', '/pets');
    expect(screen.queryByRole('button', { name: 'Review my enquiry' })).toBeNull();
    expect(mockFirestoreSdk.addDoc).not.toHaveBeenCalled();
  });

  it('keeps the existing pet source available when the overlay read fails', async () => {
    const getDocs = mockFirestoreSdk.getDocs.getMockImplementation();
    mockFirestoreSdk.getDocs.mockImplementation(async (target) => {
      if (target === 'pet_availability') throw new Error('Offline');
      return getDocs(target);
    });
    renderAt('/pets');
    expect(await screen.findByRole('heading', { name: 'Milo' })).toBeInTheDocument();
  });
});

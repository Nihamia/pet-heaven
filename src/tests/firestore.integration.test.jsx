import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { getAdoptionRequests, saveSubmission } from '../services/dataService.js';
import { sendFormEmails } from '../services/emailService.js';
import { getPetRecords } from '../services/petService.js';
import { mockDocuments, mockFirestoreSdk, mockMember, mockUser, resetAccountMocks, seedSignedInMember } from './accountMocks.js';

vi.mock('../services/firebaseClient.js', async () => (await import('./accountMocks.js')).mockFirebaseClient);
vi.mock('../services/authService.js', async () => (await import('./accountMocks.js')).mockAuthService);
vi.mock('../services/emailService.js', () => ({
  sendFormEmails: vi.fn(async () => ({ sent: true, acknowledgementSent: true, reason: '' })),
}));

function renderAdopt() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/adopt?petId=milo']}>
      <App />
    </MemoryRouter>,
  );
}

function futureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fillField(scope, label, value) {
  fireEvent.change(scope.getByLabelText(label), { target: { value } });
}

function fillApplication(application) {
  fillField(application, /Housing type/, 'Condominium');
  fillField(application, /Do you own or rent/, 'own');
  fillField(application, /Who lives in your household/, 'Two adults');
  fillField(application, /Your pet care experience/, 'I have cared for a family dog for several years.');
  fillField(application, /Typical work or study schedule/, 'mostly-home');
  fillField(application, /Why would you like to adopt/, 'I can offer a stable home and daily care for Milo.');
  fireEvent.click(application.getByLabelText(/I am ready to care/));
  fireEvent.click(application.getByLabelText(/I can plan for everyday/));
  fireEvent.click(application.getByLabelText(/I agree to an adoption conversation/));
  fillField(application, /Preferred interview date/, futureDate());
  fillField(application, /Preferred time/, '10:00');
}

describe('Firestore accounts and fallback', () => {
  beforeEach(resetAccountMocks);

  it('signs in from an empty browser store and submits an adoption for that account', async () => {
    const documentPath = `members/${mockUser.uid}`;
    mockDocuments.set(documentPath, mockMember);
    localStorage.clear();

    renderAdopt();
    const main = within(await screen.findByRole('main'));
    const login = await main.findByRole('button', { name: 'Log in' });
    fillField(main, /^Email address/, mockUser.email);
    fillField(main, /^Password/, 'GoodPass1!');
    fireEvent.click(login);

    const applicantName = await screen.findByLabelText(/Applicant name/);
    const application = within(applicantName.closest('form'));
    expect(mockFirestoreSdk.getDoc).toHaveBeenCalledWith(documentPath);
    expect(applicantName).toHaveValue(mockMember.fullName);
    expect(application.getByLabelText(/Phone number/)).toHaveValue(mockMember.phone);
    expect(application.getByLabelText('Email address')).toHaveValue(mockUser.email);
    expect(application.getByLabelText('Email address')).toHaveAttribute('readonly');
    expect(application.getByLabelText(/Pet you would like to meet/)).toHaveValue('milo');

    fillApplication(application);
    fireEvent.click(application.getByRole('button', { name: 'Review my enquiry' }));
    expect(application.getByRole('heading', { name: 'Check your enquiry before sending.' })).toBeInTheDocument();
    fireEvent.click(await application.findByRole('button', { name: 'Confirm and send enquiry' }));

    expect(await screen.findByText('Your form has been sent.')).toBeInTheDocument();
    expect(mockFirestoreSdk.addDoc).toHaveBeenCalledWith('adoption_requests', expect.objectContaining({
      userId: mockUser.uid,
      memberId: mockMember.memberId,
      applicantName: mockMember.fullName,
      email: mockUser.email,
      phone: mockMember.phone,
      petId: 'milo',
      status: 'Submitted',
    }));
    expect(sendFormEmails).toHaveBeenCalledWith(expect.objectContaining({
      formType: 'adopt',
      data: expect.objectContaining({ applicantName: mockMember.fullName, email: mockUser.email }),
    }));
  }, 10_000);

  it.each(['before write', 'during write', 'unknown'])('handles unavailable or permission-denied adoption submission %s', async (scenario) => {
    seedSignedInMember();
    renderAdopt();
    const application = within((await screen.findByLabelText(/Applicant name/)).closest('form'));
    fillApplication(application);
    fireEvent.click(application.getByRole('button', { name: 'Review my enquiry' }));
    if (scenario === 'before write') {
      mockDocuments.set('pet_availability/milo', { status: 'Reserved' });
    } else {
      mockFirestoreSdk.addDoc.mockImplementationOnce(async () => {
        if (scenario === 'during write') mockDocuments.set('pet_availability/milo', { status: 'Adopted' });
        throw Object.assign(new Error('Denied'), { code: 'permission-denied' });
      });
    }
    fireEvent.click(await application.findByRole('button', { name: 'Confirm and send enquiry' }));

    if (scenario === 'unknown') {
      expect(await screen.findByRole('alert')).toHaveTextContent('The pet may no longer be available.');
    } else {
      const title = scenario === 'before write' ? 'This pet is currently reserved' : 'This pet has already been adopted';
      expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Browse other pets' })).toHaveAttribute('href', '/pets');
    expect(mockFirestoreSdk.addDoc).toHaveBeenCalledTimes(scenario === 'before write' ? 0 : 1);
    expect(sendFormEmails).not.toHaveBeenCalled();
    expect(localStorage.getItem('pet-heaven-adoption_requests')).toBeNull();
  }, 10_000);

  it('returns only this account’s saved requests when Firestore is offline', async () => {
    const own = { userId: mockUser.uid, referenceId: 'AD-2026-MY01', createdAt: '2026-11-09T02:00:00.000Z' };
    localStorage.setItem('pet-heaven-adoption_requests', JSON.stringify([
      own,
      { ...own, userId: 'uid-someone-else', referenceId: 'AD-2026-NO01' },
      { referenceId: 'AD-2026-OLD1', createdAt: own.createdAt },
    ]));
    mockFirestoreSdk.getDocs.mockRejectedValueOnce(new Error('Offline'));
    await expect(getAdoptionRequests(mockUser.uid)).resolves.toEqual({ records: [own], source: 'local' });
    expect(mockFirestoreSdk.where).toHaveBeenCalledWith('userId', '==', mockUser.uid);
  });

  it('surfaces a denied adoption write without saving a local copy', async () => {
    mockFirestoreSdk.addDoc.mockRejectedValueOnce(Object.assign(new Error('Permission denied'), { code: 'permission-denied' }));
    await expect(saveSubmission('adoption_requests', {
      userId: mockUser.uid,
      memberId: mockMember.memberId,
      referenceId: 'AD-2026-MY01',
    })).rejects.toThrow();
    expect(localStorage.getItem('pet-heaven-adoption_requests')).toBeNull();
  });

  it('keeps the sample pet records available while Firestore is unavailable', async () => {
    mockFirestoreSdk.getDocs.mockRejectedValueOnce(new Error('Offline'));
    const result = await getPetRecords();
    expect(result.source).toBe('local');
    expect(result.pets).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'milo' })]));
  });
});

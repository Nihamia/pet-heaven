import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import * as adminCsv from '../utils/adminCsv.js';
import { changeMockUser, mockAdminFirestoreSdk, mockDocuments, resetAccountMocks } from './accountMocks.js';

vi.mock('../services/authService.js', async () => (await import('./accountMocks.js')).mockAuthService);
vi.mock('../services/firebaseClient.js', async () => (await import('./accountMocks.js')).mockFirebaseClient);

const staff = { uid: 'uid-dashboard-staff', email: 'staff@example.com' };
const date = '2026-11-09T02:00:00.000Z';

function renderAt(path) {
  mockDocuments.set('admins/' + staff.uid, {});
  changeMockUser(staff);
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function record(path, fields) {
  mockDocuments.set(path, { createdAt: date, ...fields });
}

describe('Read-only staff dashboard', () => {
  beforeEach(resetAccountMocks);

  it('counts the loaded records by type and role and shows recent activity in Singapore time', async () => {
    record('members/m1', { memberId: 'PH-ABCDE2', fullName: 'Jamie Tan', roles: ['volunteer', 'foster', 'adopter'], status: 'Active' });
    record('adoption_requests/a1', { referenceId: 'AD-2026-0001', status: 'Submitted', createdAt: '2026-11-10T12:00:00.000Z' });
    record('release_requests/r1', { referenceId: 'RL-2026-0001', status: 'New', urgent: true });
    record('contact_messages/c1', { referenceId: 'CT-2026-0001', status: 'Replied' });
    renderAt('/admin');

    const recent = within(await screen.findByRole('region', { name: 'Recent activity' }));
    expect(await recent.findByText(/AD-2026-0001/)).toBeInTheDocument();
    expect(recent.getAllByRole('listitem')[0]).toHaveTextContent('10 Nov 2026, 20:00 SGT');
    for (const [label, count] of [['Total members', 1], ['Volunteer members', 1], ['Foster members', 1], ['Adopters', 1], ['New adoption requests', 1], ['Urgent release requests', 1], ['New messages', 0]]) {
      expect(screen.getByText(label).parentElement.querySelector('strong')).toHaveTextContent(String(count));
    }
    expect(screen.getByRole('heading', { name: 'Members by role' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Requests by status' })).toBeInTheDocument();
    expect(mockAdminFirestoreSdk.orderBy).toHaveBeenCalledTimes(4);
    expect(mockAdminFirestoreSdk.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(mockAdminFirestoreSdk.limit.mock.calls).toEqual(Array(8).fill([500]));
  });

  it('filters members by role, search and status and opens labelled read-only answers', async () => {
    record('members/m1', {
      memberId: 'PH-ABCDE2', fullName: 'Jamie Tan', email: 'jamie@example.com', roles: ['volunteer'],
      roleDetails: { volunteer: { volunteerDays: ['Monday'], volunteerHours: 3, volunteerSkills: '<b>Animal care</b>' } },
    });
    record('members/m2', { memberId: 'PH-ABCDE3', fullName: 'Legacy Foster', roles: ['foster'], staffStatus: 'Onboarded' });
    renderAt('/admin/members');
    await screen.findByRole('cell', { name: 'Jamie Tan' });

    fireEvent.click(screen.getByRole('button', { name: 'Volunteer (1)' }));
    expect(screen.getByRole('button', { name: 'Volunteer (1)' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('columnheader', { name: 'Hours per week' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Monday' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Legacy Foster' })).toBeNull();

    const user = userEvent.setup();
    const view = screen.getByRole('button', { name: 'View details for PH-ABCDE2' });
    view.focus();
    await user.keyboard('{Enter}');
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByRole('heading', { name: 'Volunteer answers' })).toBeInTheDocument();
    expect(dialog.getByText('<b>Animal care</b>')).toBeInTheDocument();
    expect(dialog.queryByRole('button', { name: 'Save' })).toBeNull();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(view).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'All (2)' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ABCDE3' } });
    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'Onboarded' } });
    expect(screen.getByRole('cell', { name: 'Legacy Foster' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Jamie Tan' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Foster (1)' }));
    expect(screen.getByRole('columnheader', { name: 'Species preference' })).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: '—' }).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Filter by status'), { target: { value: 'New' } });
    expect(screen.getByText('No matching records')).toBeInTheDocument();
  });

  it('counts adopters and legacy profiles and exports roles and each adopter’s own request count', async () => {
    record('members/m1', { memberId: 'PH-ABCDE2', fullName: 'Adopter One', phone: '81234567', roles: ['adopter', 'donor'] });
    record('members/m2', { memberId: 'PH-ABCDE3', fullName: 'Adopter Two', roles: ['Adopter'] });
    record('members/m3', { memberId: 'PH-ABCDE4', fullName: 'Legacy Member' });
    record('adoption_requests/a1', { userId: 'm1', memberId: 'PH-ABCDE2' });
    record('adoption_requests/a2', { memberId: 'PH-ABCDE2' });
    record('adoption_requests/a3', { userId: 'another-member', memberId: 'PH-ABCDE2' });
    const download = vi.spyOn(adminCsv, 'downloadAdminCsv').mockImplementation(() => {});
    try {
      renderAt('/admin/members');
      fireEvent.click(await screen.findByRole('button', { name: 'Adopter (2)' }));
      expect(screen.getByRole('button', { name: 'Donor (1)' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Adoption requests' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Phone' })).toBeInTheDocument();
      const first = within(screen.getByRole('cell', { name: 'Adopter One' }).closest('tr'));
      expect(first.getByRole('cell', { name: '2' })).toBeInTheDocument();
      expect(first.getByRole('cell', { name: 'Adopter, Donor' })).toBeInTheDocument();
      const second = within(screen.getByRole('cell', { name: 'Adopter Two' }).closest('tr'));
      expect(second.getByRole('cell', { name: '0' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Export filtered CSV' }));
      expect(download).toHaveBeenCalledWith('pet-heaven-members', expect.arrayContaining(['Roles', 'Adoption requests']),
        expect.arrayContaining([expect.arrayContaining(['Adopter, Donor', 2])]));
      fireEvent.click(screen.getByRole('button', { name: 'No role (legacy) (1)' }));
      expect(screen.getByRole('cell', { name: 'Legacy Member' })).toBeInTheDocument();
      expect(screen.queryByRole('cell', { name: 'Adopter One' })).not.toBeInTheDocument();
    } finally {
      download.mockRestore();
    }
  });

  it('prioritises urgent dated releases and places invalid and missing dates last', async () => {
    record('release_requests/urgent', { referenceId: 'RL-2026-0001', petName: 'Urgent pet', urgent: true });
    record('release_requests/newer', { referenceId: 'RL-2026-0002', petName: 'Newer pet', createdAt: '2026-11-11T02:00:00.000Z' });
    record('release_requests/invalid', { referenceId: 'RL-2026-0003', petName: 'Invalid date pet', createdAt: 1234, urgent: true });
    mockDocuments.set('release_requests/undated', { referenceId: 'RL-2026-0004', petName: 'Undated pet' });
    renderAt('/admin/release');
    await screen.findByRole('cell', { name: 'Undated pet' });
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Urgent pet');
    expect(rows[0]).toHaveTextContent('URGENT');
    expect(rows[1]).toHaveTextContent('Newer pet');
    expect(rows[2]).toHaveTextContent('Invalid date pet');
    expect(rows[3]).toHaveTextContent('Undated pet');
    expect(within(rows[3]).getAllByRole('cell', { name: '—' }).length).toBeGreaterThan(0);
  });

  it('shows the interview slot and paginates messages ten at a time', async () => {
    record('adoption_requests/a1', { referenceId: 'AD-2026-0001', petName: 'Milo', preferredDate: '2026-11-15', preferredTime: '10:00', status: 'Submitted' });
    for (let index = 1; index <= 11; index += 1) {
      record('contact_messages/' + index, { referenceId: 'CT-2026-' + String(index).padStart(4, '0'), name: 'Applicant ' + index, subject: 'Enquiry ' + index });
    }
    renderAt('/admin/adoption');
    expect(await screen.findByRole('cell', { name: '2026-11-15 10:00' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'New' })).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('navigation', { name: 'Staff dashboard' })).getByRole('link', { name: 'Messages' }));
    const table = within(await screen.findByRole('table', { name: 'Messages' }));
    expect(table.getAllByRole('row')).toHaveLength(11);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(table.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(mockAdminFirestoreSdk.onSnapshot).toHaveBeenCalledTimes(6);
  });

  it('distinguishes pending, empty and permission-denied collections', async () => {
    const subscribe = mockAdminFirestoreSdk.onSnapshot.getMockImplementation();
    let onMessagesError;
    mockAdminFirestoreSdk.onSnapshot.mockImplementation((target, options, onNext, onError) => {
      if (target.collection === 'contact_messages') {
        onMessagesError = onError;
        return vi.fn();
      }
      return subscribe(target, options, onNext, onError);
    });
    renderAt('/admin/messages');
    expect(await screen.findByText('Loading messages')).toBeInTheDocument();

    await waitFor(() => expect(onMessagesError).toBeTypeOf('function'));
    await act(async () => onMessagesError({ code: 'permission-denied' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Permission denied.');
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Staff dashboard' })).getByRole('link', { name: 'Members' }));
    expect(await screen.findByText('No submissions yet')).toBeInTheDocument();
  });

  it('logs a call from a row and updates follow-up only after the batch succeeds', async () => {
    record('members/m1', { memberId: 'PH-ABCDE2', fullName: 'Jamie Tan', roles: ['volunteer'] });
    renderAt('/admin/members');
    fireEvent.click(await screen.findByRole('button', { name: 'Mark called' }));
    const dialog = within(await screen.findByRole('dialog', { name: 'Log a call' }));
    fireEvent.change(dialog.getByLabelText(/^Call outcome/), { target: { value: 'No answer' } });
    fireEvent.change(dialog.getByLabelText('Call note (optional)'), { target: { value: 'Try later' } });
    fireEvent.click(dialog.getByRole('button', { name: 'Save call' }));
    expect(await screen.findByText(/1 call attempt, last/)).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'New' })).toBeInTheDocument();
    expect(mockDocuments.get('admin_notes/members_m1').history[0]).toMatchObject({ outcome: 'No answer', note: 'Try later' });
    fireEvent.click(screen.getByRole('button', { name: 'View details for PH-ABCDE2' }));
    expect(within(await screen.findByRole('dialog')).getByText('Mark called · No answer')).toBeInTheDocument();
  });

  it('updates from the live listener and detaches every listener on unmount', async () => {
    const subscribe = mockAdminFirestoreSdk.onSnapshot.getMockImplementation();
    const stops = [];
    let onMessages;
    mockAdminFirestoreSdk.onSnapshot.mockImplementation((target, options, onNext, onError) => {
      if (target.collection === 'contact_messages') onMessages = onNext;
      const stop = subscribe(target, options, onNext, onError);
      stops.push(stop);
      return stop;
    });
    const view = renderAt('/admin/messages');
    expect(await screen.findByText('No submissions yet')).toBeInTheDocument();
    await act(async () => onMessages({
      metadata: { fromCache: false },
      docs: [{ id: 'later', data: () => ({ referenceId: 'CT-2026-0001', subject: 'New live message', createdAt: date }) }],
    }));
    expect(await screen.findByRole('cell', { name: 'New live message' })).toBeInTheDocument();
    view.unmount();
    expect(stops).toHaveLength(6);
    expect(stops.every((stop) => stop.mock.calls.length === 1)).toBe(true);
  });
});

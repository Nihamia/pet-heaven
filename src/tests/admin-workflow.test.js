import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardTabs } from '../data/adminDashboard.js';
import { workflowActions } from '../data/adminWorkflow.js';
import { saveWorkflowAction } from '../services/adminWorkflowService.js';
import { buildAdminCsv } from '../utils/adminCsv.js';
import { mockAdminFirestoreSdk, mockAdminTransactions, mockDocuments, resetAccountMocks } from './accountMocks.js';

vi.mock('../services/firebaseClient.js', async () => (await import('./accountMocks.js')).mockFirebaseClient);

const email = 'staff@example.com';
const uid = 'uid-staff';
const adoption = dashboardTabs.find(({ id }) => id === 'adoption');
const members = dashboardTabs.find(({ id }) => id === 'members');
const ref = 'AD-2026-A123';

function begin(tab, record, actionId, extra = {}) {
  mockDocuments.set(tab.collection + '/' + record.id, record);
  return saveWorkflowAction({ tab, record, actionId, email, uid, ...extra });
}

describe('Staff workflow', () => {
  beforeEach(resetAccountMocks);

  it.each([
    ['members', {}, ['call']],
    ['members', { staffStatus: 'Contacted' }, ['onboard', 'reopen']],
    ['members', { staffStatus: 'Onboarded' }, ['inactive', 'reopen']],
    ['members', { staffStatus: 'Inactive' }, ['reopen']],
    ['adoption', { status: 'Submitted' }, ['call', 'decline']],
    ['adoption', { status: 'Contacted' }, ['interview', 'decline', 'reopen']],
    ['adoption', { status: 'Interview scheduled' }, ['approve', 'decline', 'reopen']],
    ['adoption', { status: 'Approved' }, ['complete', 'decline', 'reopen']],
    ['adoption', { status: 'Completed' }, ['reopen']],
    ['release', {}, ['call']],
    ['release', { status: 'Contacted' }, ['handover', 'reopen']],
    ['release', { status: 'Handover scheduled' }, ['receive', 'reopen']],
    ['release', { status: 'Received' }, ['close', 'reopen']],
    ['messages', { status: 'New' }, ['reply']],
    ['messages', { status: 'Replied' }, ['close', 'reopen']],
  ])('only offers valid actions for %s in the current status', (tab, record, expected) => {
    expect(workflowActions(tab, record).map(({ id }) => id)).toEqual(expected);
  });

  it.each(['Reached', 'No answer', 'Left voicemail', 'Wrong number'])('logs a %s call in one transaction', async (outcome) => {
    const { entry } = await begin(members, { id: 'uid-a', status: 'Active' }, 'call', { outcome, note: 'Callback requested' });
    const transaction = mockAdminTransactions[0];
    const status = outcome === 'Reached' ? 'Contacted' : 'New';
    expect(entry).toEqual({ action: 'Mark called', fromStatus: 'New', toStatus: status, outcome, note: 'Callback requested', at: expect.any(String), by: email });
    expect(transaction.set).toHaveBeenCalledExactlyOnceWith('admin_notes/members_uid-a', {
      updatedAt: entry.at, updatedBy: email, history: { kind: 'arrayUnion', values: [entry] },
    }, { merge: true });
    if (outcome === 'Reached') {
      expect(transaction.update).toHaveBeenCalledExactlyOnceWith('members/uid-a', { staffStatus: 'Contacted', updatedAt: entry.at, updatedBy: email });
    } else expect(transaction.update).not.toHaveBeenCalled();
    expect(mockAdminFirestoreSdk.runTransaction).toHaveBeenCalledTimes(1);
    expect(mockDocuments.get('members/uid-a').status).toBe('Active');
  });

  it('reserves on approval, then marks the same pet adopted on completion', async () => {
    const record = { id: 'auto123', referenceId: ref, status: 'Interview scheduled', petId: 'milo' };
    const result = await begin(adoption, record, 'approve');
    const transaction = mockAdminTransactions[0];
    const metadata = { updatedAt: result.entry.at, updatedBy: email };
    expect(transaction.get.mock.calls).toEqual([['adoption_requests/auto123'], ['pet_availability/milo']]);
    expect(transaction.update).toHaveBeenCalledExactlyOnceWith('adoption_requests/auto123', { status: 'Approved', ...metadata });
    expect(transaction.set.mock.calls).toEqual([
      ['pet_availability/milo', { status: 'Reserved', adoptionRef: ref, updatedAt: result.entry.at, updatedBy: uid }],
      ['admin_notes/adoption_requests_auto123', { ...metadata, history: { kind: 'arrayUnion', values: [result.entry] } }, { merge: true }],
    ]);
    expect(mockAdminFirestoreSdk.runTransaction).toHaveBeenCalledTimes(1);

    await saveWorkflowAction({ tab: adoption, record: { ...record, status: 'Approved' }, actionId: 'complete', email, uid });
    expect(mockDocuments.get('pet_availability/milo')).toMatchObject({ status: 'Adopted', adoptionRef: ref });
    expect(mockDocuments.get('adoption_requests/auto123').status).toBe('Completed');
    expect(mockDocuments.get('admin_notes/adoption_requests_auto123').history).toHaveLength(2);
  });

  it.each(['Reserved', 'Adopted'])('refuses an approval when the pet is %s for another request', async (status) => {
    const first = { id: 'first', referenceId: ref, status: 'Interview scheduled', petId: 'milo' };
    await begin(adoption, first, 'approve');
    if (status === 'Adopted') {
      await saveWorkflowAction({ tab: adoption, record: { ...first, status: 'Approved' }, actionId: 'complete', email, uid });
    }
    const other = { ...first, id: 'other', referenceId: 'AD-2026-B123' };
    await expect(begin(adoption, other, 'approve')).rejects.toThrow('This pet is already ' + status.toLowerCase() + ' via ' + ref);
    expect(mockAdminTransactions.at(-1).set).not.toHaveBeenCalled();
    expect(mockDocuments.get('adoption_requests/other').status).toBe('Interview scheduled');
    expect(mockDocuments.get('pet_availability/milo')).toMatchObject({ status, adoptionRef: ref });
  });

  it.each(['decline', 'reopen'])('releases the holding reservation on %s', async (action) => {
    mockDocuments.set('pet_availability/milo', { status: 'Reserved', adoptionRef: ref });
    await begin(adoption, { id: 'auto123', referenceId: ref, status: 'Approved', petId: 'milo' }, action);
    expect(mockDocuments.get('pet_availability/milo')).toMatchObject({ status: 'Available', adoptionRef: ref });
    expect(mockDocuments.get('admin_notes/adoption_requests_auto123').history).toHaveLength(1);
    expect(mockAdminFirestoreSdk.runTransaction).toHaveBeenCalledTimes(1);
  });

  it('declines without releasing another request’s reservation', async () => {
    mockDocuments.set('pet_availability/milo', { status: 'Reserved', adoptionRef: 'AD-2026-B123' });
    await begin(adoption, { id: 'auto123', referenceId: ref, status: 'Approved', petId: 'milo' }, 'decline');
    expect(mockDocuments.get('pet_availability/milo')).toEqual({ status: 'Reserved', adoptionRef: 'AD-2026-B123' });
    expect(mockDocuments.get('adoption_requests/auto123').status).toBe('Declined');
    expect(mockAdminTransactions[0].set).toHaveBeenCalledTimes(1);
  });

  it('records a manual correction without changing the adoption status', async () => {
    const expected = { status: 'Adopted', adoptionRef: ref };
    mockDocuments.set('pet_availability/milo', expected);
    const record = { id: 'auto123', referenceId: ref, status: 'Completed', petId: 'milo' };
    await begin(adoption, record, 'change-availability', { manual: { status: 'Available', expected } });
    expect(mockAdminTransactions[0].update).not.toHaveBeenCalled();
    expect(mockDocuments.get('pet_availability/milo').status).toBe('Available');
    expect(mockDocuments.get('admin_notes/adoption_requests_auto123').history[0]).toMatchObject({
      action: 'Change availability: Adopted → Available', fromStatus: 'Completed', toStatus: 'Completed',
    });
  });

  it('rejects an invalid or stale action before writing', async () => {
    await expect(begin(adoption, { id: 'early', referenceId: ref, status: 'Submitted', petId: 'milo' }, 'complete'))
      .rejects.toThrow('That action is no longer available.');
    expect(mockAdminTransactions[0].set).not.toHaveBeenCalled();
  });

  it('emits a BOM, quotes separators and guards spreadsheet formulas', () => {
    expect(buildAdminCsv(['Name', 'Notes'], [['=1+1', 'Hi, "team"'], [' +1', 'Line one\nLine two'], ['-1', '@example']]))
      .toBe('\uFEFF"Name","Notes"\r\n"\'=1+1","Hi, ""team"""\r\n"\' +1","Line one\nLine two"\r\n"\'-1","\'@example"');
  });
});

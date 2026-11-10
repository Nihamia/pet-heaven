import { recordReference, recordStatus } from './adminDashboard.js';

export const callOutcomes = ['Reached', 'No answer', 'Left voicemail', 'Wrong number'];

const steps = {
  members: { New: [['call', 'Mark called', 'Contacted']], Contacted: [['onboard', 'Mark onboarded', 'Onboarded']], Onboarded: [['inactive', 'Mark inactive', 'Inactive', true]] },
  adoption: {
    New: [['call', 'Mark called', 'Contacted']],
    Contacted: [['interview', 'Interview scheduled', 'Interview scheduled']],
    'Interview scheduled': [['approve', 'Approve', 'Approved']],
    Approved: [['complete', 'Mark completed', 'Completed']],
  },
  release: {
    New: [['call', 'Mark called', 'Contacted']],
    Contacted: [['handover', 'Handover scheduled', 'Handover scheduled']],
    'Handover scheduled': [['receive', 'Mark received', 'Received']],
    Received: [['close', 'Close', 'Closed', true]],
  },
  messages: { New: [['reply', 'Mark replied', 'Replied']], Replied: [['close', 'Close', 'Closed', true]] },
};

export function workflowActions(tabId, record, availability) {
  const status = recordStatus(tabId, record);
  const actions = [...(Object.hasOwn(steps[tabId] ?? {}, status) ? steps[tabId][status] : [])];
  if (tabId === 'adoption') {
    const adopted = availability?.status === 'Adopted';
    const otherRequest = adopted && availability.adoptionRef && availability.adoptionRef !== recordReference(record);
    if (['New', 'Contacted', 'Interview scheduled', 'Approved'].includes(status)) {
      actions.push(otherRequest
        ? ['decline-adopted', 'Decline: pet adopted', 'Declined', true]
        : ['decline', 'Decline', 'Declined', true]);
    }
  }
  if (status !== 'New') actions.push(['reopen', 'Reopen', 'New', true]);
  return actions.map(([id, label, toStatus, confirm = false]) => ({ id, label, toStatus, confirm }));
}

export function noteDocumentId(collection, id) {
  return collection + '_' + id;
}

export function sortedHistory(note) {
  return (Array.isArray(note?.history) ? note.history : []).filter((entry) => entry && typeof entry.at === 'string')
    .slice().sort((first, second) => second.at.localeCompare(first.at));
}

const followUpDate = new Intl.DateTimeFormat('en-SG', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Singapore',
});

export function followUp(note) {
  const history = sortedHistory(note);
  const calls = history.filter(({ action }) => action === 'Mark called');
  const latest = history.find(({ action }) => action === 'Mark called' || action === 'Mark replied');
  if (!latest) return 'No contact yet';
  const date = new Date(latest.at);
  const time = Number.isFinite(date.getTime()) ? followUpDate.format(date).replace(',', '') : 'date unavailable';
  if (latest.action === 'Mark replied') return 'Replied ' + time;
  if (latest.outcome === 'Reached') return 'Contacted ' + time;
  return calls.length + (calls.length === 1 ? ' call attempt, last ' : ' call attempts, last ') + time;
}

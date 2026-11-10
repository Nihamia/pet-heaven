import { findMemberRole, getMemberRoles, roles } from './roles.js';

export const dashboardTabs = [
  { id: 'members', collection: 'members', title: 'Members', name: 'fullName', statuses: ['New', 'Contacted', 'Onboarded', 'Inactive'] },
  { id: 'adoption', collection: 'adoption_requests', title: 'Adoption requests', name: 'applicantName', statuses: ['New', 'Contacted', 'Interview scheduled', 'Approved', 'Completed', 'Declined'] },
  { id: 'release', collection: 'release_requests', title: 'Release requests', name: 'ownerName', statuses: ['New', 'Contacted', 'Handover scheduled', 'Received', 'Closed'] },
  { id: 'messages', collection: 'contact_messages', title: 'Messages', name: 'name', statuses: ['New', 'Replied', 'Closed'] },
];

export const roleFilters = [
  ...roles.map((role) => ({ id: role.id, label: role.emailLabel })),
  { id: 'other', label: 'No role (legacy)' },
];

const roleFields = {
  volunteer: ['volunteerDays', 'volunteerHours'],
  foster: ['fosterHousingType', 'fosterSpecies', 'fosterDuration'],
  donor: ['donorPledgeType', 'donorAmountRange', 'donorPetId'],
};

const detailFields = {
  members: [['Consent', ['ageConfirmed', 'dataConsent', 'newsletter']]],
  adoption: [
    ['Pet and home', ['petName', 'petId', 'housingType', 'tenure', 'landlordPermission', 'householdMembers', 'otherPets']],
    ['Care plan', ['experience', 'workSchedule', 'reason']],
    ['Commitments and consent', ['commitmentLongTerm', 'commitmentFinancial', 'interviewConsent']],
    ['Requested interview', ['preferredDate', 'preferredTime']],
  ],
  release: [
    ['Pet details', ['petName', 'petSpecies', 'petBreed', 'petAgeYears', 'petGender', 'petSize', 'petColour', 'vaccinated', 'sterilised', 'microchip', 'healthNotes', 'behaviourNotes']],
    ['Release request', ['urgent', 'reason', 'reasonDetails', 'handoverDate', 'consent']],
    ['Photo information', ['photoFileName', 'photoFileType', 'photoFileSize']],
  ],
  messages: [['Message', ['subject', 'message']]],
};

const fieldLabels = {
  userId: 'Account UID',
  memberId: 'Member ID',
  petId: 'Pet ID',
  photoFileSize: 'Photo size (bytes)',
  ageConfirmed: 'At least 18 years old',
  newsletter: 'Newsletter consent',
};

const recordTime = new Intl.DateTimeFormat('en-SG', {
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
  timeZone: 'Asia/Singapore',
});

export function timeValue(value) {
  return typeof value === 'string' ? Date.parse(value) : NaN;
}

export function formatRecordTime(value) {
  const timestamp = timeValue(value);
  return Number.isFinite(timestamp) ? recordTime.format(timestamp) + ' SGT' : '—';
}

export function compareDates(first, second, oldest = false) {
  const a = timeValue(first.createdAt);
  const b = timeValue(second.createdAt);
  if (!Number.isFinite(a)) return Number.isFinite(b) ? 1 : 0;
  if (!Number.isFinite(b)) return -1;
  return oldest ? a - b : b - a;
}

export function displayValue(value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    const labels = value.filter((item) => typeof item === 'string' && item.trim());
    return labels.length ? labels.join(', ') : '—';
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return typeof value === 'string' && value.trim() ? value : '—';
}

export function recordStatus(tabId, record) {
  const status = tabId === 'members' ? record.staffStatus : record.status;
  if (typeof status !== 'string' || !status.trim() || (tabId === 'adoption' && status === 'Submitted')) return 'New';
  return status;
}

export function recordReference(record) {
  return record.referenceId || record.memberId || record.referenceNo;
}

export function matchesRole(record, roleId) {
  if (roleId === 'all') return true;
  const selected = getMemberRoles(record.roles);
  if (roleId === 'other') return selected.length === 0;
  return selected.some(({ id }) => id === roleId);
}

function roleLabels(record) {
  const selected = Array.isArray(record.roles) ? record.roles : [];
  return selected.map((id) => findMemberRole(id)?.emailLabel || id);
}

// Use the request owner UID when present. Older requests may only carry a member ID.
export function memberAdoptionCounter({ records, loading, error }) {
  if (loading || error) return () => null;
  const byUid = new Map();
  const byMemberId = new Map();
  for (const { userId, memberId } of records) {
    if (userId) byUid.set(userId, (byUid.get(userId) ?? 0) + 1);
    else if (memberId) byMemberId.set(memberId, (byMemberId.get(memberId) ?? 0) + 1);
  }
  return (member) => (byUid.get(member.id) ?? 0) + (byMemberId.get(member.memberId) ?? 0);
}

export function recordName(tab, record) {
  return displayValue(record[tab.name]);
}

export function filterRecords(tab, records, { search, status, role, sort }) {
  const term = search.trim().toLowerCase();
  return records.filter((record) => {
    const fields = [record[tab.name], record.email, recordReference(record), record.petName, record.subject];
    return (status === 'all' || recordStatus(tab.id, record) === status)
      && (tab.id !== 'members' || matchesRole(record, role))
      && (!term || fields.some((value) => typeof value === 'string' && value.toLowerCase().includes(term)));
  }).sort((a, b) => {
    if (Number.isFinite(timeValue(a.createdAt)) !== Number.isFinite(timeValue(b.createdAt))) return compareDates(a, b);
    if (sort === 'name') return String(recordName(tab, a)).localeCompare(String(recordName(tab, b))) || compareDates(a, b);
    if (sort === 'urgent') {
      const byUrgency = Number(b.urgent === true) - Number(a.urgent === true);
      if (byUrgency) return byUrgency;
    }
    return compareDates(a, b, sort === 'oldest');
  });
}

export function tableColumns(tab, roleId, adoptionCount) {
  const columns = [
    { key: 'reference', label: 'Reference', read: recordReference },
    { key: 'name', label: tab.id === 'members' ? 'Member' : 'Name', read: (record) => record[tab.name] },
    { key: 'email', label: 'Email', read: (record) => record.email },
  ];

  if (tab.id === 'members') {
    columns.push({ key: 'roles', label: 'Roles', read: roleLabels });
    if (roleId === 'adopter') {
      columns.push({ key: 'phone', label: 'Phone', read: (record) => record.phone });
      columns.push({ key: 'adoptionCount', label: 'Adoption requests', read: adoptionCount });
    }
    const role = roles.find((item) => item.id === roleId);
    if (role && roleFields[roleId]) {
      for (const field of role.fields.filter((item) => roleFields[roleId].includes(item.name))) {
        columns.push({ key: field.name, label: field.label, read: (record) => record.roleDetails?.[roleId]?.[field.name] });
      }
    }
  } else if (tab.id === 'messages') {
    columns.push({ key: 'subject', label: 'Subject', read: (record) => record.subject });
  } else {
    columns.push({ key: 'pet', label: 'Pet', read: (record) => record.petName });
    if (tab.id === 'adoption') {
      columns.push({ key: 'interview', label: 'Requested interview', read: (record) => [record.preferredDate, record.preferredTime].filter(Boolean).join(' ') });
    }
  }
  return columns;
}

function labelFor(key) {
  return fieldLabels[key] || (key[0].toUpperCase() + key.slice(1)).replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function recordDetails(tab, record, adoptionCount) {
  const groups = [
    { title: 'Contact', fields: [['Name', record[tab.name]], ['Email', record.email], ['Phone', record.phone]] },
    ...detailFields[tab.id].map(([title, keys]) => ({ title, fields: keys.map((key) => [labelFor(key), record[key]]) })),
  ];
  if (tab.id === 'members') {
    groups[0].fields.push(['Address', record.address]);
    if (matchesRole(record, 'adopter')) groups[0].fields.push(['Adoption requests', adoptionCount(record)]);
    groups.splice(1, 0, { title: 'Roles', fields: [['Selected roles', roleLabels(record)]] });
    for (const role of roles) {
      if (!role.fields.length || (!matchesRole(record, role.id) && !record.roleDetails?.[role.id])) continue;
      groups.push({
        title: role.emailLabel + ' answers',
        fields: role.fields.map((field) => [field.label, record.roleDetails?.[role.id]?.[field.name]]),
      });
    }
  }
  groups.push({
    title: 'Record information',
    fields: [
      ['Reference', recordReference(record)],
      ...(tab.id === 'adoption' ? [['Member ID', record.memberId]] : []),
      ['Workflow status', recordStatus(tab.id, record)],
      ...(tab.id === 'members' ? [['Account status', record.status]] : []),
      ['Created', formatRecordTime(record.createdAt)],
      ['Last updated', formatRecordTime(record.updatedAt)],
      ['Updated by', record.updatedBy],
    ],
  });
  return groups;
}

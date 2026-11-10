import { getMemberRoles, roles } from '../data/roles.js';

const workSchedules = {
  'mostly-home': 'Mostly at home',
  'part-time-away': 'Away part of the day',
  'full-time-away': 'Away most weekdays',
  varies: 'Varies week to week',
};

const releaseReasons = {
  housing: 'Housing or landlord change',
  financial: 'Financial pressure',
  health: 'Health or caregiving needs',
  behaviour: 'Behaviour support',
  family: 'Family or life change',
  other: 'Another reason',
};

function formatValue(value) {
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function section(heading, rows) {
  return { heading, rows: rows.map(([label, value]) => [label, formatValue(value)]).filter(([, value]) => value !== '') };
}

function subjectText(value) {
  return formatValue(value).replace(/[\r\n\t]+/g, ' ');
}

export function buildContactEmail(data, reference) {
  return {
    subject: `[Pet Heaven] Message ${reference}: ${subjectText(data.subject)}`,
    adminRows: [
      section('Contact details', [['Name', data.name], ['Email', data.email], ['Phone', data.phone]]),
      section('Message', [['Subject', data.subject], ['Message', data.message]]),
    ],
    ackIntro: 'We have received your message. Our team will reply within 3 working days.',
    nextSteps: [
      'Keep this reference for follow-up.',
      'Watch your inbox for a reply from the Pet Heaven team.',
    ],
  };
}

export function buildJoinEmail(data, reference) {
  const selectedRoles = getMemberRoles(data.roles);
  const orderedRoles = roles.filter((role) => selectedRoles.includes(role));
  const roleLabels = orderedRoles.map((role) => role.emailLabel);
  const includesAdopter = orderedRoles.some(({ id }) => id === 'adopter');
  return {
    subject: `[Pet Heaven] New member ${reference} (${roleLabels.join(', ')})`,
    adminRows: [
      section('Member details', [
        ['Member ID', reference],
        ['Full name', data.fullName],
        ['Email', data.email],
        ['Phone', data.phone],
        ['Home address', data.address],
        ['Age confirmation (18 or older)', data.ageConfirmed],
        ['Data consent', data.dataConsent],
        ['Newsletter opt-in', data.newsletter],
      ]),
      section('Support interests', [['Selected roles', roleLabels]]),
      ...orderedRoles.filter(({ fields }) => fields.length > 0).map((role) => section(`${role.emailLabel} details`, role.fields.map((field) => [field.label, data.roleDetails?.[role.id]?.[field.name]]))),
    ],
    ackIntro: 'Welcome to Pet Heaven! We have received your membership registration.',
    nextSteps: [
      ...(!includesAdopter ? ['Log in to your member area to view your membership card and start an adoption enquiry.'] : []),
      ...orderedRoles.flatMap((role) => role.emailNextSteps ?? [role.emailNextStep]),
    ],
  };
}

export function buildAdoptEmail(data, reference) {
  return {
    subject: `[Pet Heaven] New adoption request ${reference}: ${subjectText(data.petName)}`,
    adminRows: [
      section('Applicant details', [
        ['Member ID', data.memberId],
        ['Applicant name', data.applicantName],
        ['Email', data.email],
        ['Phone', data.phone],
      ]),
      section('Pet and household', [
        ['Pet name', data.petName],
        ['Pet ID', data.petId],
        ['Housing type', data.housingType],
        ['Own or rent', data.tenure === 'own' ? 'Own' : data.tenure === 'rent' ? 'Rent' : data.tenure],
        ['Landlord permission', data.tenure === 'rent' ? data.landlordPermission : null],
        ['Household members', data.householdMembers],
        ['Other pets', data.otherPets],
      ]),
      section('Care plan', [
        ['Pet care experience', data.experience],
        ['Work or study schedule', workSchedules[data.workSchedule] ?? data.workSchedule],
        ['Adoption reason', data.reason],
        ['Long-term care commitment', data.commitmentLongTerm],
        ['Care costs commitment', data.commitmentFinancial],
        ['Interview and home visit consent', data.interviewConsent],
      ]),
      section('Interview preference', [
        ['Preferred date', data.preferredDate],
        ['Preferred time', data.preferredTime],
      ]),
    ],
    ackIntro: 'We have received your adoption enquiry. Your requested interview slot will be confirmed only after the team contacts you.',
    nextSteps: [
      'Keep this reference for follow-up.',
      'Wait for the team to contact you to confirm the interview arrangements.',
    ],
  };
}

export function buildReleaseEmail(data, reference) {
  const urgent = data.urgent === true;
  return {
    subject: `[Pet Heaven] ${urgent ? 'URGENT release request' : 'New release request'} ${reference}: ${subjectText(data.petName)}`,
    adminRows: [
      section('Owner details', [['Owner name', data.ownerName], ['Email', data.email], ['Phone', data.phone]]),
      section('Pet details', [
        ['Pet name', data.petName],
        ['Species', data.petSpecies],
        ['Breed or best guess', data.petBreed],
        ['Age in years', data.petAgeYears],
        ['Gender', data.petGender],
        ['Size', data.petSize],
        ['Colour', data.petColour],
        ['Vaccinated', data.vaccinated],
        ['Sterilised', data.sterilised],
        ['Microchip number', data.microchip],
        ['Health notes', data.healthNotes],
        ['Behaviour and routine', data.behaviourNotes],
      ]),
      section('Support request', [
        ['Reason for reaching out', releaseReasons[data.reason] ?? data.reason],
        ['Situation details', data.reasonDetails],
        ['Preferred handover date', data.handoverDate],
        ['Urgent assistance requested', urgent],
        ['Consent to contact', data.consent],
      ]),
      section('Photo information', [
        ['Photo filename', data.photoFileName],
        ['Photo size (bytes)', formatValue(data.photoFileName) ? data.photoFileSize : null],
      ]),
    ],
    ackIntro: 'We have received your pet release support request. Our team will review it before deciding whether we can accept your pet.',
    nextSteps: [
      'Keep this reference for follow-up.',
      'Wait for the team to contact you before making handover arrangements.',
    ],
  };
}

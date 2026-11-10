import { maxLength, required } from '../utils/validators.js';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const roles = [
  {
    id: 'adopter',
    title: 'Adopter',
    selectionLabel: 'Adopter',
    emailLabel: 'Adopter',
    icon: '🐾',
    summary: "I'd like to adopt a pet. Browse our cats and dogs, then submit an adoption request once you have registered.",
    selectionField: 'interestAdopter',
    fields: [],
    emailNextSteps: [
      'Browse available pets.',
      'Open a pet’s profile and choose Adopt.',
      'Staff will contact you to arrange an interview.',
    ],
  },
  {
    id: 'volunteer',
    anchor: 'volunteer',
    title: 'Volunteer',
    selectionLabel: 'Volunteer',
    emailLabel: 'Volunteer',
    icon: '✦',
    summary: 'Give your time to help animals settle, support events, and welcome visitors.',
    timeCommitment: 'Agree on shifts that fit your availability.',
    requirements: ['Be at least 18 years old.', 'Attend an orientation before your first shift.', 'Follow the team’s animal care and safety guidance.'],
    steps: ['Share the days you can help and the skills you bring.', 'Meet the team for a short orientation.', 'Agree on an initial shift and a role that suits you.'],
    faqs: [
      { title: 'Can I volunteer with no shelter experience?', content: 'Yes. Tell us what you enjoy doing and we’ll discuss suitable duties at orientation.' },
      { title: 'Can I volunteer on weekends?', content: 'Share your available days when you join. The team will match them to upcoming shifts where possible.' },
    ],
    applyLabel: 'Apply as a volunteer',
    emailNextStep: 'The team will contact you about volunteer opportunities and an orientation.',
    selectionField: 'interestVolunteer',
    fields: [
      { name: 'volunteerDays', label: 'Availability days', type: 'days', options: days, required: true },
      { name: 'volunteerHours', label: 'Hours per week', type: 'number', min: 1, max: 40, required: true },
      { name: 'volunteerSkills', label: 'Skills you can share', type: 'textarea', maxLength: 500, hint: 'Optional. Tell us about animal care, events, photography, or other skills.' },
    ],
  },
  {
    id: 'foster',
    anchor: 'foster',
    title: 'Foster a pet',
    selectionLabel: 'Foster a pet',
    emailLabel: 'Foster',
    icon: '⌂',
    summary: 'Offer a temporary home while a cat or dog waits for the right permanent family.',
    timeCommitment: 'Daily care during an agreed placement.',
    requirements: ['Have a safe indoor space where a pet can settle.', 'Discuss the placement with everyone in your household.', 'Be available for check-ins and agreed care appointments.'],
    steps: ['Tell us about your home and the animals you can care for.', 'Discuss a suitable match and a care plan with the team.', 'Welcome the pet for the agreed period and share updates.'],
    faqs: [
      { title: 'Can I foster if I already have pets?', content: 'Tell us about your pets and how you could separate them during introductions. The team considers each household and placement individually.' },
      { title: 'How long is a foster placement?', content: 'The duration depends on the pet and your availability. Agree on the expected period with the team before taking a pet home.' },
    ],
    applyLabel: 'Apply as a foster carer',
    emailNextStep: 'The team will contact you to discuss fostering requirements and availability.',
    selectionField: 'interestFoster',
    fields: [
      { name: 'fosterHousingType', label: 'Housing type', type: 'select', options: ['HDB flat', 'Condominium', 'Landed house', 'Other'], required: true },
      { name: 'fosterOtherPets', label: 'Other pets at home', type: 'textarea', maxLength: 300, hint: 'Optional. Include species and any care or introduction needs.' },
      { name: 'fosterSpecies', label: 'Species preference', type: 'select', options: ['Cats', 'Dogs', 'Either'], required: true },
      { name: 'fosterDuration', label: 'Available fostering duration', type: 'select', options: ['Under one month', '1 to 3 months', 'Over three months', 'Flexible'], required: true },
      { name: 'fosterSpace', label: 'Describe the space you can offer', type: 'textarea', maxLength: 500, required: true },
    ],
  },
  {
    id: 'donor',
    anchor: 'donate',
    title: 'Donate and sponsor',
    selectionLabel: 'Donor / Sponsor',
    emailLabel: 'Donor',
    icon: '♡',
    summary: 'Pledge support for everyday supplies or express interest in sponsoring a pet.',
    timeCommitment: 'Choose a one-off, monthly, or in-kind pledge.',
    requirements: ['Choose the kind of support you’d like to offer.', 'Share an estimated amount or the value of the supplies.', 'Arrange any contribution directly with the team.'],
    steps: ['Share your pledge preferences in the registration form.', 'The team confirms what the shelter needs and arranges any follow-up.', 'Keep in touch to hear how supporters help the animals.'],
    faqs: [
      { title: 'Can I donate supplies?', content: 'Yes. Choose an in-kind pledge and the team will follow up about current needs and drop-off arrangements.' },
      { title: 'Does a pledge collect a payment?', content: 'The form records your interest. The team will contact you to discuss any contribution.' },
    ],
    applyLabel: 'Apply as a donor or sponsor',
    emailNextStep: 'Look out for information from the team about ways to support Pet Heaven.',
    selectionField: 'interestDonor',
    fields: [
      {
        name: 'donorPledgeType', label: 'Pledge type', type: 'select', required: true,
        options: [{ value: 'monthly', label: 'Monthly' }, { value: 'one-off', label: 'One-off' }, { value: 'in-kind', label: 'In-kind' }],
      },
      { name: 'donorAmountRange', label: 'Amount range', type: 'select', options: ['Under S$25', 'S$25 to S$49', 'S$50 to S$99', 'S$100 or more', 'Not sure yet'], required: true, hint: 'For supplies, choose their estimated value.' },
      { name: 'donorPetId', label: 'Pet to sponsor (optional)', type: 'pet', hint: 'Choose a pet if you have one in mind.' },
    ],
  },
];

// Accept the stored role ID and the display label used by some Firestore records.
export function findMemberRole(value) {
  return roles.find(({ id, emailLabel }) => value === id || value === emailLabel);
}

export function getMemberRoles(values) {
  return Array.isArray(values) ? [...new Set(values.map(findMemberRole).filter(Boolean))] : [];
}

export const requiredRoleMessage = 'Choose at least one option, or Adopter if you only want to adopt.';

export function roleFieldOptions(field, pets = []) {
  return field.type === 'pet' ? pets.map((pet) => ({ value: pet.id, label: `${pet.name} (${pet.species})` })) : field.options ?? [];
}

export function initialRoleValues(preselectedRole = '') {
  return Object.fromEntries(roles.flatMap((role) => [
    [role.selectionField, role.id === preselectedRole],
    ...role.fields.map((field) => [field.name, field.type === 'days' ? [] : '']),
  ]));
}

export function selectedRoleIds(values) {
  return roles.filter((role) => values[role.selectionField]).map((role) => role.id);
}

function findOption(field, value, pets) {
  return roleFieldOptions(field, pets).find((option) => (typeof option === 'string' ? option : option.value) === value);
}

function validateRoleField(field, value, pets) {
  const missing = field.required && required(value, field.label);
  if (missing) return missing;
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return '';
  if (field.type === 'days' && (!Array.isArray(value) || value.some((day) => !field.options.includes(day)))) return 'Choose days from the available options.';
  if (field.type === 'number') {
    const number = Number(value);
    return Number.isInteger(number) && number >= field.min && number <= field.max
      ? '' : `Enter a whole number from ${field.min} to ${field.max}.`;
  }
  if ((field.type === 'select' || field.type === 'pet') && !findOption(field, value, pets)) return 'Choose an available option.';
  return field.maxLength ? maxLength(String(value).trim(), field.maxLength) : '';
}

export function validateRoleAnswers(values, pets) {
  const selected = roles.filter((role) => values[role.selectionField]);
  if (!selected.length) return { interests: requiredRoleMessage };
  return Object.fromEntries(selected.flatMap((role) => role.fields.map((field) => [field.name, validateRoleField(field, values[field.name], pets)])));
}

// Group selected answers by role for the private profile and administrator email.
export function collectRoleAnswers(values, pets) {
  const selected = roles.filter((role) => values[role.selectionField] && role.fields.length);
  return Object.fromEntries(selected.map((role) => {
    const answers = role.fields.map((field) => {
      const value = values[field.name];
      const option = findOption(field, value, pets);
      if (typeof option === 'object') return [field.name, option.label];
      if (field.type === 'number') return [field.name, Number(value)];
      return [field.name, typeof value === 'string' ? value.trim() : value];
    });
    return [role.id, Object.fromEntries(answers)];
  }));
}

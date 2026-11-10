import { maxLength, required } from '../utils/validators.js';

export const speciesOptions = ['Dog', 'Cat'];
const genders = ['Female', 'Male'];
const sizes = ['Small', 'Medium', 'Large'];
const energyLevels = ['Low', 'Moderate', 'High'];
const healthLabels = {
  vaccinated: 'Vaccinated', sterilised: 'Sterilised', microchip: 'Microchipped',
  goodWithKids: 'Good with children', goodWithPets: 'Good with other pets', hdbFriendly: 'HDB-friendly',
};
export const temperamentOptions = ['Affectionate', 'Calm', 'Curious', 'Friendly', 'Gentle', 'Independent', 'Playful', 'Shy'];
export const creditTypes = { staff: 'Taken by Pet Heaven staff', stock: 'Stock photo' };
export const basicsFields = [
  { name: 'name', label: 'Pet name', maxLength: 80 },
  { name: 'species', label: 'Species', options: speciesOptions },
  { name: 'breed', label: 'Breed', maxLength: 100 },
  { name: 'gender', label: 'Gender', options: genders },
  { name: 'ageYears', label: 'Age in years', type: 'number', min: 0, max: 40 },
  { name: 'ageMonths', label: 'Additional months', type: 'number', min: 0, max: 11 },
  { name: 'size', label: 'Size', options: sizes },
  { name: 'colour', label: 'Colour', maxLength: 80 },
];
export const healthFields = Object.entries(healthLabels).map(([name, label]) => ({ name, label }));
export const careFields = [
  { name: 'energyLevel', label: 'Energy level', options: energyLevels },
  { name: 'healthNotes', label: 'Health notes', type: 'textarea', maxLength: 600, optional: true },
  { name: 'specialNeeds', label: 'Special needs', type: 'textarea', maxLength: 600, optional: true },
];
export const creditFields = [
  { name: 'photographer', label: 'Photographer', maxLength: 120 },
  { name: 'source', label: 'Photo source', maxLength: 120 },
  { name: 'url', label: 'Original photo URL', maxLength: 512 },
];

export function initialStaffPetValues(pet, species, photos) {
  const values = Object.fromEntries([...basicsFields, ...careFields].map(({ name }) => [name, String(pet?.[name] ?? '')]));
  return {
    ...values,
    species: pet?.species ?? species,
    ageMonths: String(pet?.ageMonths ?? 0),
    ...Object.fromEntries(healthFields.map(({ name }) => [name, pet?.[name] ?? false])),
    temperament: pet?.temperament ?? [],
    story: pet?.story ?? '',
    photos,
    creditType: pet?.photoCredit?.type ?? '',
    ...Object.fromEntries(creditFields.map(({ name }) => [name, pet?.photoCredit?.[name] ?? ''])),
  };
}

export function isPhotoSourceUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function fieldError(field, value) {
  const text = value.trim();
  const missing = field.optional ? '' : required(text, field.label);
  if (missing) return missing;
  if (field.options && !field.options.includes(text)) return 'Choose an available option.';
  if (field.type === 'number' && (!Number.isInteger(Number(text)) || Number(text) < field.min || Number(text) > field.max)) {
    return 'Enter a whole number between ' + field.min + ' and ' + field.max + '.';
  }
  return field.maxLength ? maxLength(text, field.maxLength) : '';
}

export function validateStaffPetStep(step, values) {
  const fields = step === 0 ? basicsFields : step === 1 ? careFields : [];
  const errors = Object.fromEntries(fields.map((field) => [field.name, fieldError(field, values[field.name])]));
  if (step !== 2) return errors;

  errors.story = required(values.story.trim(), 'Story') || maxLength(values.story.trim(), 600);
  if (!values.photos.length) errors.photos = 'Add a main photo.';
  else if (values.photos.some(({ alt }) => !alt.trim() || alt.trim().length > 160)) {
    errors.photos = 'Give each photo alt text of up to 160 characters.';
  }
  if (!Object.hasOwn(creditTypes, values.creditType)) errors.creditType = 'Choose a photo credit type.';
  if (values.creditType === 'stock') {
    for (const field of creditFields) errors[field.name] = fieldError(field, values[field.name]);
    if (!errors.url && !isPhotoSourceUrl(values.url.trim())) errors.url = 'Enter a valid http or https photo URL.';
  }
  return errors;
}

export function buildStaffPetFields(values) {
  const { ageYears, ageMonths, creditType, photographer, source, url, photos } = values;
  const months = Number(ageYears) * 12 + Number(ageMonths);
  return {
    ...Object.fromEntries([...basicsFields, ...careFields].map(({ name }) => [name, values[name].trim()])),
    ...Object.fromEntries(healthFields.map(({ name }) => [name, values[name]])),
    ageYears: Number(ageYears),
    ageMonths: Number(ageMonths),
    ageGroup: months < 12 ? 'Baby' : months < 24 ? 'Young' : months < 96 ? 'Adult' : 'Senior',
    temperament: values.temperament,
    story: values.story.trim(),
    image: photos[0].src,
    imageAlt: photos[0].alt.trim(),
    photoCredit: creditType === 'staff'
      ? { type: 'staff', photographer: '', source: '', url: '' }
      : { type: 'stock', photographer: photographer.trim(), source: source.trim(), url: url.trim() },
  };
}

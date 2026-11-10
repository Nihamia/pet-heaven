export const petAvailabilityStatuses = ['Available', 'Reserved', 'Adopted'];

export function isUnavailablePetStatus(status) {
  return status === 'Reserved' || status === 'Adopted';
}

// Format the sample pet age in years and months without showing unnecessary decimals.
export function petAgeInMonths(ageYears, ageMonths = 0) {
  return Math.max(0, Math.round(Number(ageYears) * 12 + Number(ageMonths)));
}

export function formatPetAge(ageYears, ageMonths) {
  const totalMonths = petAgeInMonths(ageYears, ageMonths);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) return `${months} ${months === 1 ? 'month' : 'months'}`;
  if (months === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`;
}

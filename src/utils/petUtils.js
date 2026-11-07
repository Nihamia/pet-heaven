// Format the sample pet age in years and months without showing unnecessary decimals.
export function formatPetAge(ageYears) {
  const totalMonths = Math.max(0, Math.round(Number(ageYears) * 12));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) return `${months} ${months === 1 ? 'month' : 'months'}`;
  if (months === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`;
}

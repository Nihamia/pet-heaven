// Create a short, human-readable reference for membership and form submissions.
export function makeReference(prefix) {
  const randomValue = new Uint16Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(randomValue);
  } else {
    randomValue[0] = Math.floor(Math.random() * 0x10000);
  }
  return `${prefix}-${new Date().getFullYear()}-${randomValue[0].toString(16).toUpperCase().padStart(4, '0')}`;
}

// Compare a date-only input with the local calendar day without timezone rollover surprises.
export function isFutureDate(value) {
  if (!value) return false;
  const selectedDate = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Number.isFinite(selectedDate.getTime()) && selectedDate > today;
}

// Format a saved result so success screens can explain whether data went to Firestore or local storage.
export function describeSaveLocation(result) {
  if (result?.firestorePending) return 'A browser copy is saved while the Firestore connection is still pending.';
  return result?.firestoreSaved
    ? 'A copy was saved to Firestore and this browser.'
    : 'This submission is saved in this browser only.';
}

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
  if (result?.firestoreSaved) {
    return result.browserSaved === false
      ? 'A copy was saved to Firestore.'
      : 'A copy was saved to Firestore and this browser.';
  }
  return 'This submission is saved in this browser only.';
}

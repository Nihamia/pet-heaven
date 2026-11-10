// Create a short, human-readable reference for form submissions.
export function makeReference(prefix) {
  const randomValue = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(randomValue);
  } else {
    randomValue[0] = Math.floor(Math.random() * 0x100000000);
  }
  const suffix = (randomValue[0] % (36 ** 4)).toString(36).toUpperCase().padStart(4, '0');
  return `${prefix}-${new Date().getFullYear()}-${suffix}`;
}

const memberAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeMemberReference() {
  const values = new Uint8Array(6);
  globalThis.crypto.getRandomValues(values);
  const suffix = Array.from(values, (value) => memberAlphabet[value % memberAlphabet.length]).join('');
  return 'PH-' + suffix;
}

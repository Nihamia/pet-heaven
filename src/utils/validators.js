const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const singaporePhonePattern = /^(?:\+65)?[689]\d{7}$/;
const imageMimePattern = /^image\//i;
const maxImageBytes = 2 * 1024 * 1024;

function asFiles(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// Return a message when a value is blank or an unchecked required boolean.
export function required(value, label = 'This field') {
  const isBlank = value === null
    || value === undefined
    || value === false
    || (typeof value === 'string' && value.trim() === '')
    || (Array.isArray(value) && value.length === 0);
  return isBlank ? `${label} is required.` : '';
}

// Check that an email address has a basic name@domain format.
export function email(value) {
  if (!value) return '';
  return emailPattern.test(String(value).trim()) ? '' : 'Enter a valid email address.';
}

// Accept eight-digit Singapore mobile or landline numbers, optionally prefixed with +65.
export function singaporePhone(value) {
  if (!value) return '';
  const normalized = String(value).replace(/[\s()-]/g, '');
  return singaporePhonePattern.test(normalized) ? '' : 'Enter an 8-digit Singapore number beginning with 6, 8, or 9, optionally with +65.';
}

// Require the applicant to be at least eighteen years old.
export function minAge18(value) {
  if (value === '' || value === null || value === undefined) return '';
  const age = Number(value);
  if (!Number.isFinite(age)) return 'Enter your age as a number.';
  return age >= 18 ? '' : 'You must be at least 18 years old.';
}

// Require at least eight characters, upper and lower case, a number, and a symbol.
export function passwordStrength(value) {
  if (!value) return '';
  const isStrong = value.length >= 8
    && /[a-z]/.test(value)
    && /[A-Z]/.test(value)
    && /\d/.test(value)
    && /[^A-Za-z0-9]/.test(value);
  return isStrong ? '' : 'Use at least 8 characters with upper and lower case letters, a number, and a symbol.';
}

// Check whether a confirmation value matches its password.
export function passwordMatch(value, password) {
  if (!value && !password) return '';
  return value === password ? '' : 'Passwords do not match.';
}

// Enforce a minimum number of characters when a value is present.
export function minLength(value, minimum) {
  if (!value) return '';
  return String(value).length >= minimum ? '' : `Enter at least ${minimum} characters.`;
}

// Enforce a maximum number of characters.
export function maxLength(value, maximum) {
  if (!value) return '';
  return String(value).length <= maximum ? '' : `Enter no more than ${maximum} characters.`;
}

// Confirm that each uploaded file is an image.
export function imageFileType(value) {
  const files = asFiles(value);
  if (files.length === 0) return '';
  return files.every((file) => imageMimePattern.test(file?.type ?? ''))
    ? ''
    : 'Choose an image file.';
}

// Keep each uploaded image strictly under the supplied byte limit, defaulting to 2 MB.
export function imageFileSize(value, limitBytes = maxImageBytes) {
  const files = asFiles(value);
  if (files.length === 0) return '';
  return files.every((file) => Number(file?.size) < limitBytes)
    ? ''
    : `Each image must be smaller than ${Math.floor(limitBytes / (1024 * 1024))} MB.`;
}

// Validate both image MIME type and size for optional or required image uploads.
export function imageFile(value, limitBytes = maxImageBytes) {
  return imageFileType(value) || imageFileSize(value, limitBytes);
}

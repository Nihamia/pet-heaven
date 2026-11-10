import { useRef, useState } from 'react';
import { sendFormEmails } from '../services/emailService.js';

const cooldownKey = 'pet-heaven-last-form-attempt';
const cooldownMs = 30_000;

// Retry the saved submission's email without writing another form record.
export default function useAdminSubmission(formType, options = {}) {
  const [localSubmission, setLocalSubmission] = useState(null);
  const { submission = localSubmission, setSubmission = setLocalSubmission } = options;
  const [isRetrying, setIsRetrying] = useState(false);
  const retryInProgress = useRef(false);
  const honeypotRef = useRef(null);
  const lastAttempt = useRef(null);

  function beginSubmission() {
    if (honeypotRef.current?.value) {
      throw new Error('We could not accept this submission. Reload the page and try again.');
    }

    const now = Date.now();
    let previous = lastAttempt.current;
    try {
      const stored = window.localStorage.getItem(cooldownKey);
      if (stored !== null && Number.isFinite(Number(stored))) previous = Number(stored);
    } catch {
      // Use the current form's timestamp if browser storage is disabled.
    }

    if (previous !== null && previous <= now) {
      const remaining = cooldownMs - (now - previous);
      if (remaining > 0) {
        const seconds = Math.ceil(remaining / 1000);
        throw new Error(`Please wait ${seconds} ${seconds === 1 ? 'second' : 'seconds'} before trying again.`);
      }
    }

    lastAttempt.current = now;
    try {
      window.localStorage.setItem(cooldownKey, String(now));
    } catch {
      // The current form still enforces the cooldown.
    }
  }

  async function deliver(saved, data, reference) {
    const email = await sendFormEmails({
      formType,
      data: { ...data, submittedAt: saved.createdAt },
      reference,
    });
    const result = { saved, email, data, reference };
    setSubmission(result);
    return result;
  }

  async function retry() {
    if (!submission || submission.email.sent || retryInProgress.current) return;
    try {
      beginSubmission();
    } catch (error) {
      setSubmission({ ...submission, retryError: error.message });
      return;
    }

    retryInProgress.current = true;
    setIsRetrying(true);
    try {
      await deliver(submission.saved, submission.data, submission.reference);
    } finally {
      retryInProgress.current = false;
      setIsRetrying(false);
    }
  }

  return { submission, beginSubmission, honeypotRef, deliver, retry, isRetrying, clearSubmission: () => setSubmission(null) };
}

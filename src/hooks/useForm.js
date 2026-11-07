import { useRef, useState } from 'react';

// Manage a form's values, validation state, submission lifecycle, and reset behavior.
export default function useForm({ initialValues = {}, validate = () => ({}), onSubmit, onError } = {}) {
  const [values, setValues] = useState(() => ({ ...initialValues }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submitInProgress = useRef(false);

  function getValidationErrors(nextValues) {
    const validationResult = validate(nextValues) ?? {};
    return Object.fromEntries(Object.entries(validationResult).filter(([, message]) => Boolean(message)));
  }

  function handleChange(event) {
    const { name, type, value, checked, files } = event.target;
    if (!name) return;

    let nextValue = value;
    if (type === 'checkbox') nextValue = checked;
    if (type === 'file') nextValue = files?.length > 1 ? Array.from(files) : files?.[0] ?? null;

    const nextValues = { ...values, [name]: nextValue };
    setValues(nextValues);
    if (touched[name]) setErrors(getValidationErrors(nextValues));
  }

  function handleBlur(event) {
    const { name } = event.target;
    if (!name) return;

    setTouched((current) => ({ ...current, [name]: true }));
    const nextErrors = getValidationErrors(values);
    setErrors((current) => {
      const updated = { ...current };
      if (nextErrors[name]) updated[name] = nextErrors[name];
      else delete updated[name];
      return updated;
    });
  }

  async function submitForm(event, callback = onSubmit) {
    event?.preventDefault?.();
    const nextErrors = getValidationErrors(values);
    setErrors(nextErrors);
    const allTouched = {};
    Object.keys(values).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0 || !callback || submitInProgress.current) return false;

    submitInProgress.current = true;
    setIsSubmitting(true);
    try {
      await callback(values);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
      onError?.(error);
      return false;
    } finally {
      submitInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  function handleSubmit(eventOrCallback) {
    if (typeof eventOrCallback === 'function') {
      return (event) => submitForm(event, eventOrCallback);
    }
    return submitForm(eventOrCallback, onSubmit);
  }

  function reset(nextValues = initialValues) {
    setValues({ ...nextValues });
    setErrors({});
    setTouched({});
    setSubmitError('');
    setIsSubmitting(false);
    submitInProgress.current = false;
  }

  return { values, errors, touched, handleChange, handleBlur, handleSubmit, reset, isSubmitting, submitError };
}

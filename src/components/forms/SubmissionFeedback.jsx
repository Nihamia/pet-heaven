import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import { describeSaveLocation } from '../../utils/formUtils.js';

// Explain whether a submission was saved and whether its administrator email was sent.
export default function SubmissionFeedback({ result, error, onRetry, isRetrying }) {
  if (error) {
    return <Alert className="submission-feedback" tone="error" title="We couldn't save your form">{error}</Alert>;
  }
  if (!result) return null;

  const emailWasSent = Boolean(result.email?.sent);
  return (
    <Alert
      className="submission-feedback"
      tone={emailWasSent ? 'success' : 'error'}
      title={emailWasSent ? 'Your form has been sent.' : 'Your form is saved, but the email was not sent.'}
    >
      <p>{describeSaveLocation(result.saved)}</p>
      <p>{emailWasSent
        ? 'Your email was accepted for delivery to the Pet Heaven team.'
        : 'Please retry the email. Your saved form and reference will be used again.'}</p>
      <p><strong>Reference:</strong> {result.reference}</p>
      {emailWasSent && !result.email.acknowledgementSent && (
        <small>Your confirmation email could not be sent.</small>
      )}
      {result.retryError && !isRetrying && <p role="status">{result.retryError}</p>}
      {!emailWasSent && onRetry && (
        <Button loading={isRetrying} onClick={onRetry} size="small" variant="outline">
          {isRetrying ? 'Sending email…' : 'Retry email'}
        </Button>
      )}
    </Alert>
  );
}

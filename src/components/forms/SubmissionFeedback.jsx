import Alert from '../ui/Alert.jsx';
import { describeSaveLocation } from '../../utils/formUtils.js';

// Explain whether a submission was saved and whether its administrator email was sent.
export default function SubmissionFeedback({ result, error, referenceId }) {
  if (error) {
    return <Alert className="submission-feedback" tone="error" title="We couldn't save your form">{error}</Alert>;
  }
  if (!result) return null;

  const emailWasSent = Boolean(result.email?.sent);
  return (
    <Alert
      className="submission-feedback"
      tone={emailWasSent ? 'success' : 'warning'}
      title={emailWasSent ? 'Your form has been sent.' : 'Your form is saved, but the email was not sent.'}
    >
      <p>{describeSaveLocation(result.saved)}</p>
      <p>{emailWasSent
        ? 'The Pet Heaven team has received your message by email.'
        : 'The email notification could not be sent. Keep your reference below so you can follow up with the team.'}</p>
      {referenceId && <p><strong>Reference:</strong> {referenceId}</p>}
    </Alert>
  );
}

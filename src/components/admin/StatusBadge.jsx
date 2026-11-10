import Badge from '../ui/Badge.jsx';

const tones = {
  New: 'teal',
  Contacted: 'warning',
  'Interview scheduled': 'warning',
  'Handover scheduled': 'warning',
  Approved: 'success',
  Onboarded: 'success',
  Completed: 'success',
  Received: 'success',
  Declined: 'error',
};

export default function StatusBadge({ status }) {
  return <Badge tone={tones[status] || 'neutral'}>{status}</Badge>;
}

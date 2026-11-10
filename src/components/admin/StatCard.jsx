import Card from '../ui/Card.jsx';
import { Skeleton } from '../ui/Spinner.jsx';

export default function StatCard({ label, value, loading }) {
  return (
    <Card className="admin-stat">
      <p>{label}</p>
      {loading ? <Skeleton height="2rem" width="4rem" /> : <strong>{value ?? '—'}</strong>}
    </Card>
  );
}

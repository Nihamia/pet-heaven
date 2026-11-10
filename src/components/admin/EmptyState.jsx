import Card from '../ui/Card.jsx';

export default function EmptyState({ title, description }) {
  return (
    <Card className="admin-empty">
      <h3>{title}</h3>
      <p>{description}</p>
    </Card>
  );
}

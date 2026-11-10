import { matchesRole, roleFilters } from '../../data/adminDashboard.js';
import Button from '../ui/Button.jsx';
import FormField from '../forms/FormField.jsx';

export default function FilterBar({ tab, records, filters, onChange }) {
  const statuses = [...new Set([...tab.statuses, ...filters.extraStatuses])];
  const sorts = [{ label: 'Newest first', value: 'newest' }, { label: 'Oldest first', value: 'oldest' }, { label: 'Name A to Z', value: 'name' }];
  if (tab.id === 'release') sorts.unshift({ label: 'Urgent first', value: 'urgent' });
  const fieldChange = ({ target }) => onChange(target.name, target.value);

  return (
    <div className="admin-filters">
      {tab.id === 'members' && (
        <div className="admin-role-filters" role="group" aria-label="Filter members by role">
          {[{ id: 'all', label: 'All' }, ...roleFilters].map(({ id, label }) => (
            <Button
              aria-pressed={filters.role === id}
              key={id}
              onClick={() => onChange('role', id)}
              size="small"
              type="button"
              variant={filters.role === id ? 'primary' : 'outline'}
            >
              {label} ({records.filter((record) => matchesRole(record, id)).length})
            </Button>
          ))}
        </div>
      )}
      <div className="admin-filter-fields">
        <FormField label={'Search ' + tab.title.toLowerCase()} name="search" onChange={fieldChange} placeholder="Name, email or reference" type="search" value={filters.search} />
        <FormField label="Filter by status" name="status" onChange={fieldChange} options={[{ label: 'All statuses', value: 'all' }, ...statuses]} type="select" value={filters.status} />
        <FormField label="Sort by" name="sort" onChange={fieldChange} options={sorts} type="select" value={filters.sort} />
      </div>
    </div>
  );
}

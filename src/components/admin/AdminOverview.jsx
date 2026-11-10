import { useState } from 'react';
import { useAdminWorkflow } from '../../context/AdminWorkflowContext.jsx';
import { compareDates, dashboardTabs, displayValue, formatRecordTime, matchesRole, recordReference, recordStatus, roleFilters } from '../../data/adminDashboard.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { Skeleton } from '../ui/Spinner.jsx';
import DetailPanel from './DetailPanel.jsx';
import EmptyState from './EmptyState.jsx';
import StatCard from './StatCard.jsx';

function Chart({ title, bars, loading, unavailable }) {
  const largest = Math.max(1, ...bars.map(({ count }) => count));
  return (
    <Card className="admin-chart">
      <h3>{title}</h3>
      {loading ? <Skeleton height="5rem" /> : unavailable ? <p>Data is unavailable.</p> : (
        <ul className="admin-bars">
          {bars.map(({ label, count }) => (
            <li key={label}>
              <div><span>{label}</span><strong>{count}</strong></div>
              <div aria-hidden="true" className="admin-bar-track">
                <div className="admin-bar" style={{ width: (count / largest * 100) + '%' }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function AdminOverview({ adoptionCount, collections }) {
  const [selection, setSelection] = useState(null);
  const workflow = useAdminWorkflow();
  const adoptedCount = Object.values(workflow.pets).filter((pet) => pet.status === 'Adopted').length;
  const members = collections.members;
  const release = collections.release;
  const loading = dashboardTabs.some(({ id }) => collections[id].loading);
  const unavailable = dashboardTabs.filter(({ id }) => collections[id].error);
  const hasPartialReads = dashboardTabs.some(({ id }) => collections[id].missingReadFailed);
  const roleBars = roleFilters.map(({ id, label }) => ({
    id, label, count: members.records.filter((record) => matchesRole(record, id)).length,
  }));
  const requestTabs = dashboardTabs.filter(({ id }) => id !== 'members');
  const statusCounts = new Map(requestTabs.flatMap(({ statuses }) => statuses).map((status) => [status, 0]));
  for (const tab of requestTabs) {
    for (const record of collections[tab.id].records) {
      const status = recordStatus(tab.id, record);
      statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
    }
  }
  const recent = dashboardTabs.flatMap((tab) => collections[tab.id].records.map((record) => ({ tab, record })))
    .sort((a, b) => compareDates(a.record, b.record)).slice(0, 10);
  const selectedRecord = selection && collections[selection.tab.id].records.find(({ id }) => id === selection.id);

  return (
    <section aria-labelledby="admin-overview-title" aria-busy={loading}>
      <h2 id="admin-overview-title">Overview</h2>
      <p className="admin-summary">Counts reflect the records loaded in this dashboard. Members can hold more than one role.</p>
      {loading && <p role="status">Loading dashboard records…</p>}
      {unavailable.length > 0 && <Alert tone="error">{unavailable.map(({ id, title }) => title + ': ' + collections[id].error).join(' ')}</Alert>}
      {hasPartialReads && <Alert tone="warning">Some undated records could not be checked.</Alert>}
      <div className="admin-stats">
        {dashboardTabs.map((tab) => (
          <StatCard
            key={tab.id}
            label={'New ' + (tab.id === 'members' ? 'member registrations' : tab.title.toLowerCase())}
            loading={collections[tab.id].loading}
            value={collections[tab.id].error ? null : collections[tab.id].records.filter((record) => recordStatus(tab.id, record) === 'New').length}
          />
        ))}
        <StatCard label="Total members" loading={members.loading} value={members.error ? null : members.records.length} />
        {roleBars.filter(({ id }) => id !== 'other').map(({ id, label, count }) => (
          <StatCard key={label} label={id === 'adopter' ? 'Adopters' : label + ' members'} loading={members.loading} value={members.error ? null : count} />
        ))}
        <StatCard label="Pets adopted" value={workflow.availabilityUnavailable ? null : adoptedCount} />
        <StatCard label="Urgent release requests" loading={release.loading} value={release.error ? null : release.records.filter(({ urgent }) => urgent === true).length} />
      </div>
      <div className="admin-charts">
        <Chart bars={roleBars} loading={members.loading} title="Members by role" unavailable={Boolean(members.error)} />
        <Chart
          bars={[...statusCounts].map(([label, count]) => ({ label, count }))}
          loading={requestTabs.some(({ id }) => collections[id].loading)}
          title="Requests by status"
          unavailable={requestTabs.every(({ id }) => collections[id].error)}
        />
      </div>
      <section aria-labelledby="admin-recent-title" className="admin-recent">
        <h3 id="admin-recent-title">Recent activity</h3>
        {recent.length > 0 ? (
          <ul>
            {recent.map(({ tab, record }) => (
              <li key={tab.id + '/' + record.id}>
                <div>
                  <strong>{tab.title} · {displayValue(recordReference(record))}</strong>
                  <span>{formatRecordTime(record.createdAt)}</span>
                </div>
                <Button
                  aria-label={'View details for ' + (recordReference(record) || record.id)}
                  onClick={() => setSelection({ tab, id: record.id })}
                  size="small"
                  type="button"
                  variant="outline"
                >
                  View
                </Button>
              </li>
            ))}
          </ul>
        ) : loading ? <Skeleton height="3rem" /> : <EmptyState description="Recent records appear as they become available." title="No activity to show" />}
      </section>
      {selectedRecord && <DetailPanel adoptionCount={adoptionCount} onClose={() => setSelection(null)} record={selectedRecord} tab={selection.tab} />}
    </section>
  );
}

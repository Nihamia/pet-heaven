import { displayValue, formatRecordTime, recordReference, recordStatus } from '../../data/adminDashboard.js';
import Badge from '../ui/Badge.jsx';
import { useAdminWorkflow } from '../../context/AdminWorkflowContext.jsx';
import { followUp } from '../../data/adminWorkflow.js';
import { isUnavailablePetStatus } from '../../utils/petUtils.js';
import QuickActions from './QuickActions.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function DataTable({ tab, columns, records, onOpen }) {
  const workflow = useAdminWorkflow();
  return (
    <div className="admin-table-scroll" aria-label={tab.title + ' table'} role="region" tabIndex={0}>
      <table className="admin-table">
        <caption className="visually-hidden">{tab.title}</caption>
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
            <th scope="col">Status</th>
            <th scope="col">Created (SGT)</th>
            <th scope="col">Follow-up</th>
            <th scope="col">Actions</th>
            <th scope="col">Details</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} onClick={() => onOpen(record.id)}>
              {columns.map((column) => (
                <td key={column.key}>
                  {displayValue(column.read(record))}
                  {tab.id === 'adoption' && column.key === 'pet' && (
                    <div className="admin-pet-status"><Badge tone={isUnavailablePetStatus(workflow.petFor(record.petId)?.status) ? 'warning' : 'success'}>{workflow.petFor(record.petId)?.status || 'Available'}</Badge></div>
                  )}
                </td>
              ))}
              <td>
                <div className="admin-statuses">
                  <StatusBadge status={recordStatus(tab.id, record)} />
                  {tab.id === 'release' && record.urgent === true && <Badge tone="error">URGENT</Badge>}
                </div>
              </td>
              <td>{formatRecordTime(record.createdAt)}</td>
              <td>{workflow.notesUnavailable ? '—' : followUp(workflow.noteFor(tab, record.id))}</td>
              <td><QuickActions record={record} tab={tab} /></td>
              <td>
                <Button aria-label={'View details for ' + (recordReference(record) || record.id)} size="small" type="button" variant="outline">
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

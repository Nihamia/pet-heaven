import { useState } from 'react';
import { useAdminWorkflow } from '../../context/AdminWorkflowContext.jsx';
import { displayValue, formatRecordTime, recordDetails, recordReference, recordStatus } from '../../data/adminDashboard.js';
import { sortedHistory, workflowActions } from '../../data/adminWorkflow.js';
import { isUnavailablePetStatus } from '../../utils/petUtils.js';
import Alert from '../ui/Alert.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import FormField from '../forms/FormField.jsx';
import Modal from '../ui/Modal.jsx';
import QuickActions from './QuickActions.jsx';
import AvailabilityControl from './AvailabilityControl.jsx';

function RecordWorkflow({ tab, record }) {
  const workflow = useAdminWorkflow();
  const savedNote = workflow.noteFor(tab, record.id);
  const [draft, setDraft] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [noteFeedback, setNoteFeedback] = useState(null);
  const availability = workflow.petFor(record.petId);
  const status = recordStatus(tab.id, record);
  const choices = workflowActions(tab.id, record, availability).filter((action) => action.toStatus !== status);
  const petStatus = availability?.status ?? 'Available';
  const canChangeAvailability = tab.id === 'adoption' && record.petId && recordReference(record);
  const selected = choices.find(({ id }) => id === nextStatus);
  const otherAdoption = tab.id === 'adoption' && isUnavailablePetStatus(petStatus)
    && availability.adoptionRef && availability.adoptionRef !== recordReference(record);
  const text = draft ?? savedNote?.text ?? '';
  const history = sortedHistory(savedNote);

  async function save(event) {
    event.preventDefault();
    setNoteFeedback(null);
    try {
      await workflow.saveNote(tab, record, text);
      setDraft(null);
      setNoteFeedback({ tone: 'success', message: 'Staff note saved.' });
    } catch (error) {
      setNoteFeedback({ tone: 'error', message: error.message });
    }
  }

  return (
    <section className="admin-detail-group">
      <h3>Workflow</h3>
      {workflow.notice && <Alert tone={workflow.notice.tone}>{workflow.notice.message}</Alert>}
      {tab.id === 'adoption' && (
        <p>Pet availability <Badge tone={isUnavailablePetStatus(petStatus) ? 'warning' : 'success'}>{petStatus}</Badge></p>
      )}
      {otherAdoption && <Alert tone="warning">This pet is already {petStatus.toLowerCase()} via {availability.adoptionRef}.</Alert>}
      <QuickActions record={record} tab={tab} />
      {canChangeAvailability && <AvailabilityControl record={record} tab={tab} />}
      <div className="admin-actions admin-status-control">
        <FormField disabled={workflow.pending} label="Change status" name="staffStatus" onChange={(event) => setNextStatus(event.target.value)} options={choices.map(({ id, toStatus }) => ({ value: id, label: toStatus }))} type="select" value={selected ? nextStatus : ''} />
        <Button disabled={!selected || workflow.pending} onClick={() => workflow.runAction(tab, record, selected)} type="button" variant="outline">Apply status</Button>
      </div>

      <h3>Staff notes</h3>
      {workflow.notesUnavailable && <Alert tone="warning">Staff notes and history could not be loaded.</Alert>}
      <form className="service-form" onSubmit={save}>
        {noteFeedback && <Alert tone={noteFeedback.tone}>{noteFeedback.message}</Alert>}
        <FormField disabled={workflow.pending || workflow.notesUnavailable} label="Admin notes" maxLength={1000} name="adminNotes" onChange={(event) => setDraft(event.target.value)} type="textarea" value={text} />
        <Button disabled={draft === null || workflow.pending || workflow.notesUnavailable} type="submit" variant="outline">Save note</Button>
      </form>
      <h3>History</h3>
      {history.length ? (
        <ol className="admin-history">
          {history.map((entry, index) => (
            <li key={entry.at + '/' + index}>
              <strong>{entry.action}{entry.outcome ? ' · ' + entry.outcome : ''}</strong>
              <p>{entry.fromStatus} → {entry.toStatus} · {formatRecordTime(entry.at)} · {entry.by}</p>
              {entry.note && <p>{entry.note}</p>}
            </li>
          ))}
        </ol>
      ) : <p>No staff actions recorded yet.</p>}
    </section>
  );
}

export default function DetailPanel({ adoptionCount, tab, record, onClose }) {
  const workflow = useAdminWorkflow();
  if (!record) return null;

  return (
    <Modal className="admin-detail" onClose={onClose} open={!workflow.actionOpen} title={'Record details · ' + displayValue(recordReference(record))}>
      {recordDetails(tab, record, adoptionCount).map(({ title, fields }) => (
        <section className="admin-detail-group" key={title}>
          <h3>{title}</h3>
          <dl>
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{displayValue(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <RecordWorkflow key={tab.id + '/' + record.id} record={record} tab={tab} />
    </Modal>
  );
}

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/forms/FormField.jsx';
import Modal from '../components/ui/Modal.jsx';
import { callOutcomes, noteDocumentId } from '../data/adminWorkflow.js';
import { recordReference } from '../data/adminDashboard.js';
import { saveStaffNote, saveWorkflowAction, subscribeToWorkflowCollection } from '../services/adminWorkflowService.js';

const WorkflowContext = createContext(null);

function errorText(error) {
  if (error?.code === 'permission-denied') return 'Permission denied. Check staff access and the deployed Firestore rules.';
  if (error?.code) return 'The change could not be saved. Check your connection and try again.';
  return error?.message || 'The change could not be saved.';
}

function ActionDialog({ request, pending, onClose, onSubmit }) {
  const [outcome, setOutcome] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const { action, record, tab } = request;
  const isCall = action.id === 'call';
  const reference = recordReference(record);
  const message = action.id === 'change-availability'
    ? 'Set ' + (record.petName || 'this pet') + ' to ' + action.manual.status
      + (tab.id === 'pets' ? '?' : action.manual.status === 'Available' ? ' and return it to the available list?' : ' for ' + reference + ' and hide it from the available list?')
    : action.label + ' for ' + (reference || 'this record') + '?';

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await onSubmit(request, outcome, note);
      onClose();
    } catch (failure) {
      setError(errorText(failure));
    }
  }

  return (
    <Modal onClose={() => { if (!pending) onClose(); }} open title={isCall ? 'Log a call' : action.label}>
      <form className="service-form" onSubmit={submit}>
        {error && <Alert tone="error">{error}</Alert>}
        {isCall ? (
          <>
            <FormField disabled={pending} label="Call outcome" name="callOutcome" onChange={(event) => setOutcome(event.target.value)} options={callOutcomes} required type="select" value={outcome} />
            <FormField disabled={pending} label="Call note (optional)" maxLength={300} name="callNote" onChange={(event) => setNote(event.target.value)} type="textarea" value={note} />
          </>
        ) : <p>{message}</p>}
        <div className="admin-actions">
          <Button disabled={isCall && !outcome} loading={pending} type="submit">{isCall ? 'Save call' : 'Confirm'}</Button>
          <Button disabled={pending} onClick={onClose} type="button" variant="outline">Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminWorkflowProvider({ children, email, uid, onStatusSaved }) {
  const [notes, setNotes] = useState({});
  const [pets, setPets] = useState({});
  const [workflowErrors, setWorkflowErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [request, setRequest] = useState(null);
  const [notice, setNotice] = useState(null);
  const saving = useRef(false);

  useEffect(() => {
    const stopNotes = subscribeToWorkflowCollection('admin_notes', (data) => {
      setNotes(data);
      setWorkflowErrors((current) => ({ ...current, notes: false }));
    }, () => {
      setNotes({});
      setWorkflowErrors((current) => ({ ...current, notes: true }));
    });
    const stopPets = subscribeToWorkflowCollection('pet_availability', (data) => {
      setPets(data);
      setWorkflowErrors((current) => ({ ...current, pets: false }));
    }, () => {
      setPets({});
      setWorkflowErrors((current) => ({ ...current, pets: true }));
    });
    return () => { stopNotes(); stopPets(); };
  }, []);

  async function withSave(save) {
    if (saving.current) throw new Error('Wait for the current save to finish.');
    saving.current = true;
    setPending(true);
    setNotice(null);
    try {
      return await save();
    } finally {
      saving.current = false;
      setPending(false);
    }
  }

  async function submitAction({ tab, record, action }, outcome, note) {
    await withSave(async () => {
      const result = await saveWorkflowAction({ tab, record, actionId: action.id, email, uid, outcome, note, manual: action.manual });
      if (result.statusPatch) onStatusSaved(tab.id, record.id, result.statusPatch);
      if (result.petPatch) setPets((current) => ({ ...current, [result.petId]: result.petPatch }));
      setNotes((current) => {
        const before = current[result.key] ?? {};
        const history = Array.isArray(before.history) ? before.history : [];
        const alreadyReceived = history.some((entry) => entry.at === result.entry.at && entry.by === result.entry.by && entry.action === result.entry.action);
        return { ...current, [result.key]: { ...before, ...result.metadata, history: alreadyReceived ? history : [...history, result.entry] } };
      });
      setNotice({ tone: 'success', message: action.id === 'call' ? 'Call saved.' : 'Change saved.' });
    });
  }

  function runAction(tab, record, action) {
    if (saving.current) return;
    const next = { tab, record, action };
    setNotice(null);
    if (action.confirm || action.id === 'call') {
      setRequest(next);
    } else {
      void submitAction(next).catch((error) => setNotice({ tone: 'error', message: errorText(error) }));
    }
  }

  async function saveNote(tab, record, text) {
    try {
      await withSave(async () => {
        const { key, changes } = await saveStaffNote({ tab, record, text, email });
        setNotes((current) => ({ ...current, [key]: { ...current[key], ...changes } }));
      });
    } catch (error) {
      throw new Error(errorText(error));
    }
  }

  return (
    <WorkflowContext.Provider value={{
      noteFor: (tab, id) => notes[noteDocumentId(tab.collection, id)],
      petFor: (id) => Object.hasOwn(pets, id) ? pets[id] : undefined,
      pets, pending, actionOpen: Boolean(request), runAction, saveNote,
      notesUnavailable: Boolean(workflowErrors.notes), availabilityUnavailable: Boolean(workflowErrors.pets), notice,
    }}>
      {children}
      {request && <ActionDialog pending={pending} request={request} onClose={() => setRequest(null)} onSubmit={submitAction} />}
    </WorkflowContext.Provider>
  );
}

export function useAdminWorkflow() {
  return useContext(WorkflowContext);
}

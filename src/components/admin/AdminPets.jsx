import { useEffect, useState } from 'react';
import { useAdminWorkflow } from '../../context/AdminWorkflowContext.jsx';
import { formatRecordTime } from '../../data/adminDashboard.js';
import { speciesOptions } from '../../data/staffPetFields.js';
import useForm from '../../hooks/useForm.js';
import { getStaffPets, setStaffPetArchived, staffPetError } from '../../services/staffPetService.js';
import AvailabilityControl from './AvailabilityControl.jsx';
import EmptyState from './EmptyState.jsx';
import FormField from '../forms/FormField.jsx';
import AddPetModal from '../pets/AddPetModal.jsx';
import Alert from '../ui/Alert.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import FallbackImage from '../ui/FallbackImage.jsx';
import Modal from '../ui/Modal.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import Toast from '../ui/Toast.jsx';

const petsTab = { id: 'pets', collection: 'staff_pets' };

function ArchiveDialog({ pet, onClose, onSaved }) {
  const archive = !pet.archived;
  const action = archive ? 'Archive' : 'Restore';
  const form = useForm({
    onSubmit: async () => {
      try {
        onSaved(await setStaffPetArchived(pet, archive), pet.name + (archive ? ' was archived.' : ' was restored.'));
      } catch (error) {
        throw new Error(staffPetError(error));
      }
    },
  });

  return (
    <Modal onClose={() => { if (!form.isSubmitting) onClose(); }} open title={action + ' pet'}>
      <form className="service-form" onSubmit={form.handleSubmit}>
        <p>{action} {pet.name}? {archive ? 'The profile will be hidden from the public catalogue.' : 'The profile will return to the public catalogue with its current availability.'}</p>
        {form.submitError && <Alert tone="error">{form.submitError}</Alert>}
        <div className="admin-actions">
          <Button loading={form.isSubmitting} type="submit">{action} pet</Button>
          <Button disabled={form.isSubmitting} onClick={onClose} variant="outline">Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminPets({ uid }) {
  const workflow = useAdminWorkflow();
  const [state, setState] = useState({ records: [], loading: true, error: '' });
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const [editor, setEditor] = useState(null);
  const [archivePet, setArchivePet] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    getStaffPets().then((records) => {
      if (active) setState({ records, loading: false, error: '' });
    }, (error) => {
      if (active) setState({ records: [], loading: false, error: staffPetError(error) });
    });
    return () => { active = false; };
  }, [reload]);

  const visible = state.records.filter((pet) => (!species || pet.species === species)
    && [pet.name, pet.breed, pet.id].join(' ').toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function applySaved(pet, message) {
    setState((current) => ({ ...current, records: [pet, ...current.records.filter(({ id }) => id !== pet.id)] }));
    setArchivePet(null);
    setEditor(null);
    setNotice(message);
  }

  function saveEditor(pet) {
    if (!editor.pet) { setSearch(''); setSpecies(pet.species); }
    applySaved(pet, pet.name + (editor.pet ? ' was updated.' : ' was published.'));
  }

  return (
    <section aria-labelledby="admin-pets-title" aria-busy={state.loading}>
      <h2 id="admin-pets-title">Pets</h2>
      <p className="admin-summary">Manage the profiles added by staff. Availability also applies to adoption requests and the public catalogue.</p>
      <div className="admin-actions">
        <Button disabled={state.loading || Boolean(state.error)} onClick={() => setEditor({})}>+ Add pet</Button>
        <Button disabled={state.loading} onClick={() => {
          setState((current) => ({ ...current, loading: true, error: '' }));
          setReload((value) => value + 1);
        }} variant="outline">Refresh pets</Button>
      </div>
      {state.loading && <Spinner label="Loading staff pets" />}
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {!state.loading && !state.error && (
        <>
          <div className="admin-filter-fields staff-pet-search">
            <FormField label="Search staff pets" name="search" onChange={(event) => setSearch(event.target.value)} type="search" value={search} />
            <FormField label="Species" name="species" onChange={(event) => setSpecies(event.target.value)} options={speciesOptions} placeholder="All species" type="select" value={species} />
          </div>
          {visible.length === 0 ? <EmptyState title={state.records.length ? 'No matching pets' : 'No staff-added pets yet'}
            description={state.records.length ? 'Try another search or species.' : 'Use Add pet to publish the first staff profile.'} /> : (
            <div className="admin-table-scroll">
              <table className="admin-table staff-pet-table">
                <caption className="visually-hidden">Staff-added pet profiles</caption>
                <thead><tr>{['Photo', 'Pet', 'Species', 'Availability', 'Listing', 'Created (SGT)', 'Actions'].map((label) =>
                  <th key={label} scope="col">{label}</th>)}</tr></thead>
                <tbody>
                  {visible.map((pet) => {
                    const status = workflow.petFor(pet.id)?.status ?? 'Available';
                    return (
                      <tr key={pet.id}>
                        <td><FallbackImage alt={pet.imageAlt} height={60} src={pet.image} width={80} /></td>
                        <td>{pet.name}</td><td>{pet.species}</td>
                        <td><Badge tone={status === 'Available' ? 'success' : 'warning'}>{status}</Badge></td>
                        <td><Badge tone={pet.archived ? 'neutral' : 'teal'}>{pet.archived ? 'Archived' : 'Published'}</Badge></td>
                        <td>{formatRecordTime(pet.createdAt)}</td>
                        <td>
                          <div className="admin-actions">
                            <Button onClick={() => setEditor({ pet })} size="small" variant="outline">Edit</Button>
                            <Button onClick={() => setArchivePet(pet)} size="small" variant="outline">{pet.archived ? 'Restore' : 'Archive'}</Button>
                            {!pet.archived && <Button size="small" to={'/pets/' + pet.id} variant="outline">View on public site</Button>}
                          </div>
                          <AvailabilityControl label={'Pet availability status for ' + pet.name}
                            record={{ ...pet, petId: pet.id, petName: pet.name }} tab={petsTab} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {editor && <AddPetModal onClose={() => setEditor(null)} onSaved={saveEditor} pet={editor.pet} species={species} uid={uid} />}
      {archivePet && <ArchiveDialog onClose={() => setArchivePet(null)} onSaved={applySaved} pet={archivePet} />}
      {notice && <Toast onDismiss={() => setNotice('')} tone="success">{notice}</Toast>}
    </section>
  );
}

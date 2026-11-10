import { useState } from 'react';
import { useAdminWorkflow } from '../../context/AdminWorkflowContext.jsx';
import { petAvailabilityStatuses } from '../../utils/petUtils.js';
import FormField from '../forms/FormField.jsx';
import Button from '../ui/Button.jsx';

export default function AvailabilityControl({ tab, record, label = 'Pet availability status' }) {
  const workflow = useAdminWorkflow();
  const [next, setNext] = useState('');
  const availability = workflow.petFor(record.petId);
  const current = availability?.status ?? 'Available';
  const disabled = workflow.pending || workflow.availabilityUnavailable;

  return (
    <div className="admin-actions admin-status-control">
      <FormField disabled={disabled} label={label} name="petAvailabilityStatus" onChange={(event) => setNext(event.target.value)}
        options={petAvailabilityStatuses} type="select" value={next} />
      <Button disabled={disabled || !next || next === current} onClick={() => workflow.runAction(tab, record, {
        id: 'change-availability', label: 'Change availability', confirm: true,
        manual: { status: next, expected: availability },
      })} type="button" variant="outline">Change availability</Button>
    </div>
  );
}

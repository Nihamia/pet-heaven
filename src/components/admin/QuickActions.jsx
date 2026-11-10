import { workflowActions } from '../../data/adminWorkflow.js';
import { useAdminWorkflow } from '../../context/AdminWorkflowContext.jsx';
import Button from '../ui/Button.jsx';

export default function QuickActions({ tab, record }) {
  const workflow = useAdminWorkflow();
  const availability = workflow.petFor(record.petId);
  const actions = workflowActions(tab.id, record, availability);

  return (
    <div className="admin-actions">
      {actions.map((action) => (
        <Button
          disabled={workflow.pending}
          key={action.id}
          onClick={(event) => {
            event.stopPropagation();
            workflow.runAction(tab, record, action);
          }}
          size="small"
          type="button"
          variant="outline"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

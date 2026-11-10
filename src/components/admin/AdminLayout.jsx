import { NavLink } from 'react-router-dom';
import Alert from '../ui/Alert.jsx';
import Badge from '../ui/Badge.jsx';
import { useAdminWorkflow } from '../../context/AdminWorkflowContext.jsx';
import Button from '../ui/Button.jsx';
import useForm from '../../hooks/useForm.js';
import { dashboardTabs } from '../../data/adminDashboard.js';
import { signOutStaff } from '../../services/adminAuthService.js';

export default function AdminLayout({ email, children, needsAction }) {
  const workflow = useAdminWorkflow();
  const signOut = useForm({ onSubmit: signOutStaff });

  return (
    <div className="container admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Pet Heaven staff</p>
          <h1>Staff area</h1>
          <p>Signed in as <strong>{email}</strong>.</p>
        </div>
        <form onSubmit={signOut.handleSubmit}>
          <Button loading={signOut.isSubmitting} type="submit" variant="outline">Sign out of staff area</Button>
        </form>
        {signOut.submitError && <Alert tone="error">{signOut.submitError}</Alert>}
      </header>
      <div className="admin-layout">
        <nav aria-label="Staff dashboard" className="admin-sidebar">
          <NavLink end to="/admin">Overview</NavLink>
          {dashboardTabs.map((tab) => (
            <NavLink aria-label={tab.title} aria-describedby={needsAction[tab.id] === null ? undefined : 'staff-count-' + tab.id} key={tab.id} to={'/admin/' + tab.id}>
              {tab.title}
              {needsAction[tab.id] !== null && (
                <Badge className="admin-needs-count" tone="teal"><span id={'staff-count-' + tab.id}><span className="visually-hidden">Needs action: </span>{needsAction[tab.id]}</span></Badge>
              )}
            </NavLink>
          ))}
          <NavLink to="/admin/pets">Pets</NavLink>
        </nav>
        <div className="admin-content">
          {workflow.notice && <div className="admin-screen-only"><Alert tone={workflow.notice.tone}>{workflow.notice.message}</Alert></div>}
          {workflow.availabilityUnavailable && <Alert tone="warning">Pet availability could not be loaded.</Alert>}
          {children}
        </div>
      </div>
    </div>
  );
}

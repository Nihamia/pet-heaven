import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FormField from '../components/forms/FormField.jsx';
import FormPageShell from '../components/forms/FormPageShell.jsx';
import SubmissionFeedback from '../components/forms/SubmissionFeedback.jsx';
import Accordion from '../components/ui/Accordion.jsx';
import Alert from '../components/ui/Alert.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { roles } from '../data/roles.js';
import useAdminSubmission from '../hooks/useAdminSubmission.js';
import useForm from '../hooks/useForm.js';
import { logout } from '../services/authService.js';
import { getAdoptionRequests } from '../services/dataService.js';
import { updateMember } from '../services/memberService.js';
import { maxLength, minLength, required, singaporePhone } from '../utils/validators.js';

const dateFormat = new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium', timeZone: 'Asia/Singapore' });
const memberGuides = [
  {
    id: 'volunteer-handbook',
    title: 'Volunteer handbook summary',
    content: <p>Attend your orientation, check in at each shift and ask your team lead before handling an animal. Follow the care instructions for each pet and report any concerns to the team.</p>,
  },
  {
    id: 'foster-guide',
    title: 'Foster guide',
    content: <p>Prepare a quiet space, agree on the care plan with your coordinator and keep a daily record of meals, routines and behaviour. Contact the team before changing food or medication.</p>,
  },
];

function displayDate(value) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime()) ? dateFormat.format(date) : 'Date unavailable';
}

function MembershipCard({ member }) {
  const selectedRoles = roles.filter(({ id }) => member.roles?.includes(id));
  return (
    <Card aria-labelledby="member-card-title" as="section" className="member-print-card" padding="large">
      <div className="member-heading-row">
        <div>
          <p className="eyebrow">Pet Heaven</p>
          <h2 id="member-card-title">Membership card</h2>
        </div>
        <Badge tone={member.status === 'Active' ? 'success' : 'neutral'}>{member.status}</Badge>
      </div>
      <p className="member-card-name">{member.fullName}</p>
      <dl className="member-facts">
        <div><dt>Member ID</dt><dd>{member.memberId}</dd></div>
        <div><dt>Member since</dt><dd>{displayDate(member.createdAt)}</dd></div>
        <div><dt>Roles</dt><dd>{selectedRoles.map(({ id, selectionLabel }) => <Badge key={id} tone="teal">{selectionLabel}</Badge>)}</dd></div>
      </dl>
      <Button className="member-no-print" onClick={() => window.print()} size="small" variant="outline">Print card</Button>
    </Card>
  );
}

function validateDetails(values) {
  return {
    fullName: required(values.fullName, 'Full name') || minLength(values.fullName.trim(), 2) || maxLength(values.fullName, 120),
    phone: required(values.phone, 'Phone number') || singaporePhone(values.phone) || maxLength(values.phone, 32),
    address: required(values.address, 'Home address') || minLength(values.address.trim(), 8) || maxLength(values.address, 240),
    roles: roles.some(({ id }) => values[id]) ? '' : 'Choose at least one way to get involved.',
  };
}

function EditDetails({ member, uid, onClose, onSaved, refreshMember }) {
  const initialValues = {
    fullName: member.fullName,
    phone: member.phone,
    address: member.address,
    ...Object.fromEntries(roles.map(({ id }) => [id, member.roles?.includes(id) ?? false])),
  };
  const form = useForm({ initialValues, validate: validateDetails });
  const fieldError = (name) => (form.touched[name] ? form.errors[name] : '');

  async function submit(values) {
    await updateMember(uid, {
      fullName: values.fullName,
      phone: values.phone,
      address: values.address,
      roles: roles.filter(({ id }) => values[id]).map(({ id }) => id),
    });
    const updated = await refreshMember(uid);
    onSaved(updated ? 'Your details have been updated.' : 'Your details are saved. Refresh your profile to see the latest values.');
  }

  return (
    <Modal onClose={() => { if (!form.isSubmitting) onClose(); }} open title="Edit membership details">
      <form className="service-form" noValidate onSubmit={form.handleSubmit(submit)}>
        {form.submitError && <Alert tone="error">{form.submitError}</Alert>}
        <FormField autoComplete="name" error={fieldError('fullName')} label="Full name" maxLength={120} name="fullName" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.fullName} />
        <FormField autoComplete="tel" error={fieldError('phone')} label="Phone number" maxLength={32} name="phone" onBlur={form.handleBlur} onChange={form.handleChange} required type="tel" value={form.values.phone} />
        <FormField autoComplete="street-address" error={fieldError('address')} label="Home address" maxLength={240} name="address" onBlur={form.handleBlur} onChange={form.handleChange} required value={form.values.address} />
        <fieldset className="service-fieldset">
          <legend>Roles</legend>
          {roles.map(({ id, selectionLabel }) => (
            <FormField checked={form.values[id]} key={id} label={selectionLabel} name={id} onBlur={form.handleBlur} onChange={form.handleChange} type="checkbox" />
          ))}
          {form.errors.roles && <p className="form-field__error" role="alert">{form.errors.roles}</p>}
        </fieldset>
        <div className="member-actions">
          <Button loading={form.isSubmitting} type="submit">{form.isSubmitting ? 'Saving…' : 'Save details'}</Button>
          <Button disabled={form.isSubmitting} onClick={onClose} variant="outline">Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

function MemberDetails({ member, user, refreshMember }) {
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');

  return (
    <Card aria-labelledby="member-details-title" as="section" padding="large">
      <h2 id="member-details-title">My Details</h2>
      <dl className="member-facts">
        <div><dt>Full name</dt><dd>{member.fullName}</dd></div>
        <div><dt>Email address</dt><dd>{user.email}</dd></div>
        <div><dt>Phone number</dt><dd>{member.phone}</dd></div>
        <div><dt>Home address</dt><dd>{member.address}</dd></div>
      </dl>
      {notice && <Alert tone="success">{notice}</Alert>}
      <Button onClick={() => setEditing(true)} size="small" variant="outline">Edit details</Button>
      {editing && <EditDetails member={member} onClose={() => setEditing(false)} onSaved={(message) => {
        setNotice(message);
        setEditing(false);
      }} refreshMember={refreshMember} uid={user.uid} />}
    </Card>
  );
}

function MyRequests({ uid }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const sectionRef = useRef(null);
  const { hash } = useLocation();

  useEffect(() => {
    let active = true;
    getAdoptionRequests(uid).then((requests) => {
      if (active) setResult(requests);
    }).catch(() => {
      if (active) setError(true);
    });
    return () => { active = false; };
  }, [uid]);

  useEffect(() => {
    if (hash === '#requests') {
      sectionRef.current?.scrollIntoView?.({ block: 'start' });
      sectionRef.current?.focus({ preventScroll: true });
    }
  }, [hash]);

  return (
    <section aria-labelledby="member-requests-title" className="member-requests" id="requests" ref={sectionRef} tabIndex={-1}>
      <div className="member-heading-row">
        <h2 id="member-requests-title">My Requests</h2>
        <Button size="small" to="/adopt" variant="outline">Start an adoption enquiry</Button>
      </div>
      {error && <Alert tone="error">We could not load your adoption requests. Reload this page to try again.</Alert>}
      {!result && !error && <Spinner label="Loading your adoption requests" />}
      {result?.source === 'local' && <Alert tone="info">Showing requests saved in this browser.</Alert>}
      {result?.records.length === 0 && <p>You have no adoption requests yet.</p>}
      {result?.records.length > 0 && (
        <ul className="member-request-list">
          {result.records.map((request) => (
            <Card as="li" key={request.referenceId}>
              <div className="member-heading-row">
                <h3>{request.petName}</h3>
                <Badge tone="teal">{request.status || 'Submitted'}</Badge>
              </div>
              <dl className="member-facts">
                <div><dt>Reference</dt><dd>{request.referenceId}</dd></div>
                <div><dt>Submitted on</dt><dd>{displayDate(request.createdAt)}</dd></div>
              </dl>
              {request.localOnly && <Badge>Saved in this browser</Badge>}
            </Card>
          ))}
        </ul>
      )}
    </section>
  );
}

function MemberResources() {
  return (
    <section aria-labelledby="member-resources-title">
      <h2 id="member-resources-title">Member resources</h2>
      <div className="member-grid">
        <Card>
          <h3>Volunteer orientation</h3>
          <p>Meet the volunteer leads and learn how the shelter's daily care routines work. The team will share details for the next session.</p>
          <Badge tone="teal">Member event</Badge>
        </Card>
        <Card>
          <h3>Foster family introduction</h3>
          <p>Talk with the foster team about preparing your home and helping a pet settle in.</p>
          <Badge tone="teal">Member event</Badge>
        </Card>
      </div>
      <Accordion items={memberGuides} label="Member guides" />
      <Card className="member-supplies">
        <h3>Things we need</h3>
        <ul>
          <li>Sealed pet food and treats</li>
          <li>Clean towels and washable blankets</li>
          <li>Pet-safe toys and unopened cleaning supplies</li>
        </ul>
      </Card>
    </section>
  );
}

export default function MemberPage() {
  const { user, member, memberError, refreshMember, registrationFeedback, setRegistrationFeedback } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const registrationEmail = useAdminSubmission('join', {
    submission: registrationFeedback,
    setSubmission: (result) => setRegistrationFeedback(result, user.uid),
  });

  async function signOut() {
    setSignOutError('');
    setSigningOut(true);
    try {
      await logout();
    } catch (error) {
      setSignOutError(error.message);
    } finally {
      setSigningOut(false);
    }
  }

  async function reloadProfile() {
    setRefreshing(true);
    try {
      await refreshMember(user.uid);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <FormPageShell className="member-page" description="Find your member card, adoption enquiries and ways to get involved." eyebrow="Pet Heaven membership" title="My Membership">
      <div className="member-content">
        {registrationFeedback && (
          <div className="member-feedback">
            <Alert title={`Welcome to Pet Heaven${member?.firstName ? `, ${member.firstName}` : ''}!`} tone="success">Your membership is ready.</Alert>
            <SubmissionFeedback isRetrying={registrationEmail.isRetrying} onRetry={registrationFeedback.data ? registrationEmail.retry : undefined} result={registrationFeedback} />
          </div>
        )}
        {memberError && <Alert tone="error">{memberError} <Button loading={refreshing} onClick={reloadProfile} size="small" variant="outline">Reload profile</Button></Alert>}
        {member ? (
          <>
            <div className="member-grid">
              <MembershipCard member={member} />
              <MemberDetails key={user.uid} member={member} refreshMember={refreshMember} user={user} />
            </div>
            <MyRequests key={user.uid} uid={user.uid} />
            <MemberResources />
          </>
        ) : memberError ? <MyRequests key={user.uid} uid={user.uid} /> : (
          <Card padding="large">
            <h2>Finish your registration</h2>
            <p>Add your contact details and choose your roles to open your member area.</p>
            <Button to="/join">Finish registration</Button>
          </Card>
        )}
        <div className="member-actions">
          {signOutError && <Alert tone="error">{signOutError}</Alert>}
          <Button loading={signingOut} onClick={signOut} variant="outline">{signingOut ? 'Signing out…' : 'Sign out'}</Button>
        </div>
      </div>
    </FormPageShell>
  );
}

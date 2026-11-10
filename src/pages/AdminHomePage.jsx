import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import AdminOverview from '../components/admin/AdminOverview.jsx';
import AdminSubmissions from '../components/admin/AdminSubmissions.jsx';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { dashboardTabs, memberAdoptionCounter, recordStatus } from '../data/adminDashboard.js';
import { AdminWorkflowProvider } from '../context/AdminWorkflowContext.jsx';
import { subscribeToSubmissions } from '../services/adminDataService.js';
import { Spinner } from '../components/ui/Spinner.jsx';

const AdminPets = lazy(() => import('../components/admin/AdminPets.jsx'));

function initialCollections() {
  return Object.fromEntries(dashboardTabs.map(({ id }) => [id, { records: [], loading: true, error: '' }]));
}

function StaffDashboard({ user, tab, showPets }) {
  const [collections, setCollections] = useState(initialCollections);

  useEffect(() => {
    const subscriptions = dashboardTabs.map(({ id, collection }) => subscribeToSubmissions(
      collection,
      (result) => setCollections((previous) => ({ ...previous, [id]: { ...result, loading: false, error: '' } })),
      (error) => {
        const message = error?.code === 'permission-denied'
          ? 'Permission denied. Check your staff access and the deployed Firestore rules.'
          : 'Records could not be loaded. Check your connection and reopen the staff area.';
        setCollections((previous) => ({ ...previous, [id]: { records: [], loading: false, error: message } }));
      },
    ));
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, []);

  const adoption = collections.adoption;
  const adoptionCount = useMemo(() => memberAdoptionCounter(adoption), [adoption]);
  const needsAction = Object.fromEntries(dashboardTabs.map(({ id }) => {
    const state = collections[id];
    return [id, state.loading || state.error ? null : state.records.filter((record) => recordStatus(id, record) === 'New').length];
  }));

  function applyStatus(tabId, recordId, patch) {
    setCollections((previous) => {
      const state = previous[tabId];
      return {
        ...previous,
        [tabId]: { ...state, records: state.records.map((record) => (
          record.id === recordId && (!record.updatedAt || record.updatedAt <= patch.updatedAt)
            ? { ...record, ...patch } : record
        )) },
      };
    });
  }

  return (
    <AdminWorkflowProvider email={user.email} onStatusSaved={applyStatus} uid={user.uid}>
      <AdminLayout email={user.email} needsAction={needsAction}>
        {showPets ? (
          <Suspense fallback={<Spinner label="Loading staff Pets tab" />}><AdminPets uid={user.uid} /></Suspense>
        ) : tab ? (
          <AdminSubmissions adoptionCount={adoptionCount} key={tab.id} state={collections[tab.id]} tab={tab} />
        ) : <AdminOverview adoptionCount={adoptionCount} collections={collections} />}
      </AdminLayout>
    </AdminWorkflowProvider>
  );
}

export default function AdminHomePage() {
  const { user } = useAdminAuth();
  const path = (useParams()['*'] ?? '').replace(/\/+$/, '');
  const tab = dashboardTabs.find(({ id }) => id === path);
  const showPets = path === 'pets';
  if (path && !tab && !showPets) return <Navigate replace to="/admin" />;
  return <StaffDashboard key={user.uid} showPets={showPets} tab={tab} user={user} />;
}

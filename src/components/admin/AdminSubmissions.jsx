import { useEffect, useState } from 'react';
import { useAdminWorkflow } from '../../context/AdminWorkflowContext.jsx';
import { followUp } from '../../data/adminWorkflow.js';
import { downloadAdminCsv } from '../../utils/adminCsv.js';
import { displayValue, filterRecords, formatRecordTime, recordStatus, tableColumns } from '../../data/adminDashboard.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import { Skeleton } from '../ui/Spinner.jsx';
import DataTable from './DataTable.jsx';
import DetailPanel from './DetailPanel.jsx';
import EmptyState from './EmptyState.jsx';
import FilterBar from './FilterBar.jsx';

const pageSize = 10;

export default function AdminSubmissions({ adoptionCount, tab, state }) {
  const [filters, setFilters] = useState({
    search: '', status: 'all', role: 'all', sort: tab.id === 'release' ? 'urgent' : 'newest',
  });
  const [page, setPage] = useState(1);
  const [recordId, setRecordId] = useState(null);
  const [printData, setPrintData] = useState(null);
  const workflow = useAdminWorkflow();
  const { records, loading, error, missingReadFailed } = state;
  const filtered = filterRecords(tab, records, filters);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const record = records.find((item) => item.id === recordId);
  const extraStatuses = records.map((item) => recordStatus(tab.id, item));

  const columns = tableColumns(tab, filters.role, adoptionCount);

  useEffect(() => {
    if (!printData) return;
    window.print();
    setPrintData(null);
  }, [printData]);

  function exportData() {
    return {
      headers: [...columns.map(({ label }) => label), 'Status', 'Follow-up', 'Pet availability', 'Created (SGT)'],
      rows: filtered.map((item) => [
        ...columns.map((column) => displayValue(column.read(item))),
        recordStatus(tab.id, item),
        workflow.notesUnavailable ? '—' : followUp(workflow.noteFor(tab, item.id)),
        tab.id === 'adoption' ? workflow.petFor(item.petId)?.status || 'Available' : '—',
        formatRecordTime(item.createdAt),
      ]),
    };
  }

  function exportCsv() {
    const { headers, rows } = exportData();
    downloadAdminCsv('pet-heaven-' + tab.id, headers, rows);
  }

  function changeFilter(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
    setPage(1);
  }

  return (
    <section aria-labelledby="admin-tab-title" aria-busy={loading}>
      <h2 id="admin-tab-title">{tab.title}</h2>
      {loading && (
        <div className="admin-loading" role="status">
          <span className="visually-hidden">Loading {tab.title.toLowerCase()}</span>
          {[0, 1, 2].map((row) => <Skeleton height="2.5rem" key={row} />)}
        </div>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {!loading && !error && (
        <>
          {missingReadFailed && <Alert tone="warning">Undated records could not be checked. Showing the ordered results.</Alert>}
          {tab.id === 'members' && filters.role === 'adopter' && (
            <p className="admin-summary">Adoption counts reflect requests loaded in the dashboard.</p>
          )}
          <FilterBar filters={{ ...filters, extraStatuses }} onChange={changeFilter} records={records} tab={tab} />
          {visible.length === 0 ? (
            <EmptyState
              description={records.length ? 'Try a different search or clear a filter.' : 'Records will appear here as they are received.'}
              title={records.length ? 'No matching records' : 'No submissions yet'}
            />
          ) : (
            <>
              <p className="admin-result-count" aria-live="polite">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</p>
              <div className="admin-actions admin-screen-only">
                <Button onClick={exportCsv} type="button" variant="outline">Export filtered CSV</Button>
                <Button onClick={() => setPrintData(exportData())} type="button" variant="outline">Print</Button>
              </div>
              <DataTable columns={columns} onOpen={setRecordId} records={visible} tab={tab} />
              {pageCount > 1 && (
                <nav aria-label="Result pages" className="admin-pagination">
                  <Button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} size="small" type="button" variant="outline">Previous</Button>
                  <span>Page {currentPage} of {pageCount}</span>
                  <Button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} size="small" type="button" variant="outline">Next</Button>
                </nav>
              )}
              <DetailPanel adoptionCount={adoptionCount} onClose={() => setRecordId(null)} record={record} tab={tab} />
            </>
          )}
        </>
      )}
      {printData && (
        <div className="admin-print">
          <h2>{tab.title}</h2>
          <table>
            <thead><tr>{printData.headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead>
            <tbody>{printData.rows.map((row, index) => <tr key={index}>{row.map((value, cell) => <td key={cell}>{value}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

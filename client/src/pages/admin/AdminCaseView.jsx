import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AISummaryBlock from '../../components/AISummaryBlock';
import HearingTimeline from '../../components/HearingTimeline';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import HearingForm from './HearingForm';
import { getCaseById, closeCase, getHearingsByCase } from '../../api/endpoints';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { USE_MOCK, MOCK_CASES } from '../../utils/mockData';

export default function AdminCaseView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [outcomeNote, setOutcomeNote] = useState('');
  const [caseOutcome, setCaseOutcome] = useState('');
  const [closeLoading, setCloseLoading] = useState(false);

  const [showHearingForm, setShowHearingForm] = useState(false);
  const [editingHearing, setEditingHearing] = useState(null); // null = create mode

  const fetchCase = useCallback(async () => {
    if (USE_MOCK) {
      const found = MOCK_CASES.find((c) => c.caseId === id) || MOCK_CASES[0];
      setCaseData(found);
      return;
    }
    const res = await getCaseById(id);
    setCaseData(res.data.case);
  }, [id]);

  const fetchHearings = useCallback(async () => {
    if (USE_MOCK) {
      const found = MOCK_CASES.find((c) => c.caseId === id) || MOCK_CASES[0];
      setHearings(found.hearings || []);
      return;
    }
    const res = await getHearingsByCase(id);
    setHearings(res.data.hearings || []);
  }, [id]);

  useEffect(() => {
    Promise.all([fetchCase(), fetchHearings()])
      .catch(() => setToast({ message: 'Failed to load case data.', type: 'error' }))
      .finally(() => setLoading(false));
  }, [fetchCase, fetchHearings]);

  const handleClose = async () => {
    if (!outcomeNote.trim()) return;
    setCloseLoading(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        setCaseData((prev) => ({ ...prev, status: 'closed', outcome: outcomeNote, closedAt: new Date().toISOString() }));
      } else {
        await closeCase(id, { outcomeNote, caseOutcome: caseOutcome || undefined });
        await fetchCase();
      }
      setShowCloseModal(false);
      setCaseOutcome('');
      setToast({ message: 'Case closed successfully.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to close case.', type: 'error' });
    } finally {
      setCloseLoading(false);
    }
  };

  const handleHearingSuccess = async () => {
    setToast({ message: 'Hearing saved successfully.', type: 'success' });
    await fetchHearings();
    await fetchCase();
  };

  const openUpdateHearing = (hearing) => {
    setEditingHearing(hearing);
    setShowHearingForm(true);
  };

  const openCreateHearing = () => {
    setEditingHearing(null);
    setShowHearingForm(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-ice">
        <AdminSidebar />
        <main className="ml-64 flex-1"><LoadingSpinner /></main>
      </div>
    );
  }

  if (!caseData) return null;

  const notif = caseData.notifications?.[0];
  const assignedLawyer = caseData.lawyer;

  return (
    <div className="flex min-h-screen bg-ice">
      <AdminSidebar />

      <main className="ml-64 flex-1">
        {/* Page header */}
        <div className="bg-white border-b border-sky px-8 py-5 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all"
          >
            ← Back
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-h1 font-bold text-navy truncate">{caseData.title}</h1>
            <p className="text-caption text-slate mt-0.5">{caseData.caseId}</p>
          </div>
        </div>

        {/* Template C — Two-column */}
        <div className="px-8 py-8 grid grid-cols-3 gap-6 max-w-container mx-auto">

          {/* ── Left column ── */}
          <div className="col-span-2 space-y-6">

            {/* 1. Case Info card */}
            <div className="bg-white rounded-lg border border-sky shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3 font-semibold text-navy">Case Information</h2>
                <Badge status={caseData.status} />
              </div>

              <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <dt className="text-caption text-slate">Filed</dt>
                  <dd className="text-body text-navy font-medium">{formatDate(caseData.filedAt)}</dd>
                </div>
                <div>
                  <dt className="text-caption text-slate">Court Type</dt>
                  <dd className="mt-0.5"><Badge status={caseData.courtType || 'pending'} /></dd>
                </div>
                {caseData.closedAt && (
                  <div>
                    <dt className="text-caption text-slate">Closed</dt>
                    <dd className="text-body text-navy font-medium">{formatDate(caseData.closedAt)}</dd>
                  </div>
                )}
                {caseData.outcome && (
                  <div className="col-span-2">
                    <dt className="text-caption text-slate">Final Outcome</dt>
                    <dd className="text-body text-navy mt-1">{caseData.outcome}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 pt-4 border-t border-sky/50">
                <p className="text-body text-slate leading-relaxed">{caseData.complaintText}</p>
              </div>
            </div>

            {/* 2. AI Summary */}
            {caseData.aiSummary && <AISummaryBlock aiSummary={caseData.aiSummary} />}

            {/* 3. Accused Notification Status */}
            {notif && (
              <div className="bg-white rounded-lg border border-sky shadow-sm p-5">
                <h2 className="text-h3 font-semibold text-navy mb-3">Accused Party Notification</h2>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-caption text-slate">Channel</p>
                    <p className="text-body text-navy font-medium capitalize">{notif.channel}</p>
                  </div>
                  <div>
                    <p className="text-caption text-slate">Sent At</p>
                    <p className="text-body text-navy font-medium">{formatDateTime(notif.sentAt)}</p>
                  </div>
                  <div>
                    <p className="text-caption text-slate">Status</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          notif.status === 'sent' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <Badge status={notif.status} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Hearing Timeline — only for active/closed cases */}
            {['active', 'closed'].includes(caseData.status) && (
              <div className="bg-white rounded-lg border border-sky shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-h3 font-semibold text-navy">Hearing Timeline</h2>
                  {caseData.status === 'active' && caseData.lawyerId && (
                    <button
                      onClick={openCreateHearing}
                      className="bg-steel text-white text-body font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all text-sm"
                    >
                      + Schedule Hearing
                    </button>
                  )}
                </div>
                <HearingTimeline
                  hearings={hearings}
                  showUpdateButton={caseData.status === 'active'}
                  onUpdate={openUpdateHearing}
                />
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg border border-sky shadow-sm p-5 sticky top-6 space-y-5">
              <h3 className="text-h3 font-semibold text-navy">Case Management</h3>

              {/* Status + court */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-caption text-slate">Status:</span>
                  <Badge status={caseData.status} />
                </div>
                {caseData.courtType && (
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-slate">Court:</span>
                    <Badge status={caseData.courtType} />
                  </div>
                )}
              </div>

              {/* Assigned Lawyer — hide for rejected */}
              {caseData.status !== 'rejected' && (
                <div className="pt-4 border-t border-sky/50">
                  <p className="text-caption text-slate mb-2">Assigned Lawyer</p>
                  {assignedLawyer ? (
                    <div>
                      <p className="text-h3 font-semibold text-navy">{assignedLawyer.name}</p>
                      <p className="text-body text-slate">{assignedLawyer.barId}</p>
                      <p className="text-body text-slate">{assignedLawyer.specialisation}</p>
                      <p className="text-caption text-slate mt-1">
                        {assignedLawyer.casesHandled || 0} cases · {assignedLawyer.wins || 0}W / {assignedLawyer.losses || 0}L
                        {(assignedLawyer.casesHandled || 0) > 0 && (
                          <span className="ml-1">({Math.round(((assignedLawyer.wins || 0) / assignedLawyer.casesHandled) * 100)}%)</span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-body text-slate italic">Awaiting lawyer assignment</p>
                  )}
                </div>
              )}

              {/* Rejection info */}
              {caseData.status === 'rejected' && (
                <div className="pt-4 border-t border-sky/50">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-body font-semibold text-red-700">Case Rejected</p>
                    {caseData.rejectionNote && (
                      <p className="text-caption text-slate mt-1">{caseData.rejectionNote}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Close Case */}
              {caseData.status === 'active' && (
                <div className="pt-4 border-t border-sky/50">
                  <button
                    onClick={() => setShowCloseModal(true)}
                    className="w-full bg-red-600 text-white text-body font-semibold px-5 py-2.5 rounded-md hover:bg-red-700 transition-all"
                  >
                    Close Case
                  </button>
                  <p className="text-caption text-slate/70 mt-2 text-center">
                    This action is permanent.
                  </p>
                </div>
              )}

              {caseData.status === 'closed' && caseData.outcome && (
                <div className="pt-4 border-t border-sky/50">
                  <p className="text-caption text-slate mb-1">Final Outcome</p>
                  {caseData.caseOutcome && (
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold mb-2 ${
                      caseData.caseOutcome === 'won' ? 'bg-green-100 text-green-800' :
                      caseData.caseOutcome === 'lost' ? 'bg-red-100 text-red-700' :
                      caseData.caseOutcome === 'settlement' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate/20 text-slate'
                    }`}>{caseData.caseOutcome.charAt(0).toUpperCase() + caseData.caseOutcome.slice(1)}</span>
                  )}
                  <p className="text-body text-navy">{caseData.outcome}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Close Case Modal */}
      {showCloseModal && (
        <Modal
          isOpen={true}
          title="Close Case"
          message="Enter the final outcome to permanently close this case."
          confirmLabel={closeLoading ? 'Closing…' : 'Close Case'}
          onConfirm={handleClose}
          onCancel={() => { setShowCloseModal(false); setOutcomeNote(''); setCaseOutcome(''); }}
          danger
        >
          {/* Case outcome dropdown */}
          <div className="mt-2 mb-3">
            <label className="block text-caption text-slate mb-1">Case Outcome</label>
            <select
              value={caseOutcome}
              onChange={(e) => setCaseOutcome(e.target.value)}
              className="w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors"
            >
              <option value="">Select outcome...</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="settlement">Settlement</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <textarea
            value={outcomeNote}
            onChange={(e) => setOutcomeNote(e.target.value)}
            placeholder="Describe the final outcome of this case…"
            rows={4}
            className="w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy placeholder:text-slate/50 resize-none focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors mt-2"
          />
          {!outcomeNote.trim() && (
            <p className="text-caption text-red-600 mt-1">Outcome note is required.</p>
          )}
        </Modal>
      )}

      {/* Hearing Form Modal */}
      {showHearingForm && (
        <HearingForm
          caseId={id}
          hearing={editingHearing}
          onClose={() => { setShowHearingForm(false); setEditingHearing(null); }}
          onSuccess={handleHearingSuccess}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

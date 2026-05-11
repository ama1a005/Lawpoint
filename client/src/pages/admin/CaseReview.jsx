import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AISummaryBlock from '../../components/AISummaryBlock';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { getCaseById, approveCase, rejectCase } from '../../api/endpoints';
import { formatDate } from '../../utils/formatDate';

const COURT_OPTIONS = ['criminal', 'civil', 'family'];

export default function CaseReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [courtType, setCourtType] = useState('');
  const [expanded, setExpanded] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getCaseById(id)
      .then((res) => {
        const c = res.data.case;
        setCaseData(c);
        setCourtType(c.aiSummary?.recommendedCourt || 'criminal');
      })
      .catch(() => setToast({ message: 'Failed to load case.', type: 'error' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveCase(id, { courtType });
      setToast({ message: 'Case approved successfully.', type: 'success' });
      setTimeout(() => navigate('/admin/dashboard'), 1200);
    } catch {
      setToast({ message: 'Failed to approve case.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionNote.trim()) return;
    setActionLoading(true);
    try {
      await rejectCase(id, { rejectionNote });
      setShowRejectModal(false);
      setToast({ message: 'Case rejected.', type: 'success' });
      setTimeout(() => navigate('/admin/dashboard'), 1200);
    } catch {
      setToast({ message: 'Failed to reject case.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex min-h-screen bg-ice"><AdminSidebar /><main className="ml-64 flex-1"><LoadingSpinner /></main></div>;
  if (!caseData) return null;

  const complaintPreview = caseData.complaintText?.slice(0, 300);
  const isLong = caseData.complaintText?.length > 300;

  return (
    <div className="flex min-h-screen bg-ice">
      <AdminSidebar />

      <main className="ml-64 flex-1">
        {/* Page header */}
        <div className="bg-white border-b border-sky px-8 py-5 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-h1 font-bold text-navy">Review Case</h1>
            <p className="text-caption text-slate mt-0.5">{caseData.caseId}</p>
          </div>
        </div>

        {/* Template C — Two-column */}
        <div className="px-8 py-8 grid grid-cols-3 gap-6 max-w-container mx-auto">

          {/* Left column — col-span-2 */}
          <div className="col-span-2 space-y-6">

            {/* Complaint Details card */}
            <div className="bg-white rounded-lg border border-sky shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3 font-semibold text-navy">Complaint Details</h2>
                <div className="flex items-center gap-2">
                  <Badge status={caseData.status} />
                  <span className="text-caption text-slate">Filed {formatDate(caseData.filedAt)}</span>
                </div>
              </div>

              <h3 className="text-body font-semibold text-navy mb-2">{caseData.title}</h3>

              <div className="text-body text-slate leading-relaxed">
                {expanded ? caseData.complaintText : complaintPreview}
                {!expanded && isLong && (
                  <>
                    <span>…</span>
                    <button
                      onClick={() => setExpanded(true)}
                      className="ml-2 text-steel text-body font-semibold hover:underline"
                    >
                      Show full complaint
                    </button>
                  </>
                )}
                {expanded && isLong && (
                  <button
                    onClick={() => setExpanded(false)}
                    className="ml-2 text-steel text-body font-semibold hover:underline"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>

            {/* AI Summary */}
            <AISummaryBlock aiSummary={caseData.aiSummary} />
          </div>

          {/* Right column — col-span-1 */}
          <div className="col-span-1 space-y-4">
            <div className="bg-white rounded-lg border border-sky shadow-sm p-5 sticky top-6">
              <h3 className="text-h3 font-semibold text-navy mb-4">Actions</h3>

              {/* Court type override */}
              <div className="mb-4">
                <label className="text-body-lg font-semibold text-navy mb-1.5 block">
                  Assign Court Type
                </label>
                <p className="text-caption text-slate mb-2">
                  AI recommended: <Badge status={caseData.aiSummary?.recommendedCourt || '—'} />
                </p>
                <select
                  value={courtType}
                  onChange={(e) => setCourtType(e.target.value)}
                  className="w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors"
                >
                  {COURT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)} Court
                    </option>
                  ))}
                </select>
              </div>

              {/* Approve */}
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className={`w-full text-body font-semibold px-5 py-2.5 rounded-md shadow-sm transition-all mb-2 ${
                  actionLoading
                    ? 'bg-sky text-slate cursor-not-allowed opacity-60'
                    : 'bg-steel text-white hover:bg-navy-mid active:scale-95'
                }`}
              >
                {actionLoading ? 'Processing…' : 'Approve Case'}
              </button>

              {/* Reject */}
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="w-full bg-red-600 text-white text-body font-semibold px-5 py-2.5 rounded-md hover:bg-red-700 transition-all mt-1"
              >
                Reject Case
              </button>

              <p className="text-caption text-slate/70 mt-4 leading-relaxed">
                Approving will notify the accused party and open lawyer selection for the citizen.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal
          title="Reject Case"
          message="Provide a reason for rejection. This will be sent to the citizen."
          confirmLabel="Confirm Rejection"
          onConfirm={handleReject}
          onCancel={() => { setShowRejectModal(false); setRejectionNote(''); }}
          danger
        >
          <textarea
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
            placeholder="Enter rejection reason…"
            rows={4}
            className="w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy placeholder:text-slate/50 resize-none focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors mt-2"
          />
          {!rejectionNote.trim() && (
            <p className="text-caption text-red-600 mt-1">Rejection reason is required.</p>
          )}
        </Modal>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { getAllCases } from '../../api/endpoints';
import { formatDate } from '../../utils/formatDate';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminAllCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const fetchData = async (status) => {
    setLoading(true);
    try {
      const res = await getAllCases(status || undefined);
      setCases(res.data.cases || []);
    } catch {
      setToast({ message: 'Failed to load cases.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(statusFilter);
  }, [statusFilter]);

  const handleCardClick = (c) => {
    if (c.status === 'pending') {
      navigate(`/admin/case/${c.caseId}/review`);
    } else {
      navigate(`/admin/case/${c.caseId}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-ice">
      <AdminSidebar />

      <main className="ml-64 flex-1">
        {/* Page header */}
        <div className="bg-white border-b border-sky px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-bold text-navy">All Cases</h1>
            <p className="text-body text-slate mt-0.5">
              View and manage all cases across every status.
            </p>
          </div>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-steel/10 text-steel text-body font-semibold">
            {cases.length}
          </span>
        </div>

        {/* Filter bar */}
        <div className="px-8 pt-6 pb-2 max-w-container mx-auto">
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  statusFilter === f.value
                    ? 'bg-steel text-white shadow-sm'
                    : 'bg-white border border-sky text-slate hover:border-steel/40 hover:text-navy'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-4 max-w-container mx-auto">
          {loading ? (
            <LoadingSpinner />
          ) : cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-sky/30 flex items-center justify-center mb-4">
                <svg className="text-steel w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-h3 font-semibold text-navy mb-1">No cases found</p>
              <p className="text-body text-slate">
                {statusFilter ? `No ${statusFilter} cases at the moment.` : 'No cases have been filed yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cases.map((c) => (
                <div
                  key={c.caseId}
                  onClick={() => handleCardClick(c)}
                  className="bg-white rounded-lg border border-sky shadow-sm p-6 hover:shadow-md hover:border-steel/40 transition-all cursor-pointer"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge status={c.status} />
                    <span className="text-caption text-slate">{formatDate(c.filedAt)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-h3 font-semibold text-navy mb-2 line-clamp-1">{c.title}</h3>

                  {/* Court type + AI score */}
                  <div className="flex items-center gap-3 mb-3">
                    {c.courtType && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-caption text-slate">Court:</span>
                        <Badge status={c.courtType} />
                      </div>
                    )}
                    {c.aiSummary?.recommendedCourt && !c.courtType && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-caption text-slate">AI:</span>
                        <Badge status={c.aiSummary.recommendedCourt} />
                      </div>
                    )}
                  </div>

                  {/* Complaint preview */}
                  {c.complaintText && (
                    <p className="text-body text-slate line-clamp-2 mb-3 leading-relaxed">
                      {c.complaintText}
                    </p>
                  )}

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-3 border-t border-sky/50">
                    <span className="text-caption text-slate truncate max-w-[160px]">
                      {c.caseId}
                    </span>
                    <span className="text-steel text-body font-semibold">
                      {c.status === 'pending' ? 'Review →' : 'View Details →'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

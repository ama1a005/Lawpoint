import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { getPendingCases } from '../../api/endpoints';
import { formatDate } from '../../utils/formatDate';
import { USE_MOCK, MOCK_CASES } from '../../utils/mockData';

function RelevanceDots({ score }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`w-2.5 h-2.5 rounded-full ${dot <= score ? 'bg-steel' : 'bg-sky/50'}`}
        />
      ))}
      <span className="text-caption text-slate ml-1">{score}/5</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-sky/30 flex items-center justify-center mb-4">
        <svg className="text-steel w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-h3 font-semibold text-navy mb-1">All caught up</p>
      <p className="text-body text-slate">No cases are currently awaiting review.</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 400));
          const pending = MOCK_CASES.filter((c) => c.status === 'pending');
          setCases(pending);
        } else {
          const res = await getPendingCases();
          setCases(res.data.cases || []);
        }
      } catch {
        setToast({ message: 'Failed to load pending cases.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-ice">
      <AdminSidebar />

      <main className="ml-64 flex-1">
        {/* Page header */}
        <div className="bg-white border-b border-sky px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-bold text-navy">Pending Cases</h1>
            <p className="text-body text-slate mt-0.5">
              Review AI-assessed complaints and approve or reject them.
            </p>
          </div>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-steel/10 text-steel text-body font-semibold">
            {cases.length}
          </span>
        </div>

        {/* Content */}
        <div className="px-8 py-8 max-w-container mx-auto">
          {loading ? (
            <LoadingSpinner />
          ) : cases.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cases.map((c) => (
                <div
                  key={c.caseId}
                  className="bg-white rounded-lg border border-sky shadow-sm p-6 hover:shadow-md hover:border-steel/40 transition-all"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge status="pending" />
                    <span className="text-caption text-slate">{formatDate(c.filedAt)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-h3 font-semibold text-navy mb-2">{c.title}</h3>

                  {/* Court type badge from AI */}
                  {c.aiSummary?.recommendedCourt && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-caption text-slate">Recommended court:</span>
                      <Badge status={c.aiSummary.recommendedCourt} />
                    </div>
                  )}

                  {/* Relevance dots */}
                  {c.aiSummary?.relevanceScore != null && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-body text-slate">Relevance:</span>
                      <RelevanceDots score={Math.round(c.aiSummary.relevanceScore * 5)} />
                    </div>
                  )}

                  {/* CaseId + CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-sky/50">
                    <span className="text-caption text-slate truncate max-w-[160px]">
                      {c.caseId}
                    </span>
                    <button
                      onClick={() => navigate(`/admin/case/${c.caseId}/review`)}
                      className="bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all"
                    >
                      Review Case
                    </button>
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

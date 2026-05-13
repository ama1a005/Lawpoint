import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import RequestCard from './RequestCard';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/axios';
import { USE_MOCK, MOCK_REQUESTS, MOCK_CASES } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [activeCases, setActiveCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        setRequests(MOCK_REQUESTS);
        setActiveCases(
          MOCK_CASES.filter((c) => c.status === 'active').map(({ caseId, title, status, filedAt }) => ({ caseId, title, status, filedAt }))
        );
      } else {
        // Fetch lawyer stats
        const meRes = await api.get('/api/v1/auth/me');
        if (meRes.data.success && meRes.data.user) {
          setStats({
            casesHandled: meRes.data.user.casesHandled || 0,
            wins: meRes.data.user.wins || 0,
            losses: meRes.data.user.losses || 0,
            winRate: meRes.data.user.winRate || 0,
          });
        }

        const reqRes = await api.get('/api/v1/lawyers/requests/incoming');
        if (reqRes.data.success) {
          setRequests(reqRes.data.requests);
        }

        try {
          const casesRes = await api.get('/api/v1/cases/my/cases');
          if (casesRes.data.success) {
            setActiveCases(casesRes.data.cases);
          }
        } catch {
          // Non-critical
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = (requestId) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId ? { ...r, status: 'accepted' } : r
      )
    );
    // Refresh active cases after a short delay
    setTimeout(() => {
      api.get('/api/v1/cases/my/cases').then((res) => {
        if (res.data.success) setActiveCases(res.data.cases);
      }).catch(() => {});
    }, 1000);
  };

  const handleDecline = (requestId) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId ? { ...r, status: 'declined' } : r
      )
    );
  };

  return (
    <div className='flex min-h-screen bg-ice'>
      <Navbar role='lawyer' />

      <main className='ml-64 flex-1'>
        {/* Page header */}
        <div className='bg-white border-b border-sky px-8 py-5 flex items-center justify-between'>
          <h1 className='text-h1 font-bold text-navy'>My Dashboard</h1>
        </div>

        {/* Page body */}
        <div className='px-8 py-8 max-w-container mx-auto'>
          {/* Loading */}
          {isLoading && <LoadingSpinner />}

          {/* Error */}
          {!isLoading && error && (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <p className='text-body text-red-600 mb-4'>{error}</p>
              <button
                type='button'
                onClick={fetchData}
                className='text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all'
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* ========== STAT CARDS ========== */}
              {stats && (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                  <div className='bg-white rounded-lg border border-sky shadow-sm p-5 text-center'>
                    <p className='text-caption text-slate'>Cases Handled</p>
                    <p className='text-h1 font-bold text-navy mt-1'>{stats.casesHandled}</p>
                  </div>
                  <div className='bg-white rounded-lg border border-sky shadow-sm p-5 text-center'>
                    <p className='text-caption text-slate'>Wins</p>
                    <p className='text-h1 font-bold text-green-700 mt-1'>{stats.wins}</p>
                  </div>
                  <div className='bg-white rounded-lg border border-sky shadow-sm p-5 text-center'>
                    <p className='text-caption text-slate'>Losses</p>
                    <p className='text-h1 font-bold text-red-600 mt-1'>{stats.losses}</p>
                  </div>
                  <div className='bg-white rounded-lg border border-sky shadow-sm p-5 text-center'>
                    <p className='text-caption text-slate'>Win Rate</p>
                    <p className='text-h1 font-bold text-steel mt-1'>{stats.winRate}%</p>
                  </div>
                </div>
              )}

              {/* ========== SECTION 1: Incoming Requests ========== */}
              <div>
                <h2 className='text-h2 font-bold text-navy mb-4'>Incoming Requests</h2>

                {requests.length === 0 ? (
                  /* Empty state */
                  <div className='flex flex-col items-center justify-center py-16 text-center'>
                    <div className='w-12 h-12 rounded-full bg-sky/30 flex items-center justify-center mb-4'>
                      {/* Briefcase icon */}
                      <svg className='text-steel w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M20.25 14.15v4.075c0 1.24-1.01 2.25-2.25 2.25H6c-1.24 0-2.25-1.01-2.25-2.25V14.15M16.5 6.75V4.875c0-.621-.504-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125V6.75m12 0h-15m15 0a2.25 2.25 0 012.25 2.25v1.15' />
                      </svg>
                    </div>
                    <p className='text-h3 font-semibold text-navy mb-1'>No incoming requests</p>
                    <p className='text-body text-slate'>You have no pending case requests.</p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {requests.map((req) => (
                      <RequestCard
                        key={req.requestId}
                        request={req}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ========== SECTION 2: Active Cases ========== */}
              <div className='mt-8'>
                <h2 className='text-h2 font-bold text-navy mb-4'>Active Cases</h2>

                {activeCases.length === 0 ? (
                  /* Empty state */
                  <div className='flex flex-col items-center justify-center py-16 text-center'>
                    <div className='w-12 h-12 rounded-full bg-sky/30 flex items-center justify-center mb-4'>
                      {/* Document icon */}
                      <svg className='text-steel w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' />
                      </svg>
                    </div>
                    <p className='text-h3 font-semibold text-navy mb-1'>No active cases</p>
                    <p className='text-body text-slate'>You don&apos;t have any active cases yet.</p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {activeCases.map((caseItem) => (
                      <div
                        key={caseItem.caseId}
                        className='bg-white rounded-lg border border-sky shadow-sm p-6 hover:shadow-md hover:border-steel/40 transition-all'
                      >
                        {/* Top row: badge + date */}
                        <div className='flex items-center justify-between'>
                          <Badge status={caseItem.status} />
                          <span className='text-caption text-slate'>
                            {formatDate(caseItem.filedAt)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className='text-h3 font-semibold text-navy mt-3 mb-2 line-clamp-2'>
                          {caseItem.title}
                        </h3>

                        {/* Bottom row: case ID + View button */}
                        <div className='flex items-center justify-between mt-auto'>
                          <span className='text-caption text-slate max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap'>
                            {caseItem.caseId}
                          </span>
                          <button
                            type='button'
                            onClick={() => navigate(`/case/${caseItem.caseId}`)}
                            className='border border-steel text-steel text-body font-semibold px-5 py-2.5 rounded-md hover:bg-sky/20 transition-all'
                          >
                            View Case
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default LawyerDashboard;

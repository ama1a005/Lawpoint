import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AISummaryBlock from '../../components/AISummaryBlock';
import HearingTimeline from '../../components/HearingTimeline';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/axios';
import { USE_MOCK, MOCK_CASES, MOCK_LAWYERS } from '../../utils/mockData';

const CaseDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [lawyerInfo, setLawyerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCase = async () => {
      setIsLoading(true);
      setError('');

      try {
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 600));
          const found = MOCK_CASES.find((c) => c.caseId === id) || MOCK_CASES[0];
          setCaseData(found);
          if (found.lawyerId) {
            const lawyer = MOCK_LAWYERS.find((l) => l.lawyerId === found.lawyerId);
            if (lawyer) setLawyerInfo(lawyer);
          }
        } else {
          const response = await api.get(`/api/v1/cases/${id}`);
          if (response.data.success) {
            const data = response.data.case;
            setCaseData(data);

            if (data.lawyerId) {
              try {
                const lawyerRes = await api.get('/api/v1/lawyers');
                if (lawyerRes.data.success) {
                  const found = lawyerRes.data.lawyers.find(
                    (l) => l.lawyerId === data.lawyerId
                  );
                  if (found) setLawyerInfo(found);
                }
              } catch {
                // Non-critical
              }
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load case details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  /**
   * Determine the lawyer/action state for the right panel.
   */
  const getLawyerActionState = () => {
    if (!caseData) return null;

    const requests = caseData.lawyerRequests || [];
    const hasPending = requests.some((r) => r.status === 'pending');
    const hasAccepted = requests.some((r) => r.status === 'accepted');
    const allDeclined = requests.length > 0 && requests.every((r) => r.status === 'declined');

    if (caseData.status === 'approved' && !hasPending && !hasAccepted) {
      if (allDeclined) {
        return 'reselect';
      }
      return 'select';
    }

    if (hasPending) {
      return 'awaiting';
    }

    if (caseData.status === 'active' && caseData.lawyerId) {
      return 'assigned';
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen bg-ice'>
        <Navbar role='citizen' />
        <main className='ml-64 flex-1'>
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen bg-ice'>
        <Navbar role='citizen' />
        <main className='ml-64 flex-1'>
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <p className='text-body text-red-600 mb-4'>{error}</p>
            <button
              type='button'
              onClick={() => navigate('/dashboard')}
              className='text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all'
            >
              Back to My Cases
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!caseData) return null;

  const actionState = getLawyerActionState();

  return (
    <div className='flex min-h-screen bg-ice'>
      <Navbar role='citizen' />

      <main className='ml-64 flex-1'>
        {/* Page header */}
        <div className='bg-white border-b border-sky px-8 py-5 flex items-center justify-between'>
          <h1 className='text-h1 font-bold text-navy'>{caseData.title}</h1>
        </div>

        {/* Two-column layout */}
        <div className='px-8 py-8 grid grid-cols-3 gap-6 max-w-container mx-auto'>
          {/* ==================== LEFT COLUMN ==================== */}
          <div className='col-span-2 space-y-6'>
            {/* 1. Case Info Card */}
            <div className='bg-white rounded-lg border border-sky shadow-sm p-6'>
              <h3 className='text-h3 font-semibold text-navy mb-4'>Case Information</h3>

              {/* Metadata grid */}
              <dl className='grid grid-cols-2 gap-x-6 gap-y-3'>
                <div>
                  <dt className='text-caption text-slate'>Case ID</dt>
                  <dd className='text-body text-navy mt-0.5 break-all'>{caseData.caseId}</dd>
                </div>
                <div>
                  <dt className='text-caption text-slate'>Filed On</dt>
                  <dd className='text-body text-navy mt-0.5'>{formatDate(caseData.filedAt)}</dd>
                </div>
                <div>
                  <dt className='text-caption text-slate'>Court Type</dt>
                  <dd className='mt-0.5'>
                    {caseData.courtType ? (
                      <Badge status={caseData.courtType} />
                    ) : (
                      <span className='text-body text-slate italic'>Pending assignment</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className='text-caption text-slate'>Status</dt>
                  <dd className='mt-0.5'>
                    <Badge status={caseData.status} />
                  </dd>
                </div>
              </dl>

              {/* Complaint text */}
              <div className='mt-4'>
                <p className='text-body-lg font-semibold text-navy mb-2'>Complaint</p>
                <p className='text-body text-slate leading-relaxed'>{caseData.complaintText}</p>
              </div>
            </div>

            {/* 2. AI Summary (only when not pending and aiSummary exists) */}
            {caseData.status !== 'pending' && caseData.aiSummary && (
              <AISummaryBlock aiSummary={caseData.aiSummary} />
            )}

            {/* 3. Hearing Timeline */}
            {caseData.hearings && caseData.hearings.length > 0 && (
              <div>
                <h2 className='text-h2 font-bold text-navy mb-4'>Hearing Timeline</h2>
                <HearingTimeline hearings={caseData.hearings} showUpdateButton={false} />
              </div>
            )}

            {/* 4. Final Outcome (only when closed) */}
            {caseData.status === 'closed' && (
              <div className='bg-navy/5 border border-sky rounded-lg p-5'>
                <h3 className='text-h3 font-semibold text-navy'>Case Closed</h3>
                {caseData.closedAt && (
                  <p className='text-caption text-slate mt-1'>
                    Closed on {formatDate(caseData.closedAt)}
                  </p>
                )}
                {caseData.outcome && (
                  <p className='text-body text-slate leading-relaxed mt-3'>
                    {caseData.outcome}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ==================== RIGHT COLUMN ==================== */}
          <div className='col-span-1 space-y-4'>
            {/* Status panel (sticky) */}
            <div className='bg-white rounded-lg border border-sky shadow-sm p-6 sticky top-6'>
              {/* Current status */}
              <div className='mb-4'>
                <p className='text-caption text-slate mb-1'>Status</p>
                <Badge status={caseData.status} />
              </div>

              {/* Filed date */}
              <div className='mb-3'>
                <p className='text-caption text-slate'>Filed</p>
                <p className='text-body text-navy mt-0.5'>{formatDate(caseData.filedAt)}</p>
              </div>

              {/* Court type */}
              <div className='mb-6'>
                <p className='text-caption text-slate mb-1'>Court</p>
                {caseData.courtType ? (
                  <Badge status={caseData.courtType} />
                ) : (
                  <p className='text-body text-slate italic'>Awaiting assignment</p>
                )}
              </div>

              {/* Divider */}
              <div className='border-t border-sky pt-4'>
                {/* Select a Lawyer */}
                {actionState === 'select' && (
                  <button
                    type='button'
                    onClick={() => navigate(`/case/${id}/lawyer`)}
                    className='w-full bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
                  >
                    Select a Lawyer
                  </button>
                )}

                {/* Awaiting response */}
                {actionState === 'awaiting' && (
                  <button
                    type='button'
                    disabled
                    className='w-full bg-sky text-slate text-body font-semibold px-5 py-2.5 rounded-md cursor-not-allowed opacity-60'
                  >
                    Awaiting Lawyer Response
                  </button>
                )}

                {/* Re-select after all declined */}
                {actionState === 'reselect' && (
                  <button
                    type='button'
                    onClick={() => navigate(`/case/${id}/lawyer`)}
                    className='w-full border border-red-600 text-red-600 text-body font-semibold px-5 py-2.5 rounded-md hover:bg-red-50 transition-all'
                  >
                    Select New Lawyer
                  </button>
                )}

                {/* Lawyer assigned */}
                {actionState === 'assigned' && (
                  <div>
                    <p className='text-body-lg font-semibold text-navy mb-3'>Your Lawyer</p>
                    {lawyerInfo ? (
                      <div className='bg-ice rounded-md border border-sky p-4'>
                        <p className='text-body font-semibold text-navy'>{lawyerInfo.name}</p>
                        <p className='text-caption text-slate mt-1'>Bar ID: {lawyerInfo.barId}</p>
                        <p className='text-caption text-slate'>{lawyerInfo.specialisation}</p>
                      </div>
                    ) : (
                      <p className='text-body text-slate'>
                        Lawyer assigned — see case details
                      </p>
                    )}
                  </div>
                )}

                {/* Rejected case message */}
                {caseData.status === 'rejected' && (
                  <div className='bg-red-50 border border-red-200 rounded-md p-4'>
                    <p className='text-body font-semibold text-red-700'>Case Rejected</p>
                    <p className='text-caption text-slate mt-1'>
                      This complaint was rejected during review. You may file a new complaint.
                    </p>
                    <button
                      type='button'
                      onClick={() => navigate('/case/new')}
                      className='mt-3 text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all'
                    >
                      File New Complaint
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseDashboard;

import { useState } from 'react';
import Badge from '../../components/Badge';
import AISummaryBlock from '../../components/AISummaryBlock';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/axios';
import { USE_MOCK } from '../../utils/mockData';

/**
 * RequestCard — displays a single incoming lawyer request.
 *
 * Props:
 *   request    { requestId, caseId, citizenName, courtType, requestedAt, status, Case? }
 *   onAccept   (requestId) => void
 *   onDecline  (requestId) => void
 */
const RequestCard = ({ request, onAccept, onDecline }) => {
  const [localStatus, setLocalStatus] = useState(request.status);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const caseData = request.Case || null;

  const handleAccept = async () => {
    setIsProcessing(true);
    // Optimistic update
    setLocalStatus('accepted');

    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        await api.patch(`/api/v1/lawyers/request/${request.requestId}/accept`);
      }
      onAccept && onAccept(request.requestId);
    } catch {
      setLocalStatus('pending');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    // Optimistic update
    setLocalStatus('declined');

    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        await api.patch(`/api/v1/lawyers/request/${request.requestId}/decline`);
      }
      onDecline && onDecline(request.requestId);
    } catch {
      setLocalStatus('pending');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className='bg-white rounded-lg border border-sky shadow-sm p-5'>
        {/* Top row: case reference + status badge */}
        <div className='flex items-center justify-between mb-3'>
          <span className='text-caption text-slate'>
            Case: {request.caseId?.substring(0, 8)}...
          </span>
          <Badge status={localStatus} />
        </div>

        {/* Middle: citizen name, court type, date */}
        <p className='text-body font-semibold text-navy'>
          {request.citizenName || caseData?.title || 'Citizen'}
        </p>
        {caseData?.title && (
          <p className='text-caption text-slate mt-0.5 line-clamp-1'>{caseData.title}</p>
        )}
        <div className='flex items-center gap-2 mt-1 mb-1'>
          <Badge status={request.courtType || caseData?.courtType || caseData?.status} />
        </div>
        <p className='text-caption text-slate'>{formatDate(request.requestedAt)}</p>

        {/* View Details button */}
        <button
          type='button'
          onClick={() => setShowDetails(true)}
          className='w-full mt-3 border border-steel text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all'
        >
          View Case Details
        </button>

        {/* Bottom: action buttons (only when pending) */}
        {localStatus === 'pending' && (
          <div className='flex justify-between mt-3'>
            <button
              type='button'
              disabled={isProcessing}
              onClick={handleDecline}
              className='border border-red-400 text-red-500 text-body font-semibold px-5 py-2.5 rounded-md hover:bg-red-50 transition-all'
            >
              Decline
            </button>
            <button
              type='button'
              disabled={isProcessing}
              onClick={handleAccept}
              className='bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
            >
              Accept
            </button>
          </div>
        )}
      </div>

      {/* ── Case Details Modal ────────────────────────────────────── */}
      {showDetails && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm'
          onClick={() => setShowDetails(false)}
        >
          <div
            className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 mx-4'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className='flex items-center justify-between mb-5'>
              <h2 className='text-h2 font-bold text-navy'>Case Details</h2>
              <button
                type='button'
                onClick={() => setShowDetails(false)}
                className='text-slate hover:text-navy transition-colors p-1'
              >
                <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            {caseData ? (
              <div className='space-y-5'>
                {/* Title */}
                <div>
                  <h3 className='text-h3 font-semibold text-navy'>{caseData.title}</h3>
                </div>

                {/* Metadata grid */}
                <dl className='grid grid-cols-2 gap-x-6 gap-y-3'>
                  <div>
                    <dt className='text-caption text-slate'>Case ID</dt>
                    <dd className='text-body text-navy mt-0.5 break-all'>{caseData.caseId || request.caseId}</dd>
                  </div>
                  <div>
                    <dt className='text-caption text-slate'>Filed On</dt>
                    <dd className='text-body text-navy mt-0.5'>{formatDate(caseData.filedAt)}</dd>
                  </div>
                  <div>
                    <dt className='text-caption text-slate'>Filed By</dt>
                    <dd className='text-body text-navy mt-0.5'>{request.citizenName || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className='text-caption text-slate'>Status</dt>
                    <dd className='mt-0.5'><Badge status={caseData.status} /></dd>
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
                    <dt className='text-caption text-slate'>Accused Party</dt>
                    <dd className='text-body text-navy mt-0.5'>{caseData.accusedPartyContact || '—'}</dd>
                  </div>
                </dl>

                {/* Complaint text */}
                <div>
                  <p className='text-body-lg font-semibold text-navy mb-2'>Complaint</p>
                  <div className='bg-ice rounded-md border border-sky p-4'>
                    <p className='text-body text-slate leading-relaxed'>{caseData.complaintText}</p>
                  </div>
                </div>

                {/* AI Summary */}
                {caseData.aiSummary && (
                  <AISummaryBlock aiSummary={caseData.aiSummary} />
                )}

                {/* Action buttons inside modal (only when pending) */}
                {localStatus === 'pending' && (
                  <div className='flex justify-end gap-3 pt-3 border-t border-sky'>
                    <button
                      type='button'
                      disabled={isProcessing}
                      onClick={() => { handleDecline(); setShowDetails(false); }}
                      className='border border-red-400 text-red-500 text-body font-semibold px-6 py-2.5 rounded-md hover:bg-red-50 transition-all'
                    >
                      Decline Request
                    </button>
                    <button
                      type='button'
                      disabled={isProcessing}
                      onClick={() => { handleAccept(); setShowDetails(false); }}
                      className='bg-steel text-white text-body font-semibold px-6 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
                    >
                      Accept Request
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='text-center py-8'>
                <p className='text-body text-slate'>Case details not available.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RequestCard;

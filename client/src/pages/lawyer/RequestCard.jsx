import { useState } from 'react';
import Badge from '../../components/Badge';
import { formatDate } from '../../utils/formatDate';
import api from '../../api/axios';
import { USE_MOCK } from '../../utils/mockData';

/**
 * RequestCard — displays a single incoming lawyer request.
 *
 * Props:
 *   request    { requestId, caseId, citizenName, courtType, requestedAt, status }
 *   onAccept   (requestId) => void
 *   onDecline  (requestId) => void
 */
const RequestCard = ({ request, onAccept, onDecline }) => {
  const [localStatus, setLocalStatus] = useState(request.status);
  const [isProcessing, setIsProcessing] = useState(false);

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
    <div className='bg-white rounded-lg border border-sky shadow-sm p-5'>
      {/* Top row: case reference + status badge */}
      <div className='flex items-center justify-between mb-3'>
        <span className='text-caption text-slate'>
          Case: {request.caseId}
        </span>
        <Badge status={localStatus} />
      </div>

      {/* Middle: citizen name, court type, date */}
      <p className='text-body font-semibold text-navy'>{request.citizenName}</p>
      <div className='flex items-center gap-2 mt-1 mb-1'>
        <Badge status={request.courtType} />
      </div>
      <p className='text-caption text-slate'>{formatDate(request.requestedAt)}</p>

      {/* Bottom: action buttons (only when pending) */}
      {localStatus === 'pending' && (
        <div className='flex justify-between mt-4'>
          <button
            type='button'
            disabled={isProcessing}
            onClick={handleDecline}
            className='border border-steel text-steel text-body font-semibold px-5 py-2.5 rounded-md hover:bg-sky/20 transition-all'
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
  );
};

export default RequestCard;

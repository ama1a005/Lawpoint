import { formatDate } from '../utils/formatDate';

/**
 * HearingTimeline — vertical timeline of hearing records.
 *
 * Props:
 *   hearings          (array)  — list of { hearingId, scheduledDate, notes, outcome }
 *   showUpdateButton  (bool)   — if true, renders an "Update Outcome" button per hearing
 *   onUpdate          (fn?)    — callback: onUpdate(hearingId) — for admin use
 */
const HearingTimeline = ({ hearings = [], showUpdateButton = false, onUpdate }) => {
  if (!hearings || hearings.length === 0) {
    return (
      <p className='text-body text-slate italic'>No hearings scheduled yet.</p>
    );
  }

  return (
    <div className='space-y-0'>
      {hearings.map((hearing, index) => (
        <div
          key={hearing.hearingId || index}
          className={`relative pl-6 ${index < hearings.length - 1 ? 'border-l-2 border-sky' : ''}`}
        >
          {/* Timeline dot */}
          <div className='absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-steel bg-white' />

          {/* Hearing card */}
          <div className='bg-white rounded-md border border-sky shadow-sm p-4 mb-4 ml-2'>
            {/* Top row: date + status */}
            <div className='flex items-center justify-between mb-2'>
              <span className='text-body font-semibold text-navy'>
                {formatDate(hearing.scheduledDate)}
              </span>
              {hearing.outcome ? (
                <span className='text-caption text-green-700 font-semibold'>Completed</span>
              ) : (
                <span className='text-caption text-slate'>Scheduled</span>
              )}
            </div>

            {/* Notes */}
            {hearing.notes && (
              <p className='text-body text-slate mb-1'>{hearing.notes}</p>
            )}

            {/* Outcome */}
            {hearing.outcome && (
              <p className='text-body text-navy font-medium'>
                Outcome: {hearing.outcome}
              </p>
            )}

            {/* Admin update button */}
            {showUpdateButton && (
              <button
                type='button'
                className='border border-steel text-steel text-body font-semibold px-5 py-2.5 rounded-md hover:bg-sky/20 transition-all mt-3'
                onClick={() => onUpdate && onUpdate(hearing.hearingId)}
              >
                Update Outcome
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HearingTimeline;

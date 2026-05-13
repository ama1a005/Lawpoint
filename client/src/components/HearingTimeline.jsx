import Badge from './Badge';
import { formatDate } from '../utils/formatDate';

/**
 * HearingTimeline — vertical timeline of hearing records.
 *
 * Props:
 *   hearings          (array)  — list of { hearingId, scheduledDate, notes, outcome }
 *   showUpdateButton  (bool)   — if true, renders an "Update Outcome" button per hearing
 *   onUpdate          (fn?)    — callback: onUpdate(hearing) — for admin use
 */
const HearingTimeline = ({ hearings = [], showUpdateButton = false, onUpdate }) => {
  if (!hearings || hearings.length === 0) {
    return (
      <p className='text-body text-slate italic'>No hearings scheduled yet.</p>
    );
  }

  return (
    <div className='space-y-0'>
      {hearings.map((hearing, index) => {
        const hasOutcome = Boolean(hearing.outcome);
        const isPast = new Date(hearing.scheduledDate) < new Date();

        return (
          <div
            key={hearing.hearingId || index}
            className={`relative pl-6 ${index < hearings.length - 1 ? 'border-l-2 border-sky' : ''}`}
          >
            {/* Timeline dot */}
            <div
              className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                hasOutcome ? 'border-green-500' : isPast ? 'border-amber-500' : 'border-steel'
              }`}
            />

            {/* Hearing card */}
            <div className='bg-white rounded-md border border-sky shadow-sm p-4 mb-4 ml-2'>
              {/* Top row: date + status */}
              <div className='flex items-center justify-between mb-2'>
                <span className='text-body font-semibold text-navy'>
                  {formatDate(hearing.scheduledDate)}
                </span>
                {hasOutcome ? (
                  <span className='inline-flex items-center gap-1.5 text-caption text-green-700 font-semibold'>
                    <span className='w-2 h-2 rounded-full bg-green-500' />
                    Completed
                  </span>
                ) : isPast ? (
                  <span className='inline-flex items-center gap-1.5 text-caption text-amber-600 font-semibold'>
                    <span className='w-2 h-2 rounded-full bg-amber-500' />
                    Awaiting Outcome
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1.5 text-caption text-steel font-semibold'>
                    <span className='w-2 h-2 rounded-full bg-steel' />
                    Scheduled
                  </span>
                )}
              </div>

              {/* Notes */}
              {hearing.notes && (
                <div className='mb-2'>
                  <p className='text-caption text-slate font-semibold mb-0.5'>Court Notes</p>
                  <p className='text-body text-slate'>{hearing.notes}</p>
                </div>
              )}

              {/* Outcome */}
              {hasOutcome && (
                <div className='bg-green-50 border border-green-200 rounded-md p-3 mt-2'>
                  <p className='text-caption text-green-800 font-semibold mb-0.5'>Hearing Outcome</p>
                  <p className='text-body text-green-900 leading-relaxed'>{hearing.outcome}</p>
                </div>
              )}

              {/* Admin update button — only for hearings without an outcome */}
              {showUpdateButton && !hasOutcome && (
                <button
                  type='button'
                  className='border border-steel text-steel text-body font-semibold px-5 py-2.5 rounded-md hover:bg-sky/20 transition-all mt-3'
                  onClick={() => onUpdate && onUpdate(hearing)}
                >
                  Update Outcome
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HearingTimeline;

import { formatDate, formatDateTime } from '../utils/formatDate';

export default function HearingTimeline({ hearings = [], showUpdateButton = false, onUpdate }) {
  if (!hearings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 rounded-full bg-sky/30 flex items-center justify-center mb-3">
          <svg className="text-steel w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-h3 font-semibold text-navy mb-1">No hearings scheduled</p>
        <p className="text-body text-slate">Hearings will appear here once scheduled by the admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {hearings.map((hearing, idx) => (
        <div key={hearing.hearingId} className="relative pl-6 border-l-2 border-sky last:border-l-0">
          {/* Timeline dot */}
          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-steel bg-white" />

          {/* Hearing card */}
          <div className="bg-white rounded-md border border-sky shadow-sm p-4 mb-4 ml-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-body font-semibold text-navy">
                {formatDateTime(hearing.scheduledDate)}
              </span>
              {hearing.outcome ? (
                <span className="text-caption text-green-700 font-semibold">Completed</span>
              ) : (
                <span className="text-caption text-slate">Scheduled</span>
              )}
            </div>

            {hearing.notes && (
              <p className="text-body text-slate mb-2">{hearing.notes}</p>
            )}

            {hearing.outcome && (
              <p className="text-body text-navy font-medium">
                Outcome: {hearing.outcome}
              </p>
            )}

            {showUpdateButton && !hearing.outcome && (
              <div className="mt-3 pt-3 border-t border-sky/50">
                <button
                  onClick={() => onUpdate?.(hearing)}
                  className="border border-steel text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all text-sm"
                >
                  Update Outcome
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

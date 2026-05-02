import { useState } from 'react';
import Modal from '../../components/Modal';
import { createHearing, updateHearing } from '../../api/endpoints';

/**
 * HearingForm
 * Props:
 *   caseId   — required for create mode
 *   hearing  — if provided, renders in update mode
 *   onClose  — called after success or cancel
 *   onSuccess — called with the saved hearing, so parent can refresh
 */
export default function HearingForm({ caseId, hearing = null, onClose, onSuccess }) {
  const isUpdate = Boolean(hearing);

  const [scheduledDate, setScheduledDate] = useState(
    isUpdate && hearing.scheduledDate
      ? new Date(hearing.scheduledDate).toISOString().slice(0, 16)
      : ''
  );
  const [notes, setNotes] = useState(hearing?.notes || '');
  const [outcome, setOutcome] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!isUpdate && !scheduledDate) {
      setError('Please select a date and time.');
      return;
    }
    if (isUpdate && !outcome.trim()) {
      setError('Outcome is required to update a hearing.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isUpdate) {
        res = await updateHearing(hearing.hearingId, {
          outcome,
          ...(nextDate ? { nextDate } : {}),
        });
      } else {
        res = await createHearing({ caseId, scheduledDate, notes });
      }
      onSuccess?.(res.data.hearing);
      onClose?.();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isUpdate ? 'Update Hearing' : 'Schedule Hearing'}
      confirmLabel={loading ? 'Saving…' : isUpdate ? 'Save Update' : 'Schedule Hearing'}
      onConfirm={handleSubmit}
      onCancel={onClose}
      danger={false}
    >
      <div className="space-y-4 mt-2">
        {!isUpdate && (
          <>
            {/* Date & Time */}
            <div>
              <label className="text-body-lg font-semibold text-navy mb-1.5 block">
                Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-body-lg font-semibold text-navy mb-1.5 block">
                Court Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any preliminary notes for this hearing…"
                rows={3}
                className="w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy placeholder:text-slate/50 resize-none focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors"
              />
            </div>
          </>
        )}

        {isUpdate && (
          <>
            {/* Outcome */}
            <div>
              <label className="text-body-lg font-semibold text-navy mb-1.5 block">
                Hearing Outcome
              </label>
              <textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Describe what happened in this hearing…"
                rows={3}
                className="w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy placeholder:text-slate/50 resize-none focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors"
              />
            </div>

            {/* Next hearing date (optional) */}
            <div>
              <label className="text-body-lg font-semibold text-navy mb-1.5 block">
                Next Hearing Date{' '}
                <span className="text-body text-slate font-normal">(if applicable)</span>
              </label>
              <input
                type="datetime-local"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full bg-white border border-sky rounded-md px-4 py-2.5 text-body text-navy focus:outline-none focus:ring-2 focus:ring-steel/40 focus:border-steel transition-colors"
              />
            </div>
          </>
        )}

        {error && <p className="text-caption text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}

import { useEffect } from 'react';

/**
 * Toast — auto-dismissing notification in the bottom-right corner.
 *
 * Props:
 *   message  (string)              — the notification text
 *   type     ('success' | 'error') — determines border colour
 *   onClose  (fn)                  — called when toast dismisses or user clicks ×
 */
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const borderClass = type === 'error' ? 'border-red-500' : 'border-green-500';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3
                  bg-white border-l-4 ${borderClass} shadow-lg
                  rounded-md px-5 py-3 text-body text-navy
                  animate-[slideIn_0.3s_ease-out]`}
    >
      {/* Icon */}
      {type === 'success' ? (
        <svg className='w-5 h-5 text-green-500 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
          <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
        </svg>
      ) : (
        <svg className='w-5 h-5 text-red-500 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
          <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z' />
        </svg>
      )}

      {/* Message */}
      <span className='flex-1'>{message}</span>

      {/* Close button */}
      <button
        onClick={onClose}
        className='text-slate hover:text-navy transition-colors ml-2 flex-shrink-0'
        aria-label='Close notification'
      >
        <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
          <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
        </svg>
      </button>
    </div>
  );
};

export default Toast;

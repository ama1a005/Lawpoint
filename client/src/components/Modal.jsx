/**
 * Modal — confirmation / action modal with backdrop blur.
 *
 * Props:
 *   isOpen        (bool)     — controls visibility
 *   title         (string)   — modal heading
 *   message       (string?)  — optional body text
 *   confirmLabel  (string)   — confirm button text
 *   onConfirm     (fn)       — called when confirm clicked
 *   onCancel      (fn)       — called when cancel clicked or backdrop clicked
 *   danger        (bool?)    — if true, confirm button uses Danger variant
 *   children      (node?)    — extra content rendered between message and buttons
 */
const Modal = ({ isOpen, title, message, confirmLabel, onConfirm, onCancel, danger, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm'
      onClick={onCancel}
    >
      <div
        className='bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h3 className='text-h3 font-semibold text-navy mb-3'>{title}</h3>

        {/* Message */}
        {message && (
          <p className='text-body text-slate mb-4'>{message}</p>
        )}

        {/* Extra content (form fields, textareas, etc.) */}
        {children}

        {/* Action buttons */}
        <div className='flex justify-end gap-3 mt-6'>
          {/* Cancel — Ghost variant */}
          <button
            type='button'
            className='text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all'
            onClick={onCancel}
          >
            Cancel
          </button>

          {/* Confirm — Danger or Primary variant */}
          <button
            type='button'
            className={
              danger
                ? 'bg-red-600 text-white text-body font-semibold px-5 py-2.5 rounded-md hover:bg-red-700 transition-all'
                : 'bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

export default function Modal({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
        <h3 className="text-h3 font-semibold text-navy mb-3">{title}</h3>
        {message && <p className="text-body text-slate mb-4">{message}</p>}
        {children && <div className="mb-6">{children}</div>}
        {!children && <div className="mb-6" />}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-steel text-body font-semibold px-4 py-2 rounded-md hover:bg-sky/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={
              danger
                ? 'bg-red-600 text-white text-body font-semibold px-5 py-2.5 rounded-md hover:bg-red-700 transition-all'
                : 'bg-steel text-white text-body font-semibold px-5 py-2.5 rounded-md shadow-sm hover:bg-navy-mid active:scale-95 transition-all'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

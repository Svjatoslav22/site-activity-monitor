interface DeleteModalProps {
  isOpen: boolean;
  siteName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean; // Щоб показувати стан завантаження
}

export default function DeleteModal({
  isOpen,
  siteName,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteModalProps) {
  if (!isOpen) return null; // Якщо isOpen = false, нічого не рендеримо

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl shadow-slate-900/20 transition-all duration-200 animate-[fadeIn_0.2s_ease-out]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <i className="ph ph-trash text-2xl text-red-600"></i>
        </div>
        <h3 className="mb-2 text-lg font-semibold tracking-tight text-gray-900">
          Видалити сайт?
        </h3>
        <p className="mb-6 text-sm text-gray-500">
          Ви дійсно хочете видалити
          <span className="font-medium text-gray-900 ml-1 mr-1">
            {siteName}
          </span>
          ? Цю дію неможливо скасувати.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          >
            Скасувати
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            {isDeleting ? (
              <i className="ph ph-spinner animate-spin text-lg"></i>
            ) : (
              'Видалити'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

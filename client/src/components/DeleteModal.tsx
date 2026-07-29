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
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center transform transition-all animate-[fadeIn_0.2s_ease-out]">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <i className="ph ph-trash text-2xl text-red-600"></i>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Видалити сайт?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
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
            className="px-4 py-2 w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Скасувати
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 w-full text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
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

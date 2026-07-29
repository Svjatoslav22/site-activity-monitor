import { useState } from 'react';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddModal({ isOpen, onClose, onAdded }: AddModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          urlToCheck: url,
          url: url,
          interval: 60, // За замовчуванням раз на годину
        }),
      });

      if (!response.ok) throw new Error('Помилка при створенні');

      setName(''); // Очищаємо поля після успішного збереження
      setUrl('');
      onAdded(); // Оновлюємо список
      onClose(); // Закриваємо модалку
    } catch (error) {
      console.error('Помилка додавання:', error);
      alert('Не вдалося додати сайт');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all animate-[fadeIn_0.2s_ease-out]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Додати новий сайт
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Назва сайту
            </label>
            <input
              type="text"
              required
              placeholder="Наприклад: Мій Блог"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL адреса
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <i className="ph ph-spinner animate-spin"></i>
              ) : (
                <i className="ph ph-plus-circle"></i>
              )}
              {isSaving ? 'Додавання...' : 'Додати'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 transition-all duration-200 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">
            Додати новий сайт
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Закрити форму додавання"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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

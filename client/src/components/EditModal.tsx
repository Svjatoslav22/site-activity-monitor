import { useState } from 'react';

// 1. Описуємо тип для сайту, щоб TypeScript не сварився на `any`
interface SiteData {
  id: string;
  name: string;
  url: string;
  interval?: number;
}

interface EditModalProps {
  isOpen: boolean;
  site: SiteData | null; // Замінили any на наш новий тип SiteData
  onClose: () => void;
  onSaved: () => void;
}

export default function EditModal({ isOpen, site, onClose, onSaved }: EditModalProps) {
  const [name, setName] = useState(site?.name || '');
  const [url, setUrl] = useState(site?.url || '');
  const [interval, setIntervalTime] = useState(site?.interval || 60);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !site) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/monitors/${site.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, interval }),
      });

      if (!response.ok) throw new Error('Помилка при оновленні');

      onSaved(); 
      onClose(); 
    } catch (error) {
      console.error('Помилка редагування:', error);
      alert('Не вдалося зберегти зміни');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 transition-all duration-200 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">Редагувати монітор</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" aria-label="Закрити форму редагування">
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Назва сайту</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">URL адреса</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Інтервал перевірки (хв)</label>
            <input
              type="number"
              min="1"
              required
              value={interval}
              onChange={(e) => setIntervalTime(parseInt(e.target.value, 10))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
            />
            <p className="text-xs text-gray-400 mt-1">Як часто перевіряти сайт (у хвилинах)</p>
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
              {isSaving ? <i className="ph ph-spinner animate-spin"></i> : <i className="ph ph-floppy-disk"></i>}
              {isSaving ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
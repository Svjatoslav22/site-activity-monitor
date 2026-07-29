import { useState, useEffect } from 'react';

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
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [interval, setIntervalTime] = useState(60);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (site && isOpen) {
      // Кажемо лінтеру не сваритися, бо для форми модалки це ок
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(site.name || '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrl(site.url || '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIntervalTime(site.interval || 60);
    }
  }, [site, isOpen]);

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
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all animate-[fadeIn_0.2s_ease-out]">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Редагувати монітор</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">URL адреса</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Як часто перевіряти сайт (у хвилинах)</p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 disabled:opacity-50"
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
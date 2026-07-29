import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SiteCard from './components/SiteCard';
import DeleteModal from './components/DeleteModal'; // ДОДАНО ІМПОРТ МОДАЛКИ
import EditModal from './components/EditModal';
import AddModal from './components/AddModal';

interface ApiMonitor {
  _id?: string;
  id?: string;
  name?: string;
  url?: string;
  urlToCheck?: string;
  lastStatus?: string;
  lastCheckedAt?: string;
}

interface MonitorStats {
  lastCheck?: string;
  latestPing?: number;
  averageResponseTime?: number;
  uptimePercentage?: number | string;
  uptimePercent?: number | string;
}

interface HistoryCheck {
  status?: string;
  statusCode?: number;
}

interface Site {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'pending';
  uptime: string | number;
  lastChecked: string;
  ping: string;
  history: number[];
}

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [siteToDelete, setSiteToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSites = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/monitors');
      if (!response.ok) throw new Error('Помилка сервера');

      const monitorsData = await response.json();

      const enrichedSitesData = await Promise.all(
        monitorsData.map(async (item: ApiMonitor) => {
          const id = item._id || item.id || '';

          let stats: MonitorStats = {};
          let history: number[] = Array(40).fill(0);

          try {
            const [statsRes, histRes] = await Promise.all([
              fetch(`/api/monitors/${id}/stats`),
              fetch(`/api/monitors/${id}/history`),
            ]);

            if (statsRes.ok) stats = await statsRes.json();

            if (histRes.ok) {
              const rawHistory = await histRes.json();
              if (Array.isArray(rawHistory) && rawHistory.length > 0) {
                const bars = rawHistory
                  .slice(0, 40)
                  .reverse()
                  .map((check: HistoryCheck) =>
                    check.status === 'up' ||
                    check.statusCode === 200 ||
                    check.status === 'active'
                      ? 1
                      : 0,
                  );
                while (bars.length < 40) bars.unshift(0);
                history = bars;
              }
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            console.warn(`Could not fetch stats/history for ${item.name}`);
          }

          const lastCheckedDate = stats.lastCheck
            ? new Date(stats.lastCheck)
            : item.lastCheckedAt
              ? new Date(item.lastCheckedAt)
              : null;
          const formattedTime = lastCheckedDate
            ? lastCheckedDate.toLocaleTimeString('uk-UA', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Ще не перевірено';

          let ping = 'Очікування...';
          if (stats.latestPing != null && stats.latestPing >= 0)
            ping = `${Math.round(stats.latestPing)} мс`;
          else if (
            stats.averageResponseTime != null &&
            stats.averageResponseTime >= 0
          )
            ping = `${Math.round(stats.averageResponseTime)} мс (сер.)`;

          const uptime =
            stats.uptimePercentage != null
              ? Number(stats.uptimePercentage).toFixed(1)
              : stats.uptimePercent != null
                ? Number(stats.uptimePercent).toFixed(1)
                : '—';

          return {
            id,
            name: item.name || 'Сайт',
            url: item.url || item.urlToCheck || 'N/A',
            status: item.lastStatus === 'up' ? 'active' : 'inactive',
            uptime,
            lastChecked: formattedTime,
            ping,
            history,
          };
        }),
      );

      setSites(enrichedSitesData);
    } catch (error) {
      console.error('Помилка завантаження:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      await fetchSites();
    };

    initFetch();

    const interval = setInterval(fetchSites, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async (id: string) => {
    try {
      const response = await fetch(`/api/monitors/${id}/check`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Помилка перевірки');
      await fetchSites();
    } catch (error) {
      console.error('Помилка оновлення сайту:', error);
    }
  };

  // --- ОБРОБНИКИ ДЛЯ МОДАЛОК ---

  const handleEditClick = (site: Site) => {
    setSiteToEdit(site);
    setIsEditModalOpen(true);
  };
  const handleDeleteClick = (id: string, name: string) => {
    setSiteToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };
  useEffect(() => {
    // Обгортаємо перший виклик у асинхронну функцію, щоб лінтер не сварився на setState
    const initFetch = async () => {
      await fetchSites();
    };

    initFetch();

    const interval = setInterval(fetchSites, 30000);
    return () => clearInterval(interval);
  }, []);

  const confirmDelete = async () => {
    if (!siteToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/monitors/${siteToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Помилка при видаленні');

      await fetchSites(); // Оновлюємо список після видалення
      setIsDeleteModalOpen(false); // Закриваємо модалку
    } catch (error) {
      console.error('Помилка видалення:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="text-gray-800 antialiased min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Моніторинг сайтів
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Відстежуйте доступність ваших ресурсів у реальному часі
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
          >
            <i className="ph ph-plus-circle text-lg"></i>
            Додати сайт
          </button>
        </div>

        {isLoading && sites.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="ph ph-spinner animate-spin text-4xl text-blue-500"></i>
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Немає доданих сайтів.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onRefresh={handleRefresh}
                onEdit={handleEditClick} // ДОДАНО
                onDelete={handleDeleteClick} // ДОДАНО
              />
            ))}
          </div>
        )}

        {/* --- ПІДКЛЮЧАЄМО МОДАЛКУ ВИДАЛЕННЯ --- */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          siteName={siteToDelete?.name || ''}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
        <EditModal
          isOpen={isEditModalOpen}
          site={siteToEdit}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={fetchSites} // Після збереження оновлюємо список
        />
        <AddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdded={fetchSites} // Оновлюємо список після додавання
        />
      </main>
    </div>
  );
}

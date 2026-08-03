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
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

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
      setRefreshingId(id);
      const response = await fetch(`/api/monitors/${id}/check`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Помилка перевірки');
      await fetchSites();
    } catch (error) {
      console.error('Помилка оновлення сайту:', error);
    } finally {
      setRefreshingId(null);
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
    <div className="text-gray-800 antialiased min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(248,250,252,1)_35%,_rgba(241,245,249,1)_100%)]">
      <Navbar />

      <main className="grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Моніторинг сайтів
            </h1>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">
              Відстежуйте доступність ваших ресурсів у реальному часі
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 active:scale-95 sm:px-6"
            aria-label="Додати сайт"
          >
            <i className="ph ph-plus-circle text-lg"></i>
            Додати сайт
          </button>
        </div>

        {isLoading && sites.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gray-200" />
                    <div className="min-w-0 space-y-2">
                      <div className="h-4 w-40 rounded bg-gray-200" />
                      <div className="h-3 w-64 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="h-8 w-24 rounded-full bg-gray-200" />
                </div>
                <div className="mb-4 flex gap-1 overflow-hidden">
                  {Array.from({ length: 40 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-8 w-2 rounded-sm bg-gray-200 sm:h-10"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <div className="h-3 w-48 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : sites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <i className="ph ph-globe text-3xl"></i>
            </div>
            <p className="mb-2 text-lg font-medium text-gray-700">
              Немає доданих сайтів
            </p>
            <p className="mx-auto mb-6 max-w-md text-sm text-gray-500">
              Додайте перший ресурс, щоб почати відстеження доступності та історії перевірок.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 active:scale-95"
            >
              <i className="ph ph-plus-circle text-lg"></i>
              Додати перший сайт
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onRefresh={handleRefresh}
                onEdit={handleEditClick} // ДОДАНО
                onDelete={handleDeleteClick} // ДОДАНО
                isRefreshing={refreshingId === site.id}
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
          key={siteToEdit?.id || 'edit-empty'}
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

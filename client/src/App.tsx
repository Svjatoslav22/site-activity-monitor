import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SiteCard from './components/SiteCard';

// 1. Описуємо, як виглядають "сирі" дані, що приходять з твого NestJS бекенду
interface ApiMonitor {
  _id?: string;
  id?: string;
  name?: string;
  url?: string;
  urlToCheck?: string;
  lastStatus?: string;
}

// 2. Описуємо структуру для нашого стейту (така ж, як пропси в SiteCard)
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
  // Використовуємо наш інтерфейс Site[] замість any[]
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSites = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/monitors');
      if (!response.ok) throw new Error('Помилка сервера');

      const data = await response.json();

      // Вказуємо, що item має тип ApiMonitor
      const formattedData: Site[] = data.map((item: ApiMonitor) => ({
        id: item._id || item.id || '',
        name: item.name || 'Сайт',
        url: item.url || item.urlToCheck || 'N/A',
        status: item.lastStatus === 'up' ? 'active' : 'inactive',
        uptime: 100, // Заглушка
        lastChecked: new Date().toLocaleTimeString('uk-UA', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        ping: '120 мс', // Заглушка
        history: [], // Заглушка
      }));

      setSites(formattedData);
    } catch (error) {
      console.error('Помилка завантаження:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSites();
  }, []);

  const handleRefresh = (id: string) => {
    console.log('Оновлюємо сайт з ID:', id);
  };

  return (
    <div className="text-gray-800 antialiased min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Моніторинг сайтів
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Відстежуйте доступність ваших ресурсів у реальному часі
            </p>
          </div>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2">
            <i className="ph ph-plus-circle text-lg"></i>
            Додати сайт
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Завантаження...</div>
        ) : sites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Немає доданих сайтів.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} onRefresh={handleRefresh} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

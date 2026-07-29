interface SiteProps {
  site: {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'inactive' | 'pending';
    uptime: string | number;
    lastChecked: string;
    ping: string;
    history: number[];
    interval?: number;
  };
  onRefresh: (id: string) => void;
  onEdit: (site: {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'inactive' | 'pending';
    uptime: string | number;
    lastChecked: string;
    ping: string;
    history: number[];
    interval?: number;
  }) => void;
  onDelete: (id: string, name: string) => void; // ТУТ ВАЖЛИВО!
}

export default function SiteCard({
  site,
  onRefresh,
  onEdit,
  onDelete,
}: SiteProps) {
  const isActive = site.status === 'active';
  const isPending = site.status === 'pending';

  const statusBadgeBg = isActive
    ? 'bg-emerald-50 border-emerald-200'
    : isPending
      ? 'bg-amber-50 border-amber-200'
      : 'bg-red-50 border-red-200';
  const statusBadgeText = isActive
    ? 'text-emerald-700'
    : isPending
      ? 'text-amber-700'
      : 'text-red-700';
  const statusDot = isActive
    ? 'bg-emerald-500'
    : isPending
      ? 'bg-amber-400 animate-pulse'
      : 'bg-red-500';
  const statusLabel = isActive
    ? 'Активний'
    : isPending
      ? 'Перевірка...'
      : 'Неактивний';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col group">
      {/* Шапка картки */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
            <i className="ph ph-globe text-gray-500 text-xl group-hover:text-blue-500 transition-colors"></i>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
              <span className="truncate">{site.name}</span>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <a
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  title="Відкрити сайт"
                >
                  <i className="ph ph-arrow-square-out"></i>
                </a>
                {/* ДОДАНО КНОПКИ РЕДАГУВАННЯ ТА ВИДАЛЕННЯ */}
                <button
                  onClick={() => onEdit(site)}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  title="Редагувати"
                >
                  <i className="ph ph-pencil-simple"></i>
                </button>
                <button
                  onClick={() => onDelete(site.id, site.name)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Видалити"
                >
                  <i className="ph ph-trash"></i>
                </button>
              </div>
            </h3>
            <p className="text-sm text-gray-500 font-mono mt-0.5 truncate">
              {site.url}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">
              {site.uptime}%
            </div>
            <div className="text-xs text-gray-500">Аптайм</div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeBg} ${statusBadgeText}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusDot} ${!isActive ? 'animate-pulse' : ''}`}
            ></span>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Історія (ШКАЛА) */}
      <div className="mb-4">
        <div className="flex justify-between items-end text-xs text-gray-400 mb-1.5 px-1">
          <span>Раніше</span>
          <span>Зараз</span>
        </div>
        <div className="flex items-center overflow-x-auto gap-0.5 w-full pb-1 sm:pb-0 sm:justify-between">
          {site.history.map((status, index) => (
            <div
              key={index}
              className={`w-2 sm:w-2 h-6 sm:h-8 rounded-sm history-bar cursor-pointer shrink-0 ${
                status === 1 ? 'bg-emerald-400' : 'bg-red-500'
              }`}
              title={status === 1 ? 'Доступний' : 'Недоступний'}
            ></div>
          ))}
        </div>
      </div>

      {/* Підвал картки */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1">
            <i className="ph ph-clock text-gray-400"></i> Перевірено:{' '}
            {site.lastChecked}
          </span>
          <span className="flex items-center gap-1">
            <i className="ph ph-activity text-gray-400"></i> Пінг: {site.ping}
          </span>
        </div>
        <button
          onClick={() => onRefresh(site.id)}
          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors cursor-pointer text-sm flex items-center gap-1"
        >
          <i className="ph ph-arrows-clockwise"></i> Оновити
        </button>
      </div>
    </div>
  );
}

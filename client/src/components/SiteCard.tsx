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
  isRefreshing?: boolean;
}

export default function SiteCard({
  site,
  onRefresh,
  onEdit,
  onDelete,
  isRefreshing = false,
}: SiteProps) {
  const isActive = site.status === 'active';
  const isPending = site.status === 'pending';

  const statusBadgeBg = isActive
    ? 'bg-emerald-50 border-emerald-200'
    : isPending
      ? 'bg-amber-50 border-amber-200'
      : 'bg-gray-50 border-gray-200';
  const statusBadgeText = isActive
    ? 'text-emerald-700'
    : isPending
      ? 'text-amber-700'
      : 'text-gray-600';
  const statusDot = isActive
    ? 'bg-emerald-500'
    : isPending
      ? 'bg-amber-400 animate-pulse'
      : 'bg-gray-400';
  const statusLabel = isActive
    ? 'Активний'
    : isPending
      ? 'Перевірка...'
      : 'Неактивний';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        {/* Шапка картки */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 transition-transform duration-300 group-hover:scale-105">
              <i className="ph ph-globe text-xl text-gray-500 transition-colors group-hover:text-blue-500"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold leading-tight text-gray-900 sm:text-[17px]">
                  {site.name}
                </h3>
                <div className="flex shrink-0 items-center gap-1 text-gray-400">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded p-1 transition-all hover:bg-blue-50 hover:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    title="Відкрити сайт"
                    aria-label={`Відкрити ${site.name} у новій вкладці`}
                  >
                    <i className="ph ph-arrow-square-out"></i>
                  </a>
                  <button
                    onClick={() => onEdit(site)}
                    className="rounded p-1 transition-all hover:bg-blue-50 hover:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    title="Редагувати"
                    aria-label={`Редагувати ${site.name}`}
                  >
                    <i className="ph ph-pencil-simple"></i>
                  </button>
                  <button
                    onClick={() => onDelete(site.id, site.name)}
                    className="rounded p-1 transition-all hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    title="Видалити"
                    aria-label={`Видалити ${site.name}`}
                  >
                    <i className="ph ph-trash"></i>
                  </button>
                </div>
              </div>
              <p className="mt-0.5 truncate font-mono text-sm text-gray-500">
                {site.url}
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold tracking-tight text-gray-900">
                {site.uptime}%
              </div>
              <div className="text-xs text-gray-500">Аптайм</div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusBadgeBg} ${statusBadgeText}`}
              aria-label={`Статус сайту: ${statusLabel}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${statusDot} ${!isActive ? 'animate-pulse' : ''}`}
              ></span>
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Історія (ШКАЛА) */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-end justify-between px-1 text-xs font-medium text-gray-400">
            <span>Раніше</span>
            <span>Зараз</span>
          </div>
          <div className="flex w-full items-center gap-0.5 overflow-x-auto pb-1 sm:justify-between sm:pb-0">
            {site.history.map((status, index) => (
              <div
                key={index}
                className={`history-bar h-6 w-2 shrink-0 cursor-pointer rounded-[3px] sm:h-8 sm:w-2 ${
                  status === 1 ? 'bg-emerald-400' : 'bg-gray-300'
                }`}
                title={status === 1 ? 'Доступний' : 'Недоступний'}
              ></div>
            ))}
          </div>
        </div>

        {/* Підвал картки */}
        <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
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
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-emerald-600 transition-all duration-200 hover:gap-2 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Оновити стан сайту ${site.name}`}
          >
            {isRefreshing ? (
              <i className="ph ph-spinner animate-spin"></i>
            ) : (
              <i className="ph ph-arrows-clockwise transition-transform duration-300 group-hover:rotate-180"></i>
            )}
            <span>Оновити</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import {
  Activity,
  Clock,
  Edit2,
  ExternalLink,
  Globe,
  Loader2,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  User,
  CheckCircle2,
  Lock,
} from 'lucide-react';

type AuthMode = 'login' | 'register';

type UserProfile = {
  id: string;
  email: string;
  name?: string;
};

type MonitorApiItem = {
  _id: string;
  name: string;
  url: string;
  lastStatus?: string;
  lastCheckedAt?: string;
  interval?: number;
  isActive?: boolean;
};

type MonitorStats = {
  lastCheck?: string;
  latestPing?: number;
  averageResponseTime?: number;
  uptimePercentage?: number | string;
  uptimePercent?: number | string;
  lastStatus?: string;
};

type HistoryCheck = {
  status?: string;
  statusCode?: number;
};

type Site = {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive';
  uptime: number;
  lastChecked: string;
  ping: number;
  history: Array<'up' | 'down'>;
  interval: number;
  isActive: boolean;
};

const AUTH_STORAGE_KEY = 'site-monitor-auth';

function formatTime(value?: string) {
  if (!value) return 'Ще не перевірено';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Ще не перевірено';
  return parsed.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function makeHistory(rawHistory: HistoryCheck[]) {
  const bars = rawHistory
    .slice(0, 40)
    .reverse()
    .map((check) =>
      check.status === 'up' || check.statusCode === 200 ? 'up' : 'down',
    );

  while (bars.length < 40) bars.unshift('down');
  return bars as Array<'up' | 'down'>;
}

function UptimeBar({ history }: { history: Array<'up' | 'down'> }) {
  return (
    <div className="mt-5 w-full">
      <div className="mb-2 flex justify-between text-[11px] font-medium text-slate-400">
        <span>Раніше</span>
        <span>Зараз</span>
      </div>
      <div className="flex h-8 w-full items-center gap-1">
        {history.map((status, index) => (
          <div
            key={index}
            className={`h-full flex-1 cursor-pointer rounded-full transition-all duration-200 hover:opacity-75 ${
              status === 'up' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            title={`Status: ${status === 'up' ? 'OK' : 'Error'}`}
          />
        ))}
      </div>
    </div>
  );
}

function SiteCard({
  site,
  onAction,
  onAiAction,
  onRefresh,
  onEdit,
  onDelete,
  isRefreshing = false,
}: {
  site: Site;
  onAction: (message: string) => void;
  onAiAction: (site: Site) => void;
  onRefresh: (id: string) => void;
  onEdit: (site: Site) => void;
  onDelete: (site: Site) => void;
  isRefreshing?: boolean;
}) {
  const isUp = site.status === 'active';

  return (
    <div className="overflow-hidden rounded-2xl border border-white bg-white/70 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all hover:bg-white/85 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]">
      <div className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 rounded-xl border border-slate-100 bg-slate-50 p-2 text-slate-400">
              <Globe size={22} strokeWidth={1.5} />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h3 className="text-[16px] font-semibold text-slate-900">
                  {site.name}
                </h3>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <button
                    onClick={() => onAction(`Відкриття сайту ${site.name}...`)}
                    className="rounded p-1 transition-colors hover:text-indigo-500 active:scale-95"
                    title="Відкрити"
                  >
                    <ExternalLink size={15} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => onEdit(site)}
                    className="rounded p-1 transition-colors hover:text-indigo-500 active:scale-95"
                    title="Редагувати"
                  >
                    <Edit2 size={15} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => onDelete(site)}
                    className="rounded p-1 transition-colors hover:text-rose-500 active:scale-95"
                    title="Видалити"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </button>
                  <div className="mx-1 h-3.5 w-px bg-slate-200" />
                  <button
                    onClick={() => onAiAction(site)}
                    className="group rounded p-1 text-amber-400 transition-colors hover:text-amber-500 active:scale-95"
                    title="AI Аналіз сайту"
                  >
                    <Sparkles
                      size={16}
                      strokeWidth={2}
                      className="group-hover:animate-pulse"
                    />
                  </button>
                </div>
              </div>
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="inline-block max-w-md truncate font-mono text-[13px] text-slate-400 transition-colors hover:text-indigo-500"
              >
                {site.url}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="text-right">
              <span className="block text-[16px] font-bold leading-tight text-slate-800">
                {site.uptime.toFixed(1)}%
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Аптайм
              </span>
            </div>
            <div
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
                isUp
                  ? 'border-emerald-500/30 text-emerald-600'
                  : 'border-rose-500/30 text-rose-600'
              }`}
            >
              <span
                className={`mr-2 h-1.5 w-1.5 rounded-full shadow-sm ${
                  isUp ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              {isUp ? 'Активний' : 'Неактивний'}
            </div>
          </div>
        </div>

        <UptimeBar history={site.history} />
      </div>

      <div className="flex items-center justify-between border-t border-white/50 bg-slate-50/30 px-6 py-3.5 text-[12px] text-slate-500">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Clock size={13} strokeWidth={2.5} className="text-slate-400" />
            <span>Перевірено: {site.lastChecked}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={13} strokeWidth={2.5} className="text-slate-400" />
            <span>Пінг: {site.ping} мс</span>
          </div>
        </div>
        <button
          onClick={() => onRefresh(site.id)}
          disabled={isRefreshing}
          className="group flex items-center gap-1.5 font-semibold text-emerald-600 transition-all active:scale-95 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={13}
            strokeWidth={2.5}
            className="transition-transform duration-500 group-hover:rotate-180"
          />
          Оновити
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState<string>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return '';
    try {
      const parsed = JSON.parse(stored) as { token?: string };
      return parsed.token || '';
    } catch {
      return '';
    }
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [sites, setSites] = useState<Site[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [toast, setToast] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [siteModal, setSiteModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    id?: string;
    name: string;
    url: string;
    interval: string;
  }>({
    isOpen: false,
    mode: 'create',
    name: '',
    url: '',
    interval: '5',
  });
  const [savingSite, setSavingSite] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    loading: boolean;
    data: string;
    site: Site | null;
    draftLoading: boolean;
    draft: string;
  }>({
    isOpen: false,
    loading: false,
    data: '',
    site: null,
    draftLoading: false,
    draft: '',
  });
  const [globalAiModal, setGlobalAiModal] = useState({
    isOpen: false,
    loading: false,
    data: '',
  });

  const showNotification = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const apiFetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(input, { ...init, headers });
  };

  const loadProfile = async (currentToken: string) => {
    const response = await fetch('/api/profile', {
      headers: { Authorization: `Bearer ${currentToken}` },
    });

    if (!response.ok) {
      throw new Error('Не вдалося завантажити профіль');
    }

    const profile = (await response.json()) as UserProfile;
    setUser(profile);
  };

  const loadSites = async () => {
    if (!token) return;

    try {
      setIsLoadingSites(true);
      const response = await apiFetch('/api/monitors');
      if (!response.ok) throw new Error('Помилка сервера');

      const monitorsData = (await response.json()) as MonitorApiItem[];

      const enrichedSites = await Promise.all(
        monitorsData.map(async (item) => {
          const [statsRes, historyRes] = await Promise.all([
            apiFetch(`/api/monitors/${item._id}/stats`),
            apiFetch(`/api/monitors/${item._id}/history`),
          ]);

          let stats: MonitorStats = {};
          let history: Array<'up' | 'down'> = Array(40).fill('down');

          if (statsRes.ok) {
            stats = (await statsRes.json()) as MonitorStats;
          }

          if (historyRes.ok) {
            const rawHistory = (await historyRes.json()) as HistoryCheck[];
            if (Array.isArray(rawHistory) && rawHistory.length > 0) {
              history = makeHistory(rawHistory);
            }
          }

          const lastChecked = formatTime(
            stats.lastCheck || item.lastCheckedAt,
          );
          const pingValue =
            stats.latestPing ?? stats.averageResponseTime ?? 0;
          const uptimeValue =
            stats.uptimePercentage ?? stats.uptimePercent ?? 0;

          return {
            id: item._id,
            name: item.name,
            url: item.url,
            status: ((stats.lastStatus || item.lastStatus || 'down') === 'up'
              ? 'active'
              : 'inactive') as 'active' | 'inactive',
            uptime: Number(uptimeValue) || 0,
            lastChecked,
            ping: Math.round(Number(pingValue) || 0),
            history,
            interval: item.interval || 5,
            isActive: item.isActive !== false,
          };
        }),
      );

      setSites(enrichedSites);
    } catch (error) {
      console.error('Помилка завантаження:', error);
      showNotification('Не вдалося завантажити ваші сайти');
    } finally {
      setIsLoadingSites(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      setSites([]);
      return;
    }

    void loadProfile(token).catch(() => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setToken('');
      setUser(null);
    });

    void loadSites();

    const interval = window.setInterval(() => {
      void loadSites();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [token]);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const response = await fetch(`/api/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        }),
      });

      const data = (await response.json()) as {
        access_token?: string;
        user?: UserProfile;
        message?: string;
      };

      if (!response.ok || !data.access_token) {
        throw new Error(data.message || 'Помилка входу');
      }

      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ token: data.access_token }),
      );
      setToken(data.access_token);
      setUser(data.user || null);
      setAuthForm({ name: '', email: '', password: '' });
      showNotification(
        authMode === 'register'
          ? 'Акаунт створено та виконано вхід'
          : 'Ви успішно увійшли в систему',
      );
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Помилка входу');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken('');
    setUser(null);
    setSites([]);
    setShowProfileMenu(false);
    showNotification('Вихід з акаунту...');
  };

  const handleRefresh = async (id: string) => {
    try {
      setRefreshingId(id);
      const response = await apiFetch(`/api/monitors/${id}/check`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Помилка перевірки');
      await loadSites();
      showNotification('Сайт оновлено');
    } catch (error) {
      showNotification('Не вдалося оновити сайт');
    } finally {
      setRefreshingId(null);
    }
  };

  const openCreateSite = () => {
    setSiteModal({
      isOpen: true,
      mode: 'create',
      name: '',
      url: '',
      interval: '5',
    });
  };

  const openEditSite = (site: Site) => {
    setSiteModal({
      isOpen: true,
      mode: 'edit',
      id: site.id,
      name: site.name,
      url: site.url,
      interval: String(site.interval || 5),
    });
  };

  const openDeleteSite = (site: Site) => {
    setDeleteTarget(site);
  };

  const saveSite = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingSite(true);

    try {
      const payload = {
        name: siteModal.name,
        url: siteModal.url,
        interval: Number(siteModal.interval) || 5,
      };

      const response = await apiFetch(
        siteModal.mode === 'create'
          ? '/api/monitors'
          : `/api/monitors/${siteModal.id}`,
        {
          method: siteModal.mode === 'create' ? 'POST' : 'PATCH',
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error('Не вдалося зберегти сайт');

      setSiteModal({
        isOpen: false,
        mode: 'create',
        name: '',
        url: '',
        interval: '5',
      });
      await loadSites();
      showNotification(
        siteModal.mode === 'create' ? 'Сайт додано' : 'Сайт оновлено',
      );
    } catch (error) {
      showNotification('Не вдалося зберегти сайт');
    } finally {
      setSavingSite(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const response = await apiFetch(`/api/monitors/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Помилка при видаленні');

      setDeleteTarget(null);
      await loadSites();
      showNotification('Сайт видалено');
    } catch (error) {
      showNotification('Не вдалося видалити сайт');
    } finally {
      setDeleting(false);
    }
  };

  const handleAiAnalysis = async (site: Site) => {
    setAiModal({
      isOpen: true,
      loading: true,
      data: '',
      site,
      draftLoading: false,
      draft: '',
    });

    const prompt = `Проаналізуй дані моніторингу для сайту "${site.name}":
- URL: ${site.url}
- Статус: ${site.status === 'active' ? 'Активний' : 'Неактивний'}
- Аптайм: ${site.uptime}%
- Останній пінг: ${site.ping} мс.
Напиши професійний міні-звіт (до 4 речень) про стан сайту та дай 1-2 рекомендації щодо його роботи.`;
    const systemPrompt = 'Ти досвідчений DevOps інженер та Site Reliability Expert (SRE). Відповідай чітко, структуровано, українською мовою. Використовуй формальний тон.';

    try {
      const res = await apiFetch('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, systemPrompt }),
      });
      if (!res.ok) throw new Error('AI error');
      const data = await res.json();
      setAiModal((prev) => ({
        ...prev,
        loading: false,
        data: data.text || 'Не вдалося згенерувати звіт.',
      }));
    } catch (error) {
      setAiModal((prev) => ({
        ...prev,
        loading: false,
        data: 'Виникла помилка при підключенні до AI сервісу.',
      }));
    }
  };

  const handleGlobalAnalysis = async () => {
    setGlobalAiModal({ isOpen: true, loading: true, data: '' });

    const sitesData = sites
      .map(
        (site) =>
          `- ${site.name} (${site.url}): Статус ${site.status === 'active' ? 'UP' : 'DOWN'}, Пінг: ${site.ping}мс, Аптайм: ${site.uptime}%`,
      )
      .join('\n');

    const prompt = `Ось поточні дані всіх моїх серверів та сайтів:\n${sitesData}\nНапиши короткий звіт для керівництва (Executive Summary) про загальний стан здоров'я системи. Виділи критичні проблеми (якщо є, наприклад, сайти зі статусом DOWN або високим пінгом > 500мс) та дай загальні рекомендації на сьогодні.`;
    const systemPrompt = 'Ти Chief Technology Officer (CTO). Відповідай професійно, українською мовою. Форматуй текст зручно для читання, використовуючи списки.';

    try {
      const res = await apiFetch('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, systemPrompt }),
      });
      if (!res.ok) throw new Error('AI error');
      const data = await res.json();
      setGlobalAiModal({ isOpen: true, loading: false, data: data.text || 'Не вдалося згенерувати звіт.' });
    } catch (error) {
      setGlobalAiModal({ isOpen: true, loading: false, data: 'Виникла помилка при підключенні до AI сервісу.' });
    }
  };

  const generateIncidentDraft = async () => {
    const site = aiModal.site;
    if (!site) return;

    setAiModal((prev) => ({ ...prev, draftLoading: true }));
    const prompt = `Напиши коротке професійне повідомлення (шаблон листа або поста для соцмереж) для клієнтів (українською мовою) про те, що сервіс ${site.name} (${site.url}) зараз має статус: ${site.status === 'active' ? 'Активний' : 'Неактивний'}. Пінг: ${site.ping}мс.
Якщо сайт не працює - вибачся за незручності і скажи, що технічна команда вже вирішує проблему (інцидент).
Якщо працює, але повільно (пінг > 500) - попереди про можливі тимчасові затримки в роботі.
Якщо все ідеально (пінг < 500, статус активний) - напиши повідомлення про успішне планове оновлення системи без даунтайму.`;

    try {
      const apiKey = '';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [
              { text: "Ти фахівець зі зв'язків з громадськістю (PR) в IT компанії." },
            ],
          },
        }),
      });
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiModal((prev) => ({
        ...prev,
        draftLoading: false,
        draft: text || 'Помилка генерації листа.',
      }));
    } catch (error) {
      setAiModal((prev) => ({
        ...prev,
        draftLoading: false,
        draft: 'Помилка генерації листа.',
      }));
    }
  };

  const filteredSites = sites.filter((site) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      site.name.toLowerCase().includes(query) ||
      site.url.toLowerCase().includes(query)
    );
  });

  const totalSites = sites.length;
  const activeSites = sites.filter((site) => site.status === 'active').length;
  const avgUptime =
    totalSites === 0
      ? 0
      : sites.reduce((sum, site) => sum + site.uptime, 0) / totalSites;
  const avgPing =
    totalSites === 0
      ? 0
      : sites.reduce((sum, site) => sum + site.ping, 0) / totalSites;

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-slate-50 to-emerald-50 text-slate-800 selection:bg-indigo-100">
        <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:p-10">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="absolute -bottom-16 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700">
                <Shield size={13} />
                AI Site Monitor
              </div>
              <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Персональний моніторинг сайтів з AI-звітами та доступом по акаунту.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                Реєструйтесь, додавайте власні сайти, отримуйте індивідуальну історію перевірок і керуйте станом сервісів із єдиного дашборду.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ['Окремі акаунти', 'Кожен користувач бачить лише свої сайти'],
                  ['AI-аналіз', 'Генерація звіту та чернеток повідомлень'],
                  ['Живі дані', 'Усі монітори тягнуться з MongoDB'],
                ].map(([title, text]) => (
                  <div
                    try {
                      const res = await apiFetch('/api/ai/generate', {
                        method: 'POST',
                        body: JSON.stringify({
                          prompt,
                          systemPrompt: "Ти фахівець зі зв'язків з громадськістю (PR) в IT компанії.",
                        }),
                      });
                      if (!res.ok) throw new Error('AI error');
                      const data = await res.json();
                      setAiModal((prev) => ({ ...prev, draftLoading: false, draft: data.text || 'Помилка генерації листа.' }));
                    } catch (error) {
                      setAiModal((prev) => ({ ...prev, draftLoading: false, draft: 'Помилка генерації листа.' }));
                    }
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Увійти
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  authMode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Зареєструватись
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-3">
              {authMode === 'register' && (
                <div className="relative">
                  <User
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={authForm.name}
                    onChange={(event) =>
                      setAuthForm({ ...authForm, name: event.target.value })
                    }
                    placeholder="Ваше ім'я"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-10 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              )}

              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, email: event.target.value })
                  }
                  placeholder="Email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-10 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, password: event.target.value })
                  }
                  placeholder="Пароль"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-10 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {authError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
              >
                {authLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {authMode === 'register' ? 'Створити акаунт' : 'Увійти'}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-500">
              Після входу ви зможете додавати сайти, а дашборд покаже тільки ваші записи з бази даних.
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-slate-50 to-emerald-50 text-slate-800 selection:bg-indigo-100">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 shadow-[0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 text-white shadow-sm">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="block text-[18px] font-bold tracking-tight text-slate-900">
                SiteMonitor
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
                Live Uptime Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white/50 px-3 py-1.5 text-sm shadow-sm">
                <Send size={15} className="text-slate-400" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px] font-medium text-slate-700">
                    Telegram
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Підключено
                  </div>
                </div>
              </div>
              <button
                onClick={() => showNotification('Тестове повідомлення надіслано в Telegram')}
                className="ml-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:text-slate-800 hover:shadow-sm active:scale-95"
              >
                Тест
              </button>
            </div>

            <div className="hidden h-6 w-px bg-slate-200 md:block" />

            <button
              onClick={() => showNotification('Оновлення всіх сервісів...')}
              className="hidden text-slate-400 transition-colors hover:text-indigo-600 active:scale-95 sm:block"
            >
              <RefreshCw size={18} strokeWidth={2} />
            </button>

            <div className="relative ml-2">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-[11px] font-medium text-white shadow-sm">
                  {user?.name?.slice(0, 1).toUpperCase() || 'A'}
                </div>
                <span className="hidden text-sm font-medium text-slate-700 sm:block">
                  Профіль
                </span>
              </button>

              {showProfileMenu && (
                <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-3 w-72 rounded-2xl border border-slate-100 bg-white/95 p-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl duration-200">
                  <div className="border-b border-slate-100/50 px-4 py-3">
                    <p className="text-[14px] font-bold text-slate-800">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="truncate text-[12px] font-medium text-slate-400">
                      {user?.email || 'admin@sitemonitor.com'}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        showNotification('Відкрито: Мій профіль');
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-left text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50/80 hover:text-indigo-600"
                    >
                      <User size={16} strokeWidth={2} /> Мій профіль
                    </button>
                    <button
                      onClick={() => {
                        showNotification('Відкрито: Налаштування системи');
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-left text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50/80 hover:text-indigo-600"
                    >
                      <Settings size={16} strokeWidth={2} /> Налаштування
                    </button>
                  </div>
                  <div className="border-t border-slate-100/50 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-left text-[13px] font-semibold text-rose-600 transition-colors hover:bg-rose-50/80"
                    >
                      <LogOut size={16} strokeWidth={2} /> Вийти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-1 text-[28px] font-extrabold tracking-tight text-slate-900">
              Моніторинг сайтів
            </h1>
            <p className="text-[15px] font-medium text-slate-500">
              Відстежуйте доступність ваших ресурсів у реальному часі
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGlobalAnalysis}
              disabled={!sites.length}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-amber-500 hover:to-orange-600 active:scale-95 disabled:opacity-60"
            >
              <Sparkles size={16} strokeWidth={2.5} />
              <span>Загальний звіт AI</span>
            </button>
            <button
              onClick={openCreateSite}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Додати сайт</span>
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ['Сайтів', totalSites, 'text-slate-900'],
            ['Активних', activeSites, 'text-emerald-600'],
            ['Середній аптайм', `${avgUptime.toFixed(1)}%`, 'text-indigo-600'],
            ['Середній пінг', `${Math.round(avgPing)} мс`, 'text-amber-600'],
          ].map(([label, value, color]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-white bg-white/70 p-5 shadow-sm backdrop-blur-md"
            >
              <div className="text-sm font-medium text-slate-400">{label}</div>
              <div className={`mt-2 text-2xl font-black tracking-tight ${color}`}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-2xl border border-white bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Search size={16} className="text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Пошук по назві або URL..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {isLoadingSites && sites.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
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
        ) : filteredSites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Globe size={30} />
            </div>
            <p className="mb-2 text-lg font-medium text-gray-700">
              Немає доданих сайтів
            </p>
            <p className="mx-auto mb-6 max-w-md text-sm text-gray-500">
              Додайте перший ресурс, щоб почати відстеження доступності та історії перевірок.
            </p>
            <button
              onClick={openCreateSite}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 active:scale-95"
            >
              <Plus size={18} />
              Додати перший сайт
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredSites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onAction={(message) => showNotification(message)}
                onAiAction={handleAiAnalysis}
                onRefresh={handleRefresh}
                onEdit={openEditSite}
                onDelete={openDeleteSite}
                isRefreshing={refreshingId === site.id}
              />
            ))}
          </div>
        )}
      </main>

      {siteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Globe size={18} className="text-indigo-500" />
                <h3 className="font-bold">
                  {siteModal.mode === 'create' ? 'Додати сайт' : 'Редагувати сайт'}
                </h3>
              </div>
              <button
                onClick={() =>
                  setSiteModal({
                    isOpen: false,
                    mode: 'create',
                    name: '',
                    url: '',
                    interval: '5',
                  })
                }
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={saveSite} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Назва
                </label>
                <input
                  value={siteModal.name}
                  onChange={(event) =>
                    setSiteModal({ ...siteModal, name: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Наприклад: studentplatform"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  URL
                </label>
                <input
                  value={siteModal.url}
                  onChange={(event) =>
                    setSiteModal({ ...siteModal, url: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Інтервал перевірки, хв
                </label>
                <input
                  type="number"
                  min="1"
                  value={siteModal.interval}
                  onChange={(event) =>
                    setSiteModal({ ...siteModal, interval: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setSiteModal({
                      isOpen: false,
                      mode: 'create',
                      name: '',
                      url: '',
                      interval: '5',
                    })
                  }
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={savingSite}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-60"
                >
                  {savingSite ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {siteModal.mode === 'create' ? 'Додати' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <h3 className="font-bold text-slate-800">Підтвердити видалення</h3>
            </div>
            <div className="p-6">
              <p className="text-sm leading-relaxed text-slate-600">
                Ви впевнені, що хочете видалити сайт{' '}
                <span className="font-semibold text-slate-900">{deleteTarget.name}</span>?
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Скасувати
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-60"
                >
                  {deleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Видалити
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {aiModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <div className="flex items-center gap-2 text-amber-500">
                <Sparkles size={18} strokeWidth={2.5} />
                <h3 className="font-bold text-slate-800">ШІ Аналіз: {aiModal.site?.name}</h3>
              </div>
              <button
                onClick={() =>
                  setAiModal({
                    isOpen: false,
                    loading: false,
                    data: '',
                    site: null,
                    draftLoading: false,
                    draft: '',
                  })
                }
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <div className="p-6">
              {aiModal.loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Loader2 size={32} className="mb-4 animate-spin text-amber-500" />
                  <p className="text-sm font-medium animate-pulse">
                    Генерація звіту Gemini API...
                  </p>
                </div>
              ) : (
                <div className="max-w-none text-slate-600">
                  <p className="whitespace-pre-line leading-relaxed">{aiModal.data}</p>

                  {aiModal.draft && (
                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
                        <Send size={14} className="text-indigo-500" />
                        Чернетка листа для клієнтів:
                      </h4>
                      <div className="whitespace-pre-line rounded-xl border border-slate-100 bg-slate-50 p-4 text-[13px] text-slate-700">
                        {aiModal.draft}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!aiModal.loading && (
              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <button
                  onClick={generateIncidentDraft}
                  disabled={aiModal.draftLoading}
                  className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100 active:scale-95 disabled:opacity-50"
                >
                  {aiModal.draftLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Edit2 size={16} />
                  )}
                  {aiModal.draft ? 'Згенерувати новий лист' : 'Створити лист клієнтам'}
                </button>
                <button
                  onClick={() =>
                    setAiModal({
                      isOpen: false,
                      loading: false,
                      data: '',
                      site: null,
                      draftLoading: false,
                      draft: '',
                    })
                  }
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-900 active:scale-95"
                >
                  Закрити
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {globalAiModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <div className="flex items-center gap-2 text-orange-500">
                <Sparkles size={18} strokeWidth={2.5} />
                <h3 className="font-bold text-slate-800">
                  Аналітика всієї системи (Gemini AI)
                </h3>
              </div>
              <button
                onClick={() =>
                  setGlobalAiModal({ isOpen: false, loading: false, data: '' })
                }
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <div className="p-6">
              {globalAiModal.loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 size={32} className="mb-4 animate-spin text-orange-500" />
                  <p className="text-sm font-medium animate-pulse">
                    Збираємо дані та аналізуємо через Gemini API...
                  </p>
                </div>
              ) : (
                <div className="max-w-none text-slate-600">
                  <div className="whitespace-pre-line rounded-xl border border-orange-100/50 bg-orange-50/50 p-5 text-[14px] font-medium leading-relaxed text-slate-800">
                    {globalAiModal.data}
                  </div>
                </div>
              )}
            </div>

            {!globalAiModal.loading && (
              <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <button
                  onClick={() =>
                    setGlobalAiModal({ isOpen: false, loading: false, data: '' })
                  }
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-900 active:scale-95"
                >
                  Закрити
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-md">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span className="pr-2 text-[13px] font-semibold">{toast}</span>
        </div>
      )}
    </div>
  );
}

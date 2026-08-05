import { useState } from 'react';
import Login from './Login';

export default function Navbar() {
  const [isTesting, setIsTesting] = useState(false);

  const sendTelegramTest = async () => {
    try {
      setIsTesting(true);
      const response = await fetch('/api/telegram/test', { method: 'POST' });
      const data = await response.json();
      alert(data.ok ? '✅ ' + data.message : '❌ ' + data.message);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert('Помилка надсилання тесту');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-white/70 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20 transition-transform duration-200 hover:scale-105">
              <i className="ph ph-activity text-xl"></i>
            </div>
            <div className="leading-tight">
              <span className="block text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                SiteMonitor
              </span>
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.24em] text-gray-400 sm:block">
                Live uptime dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Telegram */}
            <div className="flex items-center gap-1.5">
              <a
                href="https://t.me/pocketnote2vbot"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 rounded-lg px-2 py-1 text-gray-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                title="Telegram бот"
                aria-label="Відкрити Telegram бот"
              >
                <i className="ph ph-telegram-logo text-xl group-hover:scale-110 transition-transform"></i>
                <span className="hidden sm:flex flex-col leading-tight">
                  <span className="text-xs font-medium text-gray-700">
                    Telegram
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    ● Підключено
                  </span>
                </span>
              </a>
              <button
                onClick={sendTelegramTest}
                disabled={isTesting}
                className="hidden items-center rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-500 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                title="Надіслати тест"
                aria-label="Надіслати тестове повідомлення в Telegram"
              >
                {isTesting ? '...' : 'Тест'}
              </button>
            </div>

            <div className="h-4 w-px bg-gray-200"></div>

            <button
              className="rounded-lg p-2 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
              title="Оновити всі сайти"
              aria-label="Оновити всі сайти"
            >
              <i className="ph ph-arrows-clockwise text-xl"></i>
            </button>

            <div className="hidden sm:block">
              <Login />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

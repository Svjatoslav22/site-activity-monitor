import { useState } from 'react';

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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <i className="ph ph-activity text-blue-600 text-2xl mr-2"></i>
            <span className="font-semibold text-lg tracking-tight text-gray-900">
              SiteMonitor
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Telegram */}
            <div className="flex items-center gap-1.5">
              <a
                href="https://t.me/pocketnote2vbot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-500 transition group flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-blue-50"
                title="Telegram бот"
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
                className="hidden sm:flex text-xs text-gray-400 hover:text-blue-600 px-1.5 py-0.5 rounded border border-gray-200 hover:border-blue-300 transition disabled:opacity-50"
                title="Надіслати тест"
              >
                {isTesting ? '...' : 'Тест'}
              </button>
            </div>

            <div className="h-4 w-px bg-gray-200"></div>

            <button
              className="text-gray-500 hover:text-gray-700 transition p-1.5 rounded-lg hover:bg-gray-100"
              title="Оновити всі сайти"
            >
              <i className="ph ph-arrows-clockwise text-xl"></i>
            </button>

            <div
              className="h-8 w-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition"
              title="Профіль"
            >
              <span>А</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

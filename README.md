# ⚡ SiteMonitor

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**SiteMonitor** — це зручний веб-додаток для моніторингу доступності сайтів (uptime) у реальному часі. Створений для відстеження статусу серверів та веб-ресурсів із функцією сповіщення.

> 🖼️ *Тут можна додати скріншот інтерфейсу:*
> `![Інтерфейс SiteMonitor](посилання_на_картинку.png)`

## ✨ Основні можливості

* **Реал-тайм моніторинг:** Регулярна перевірка доступності (ping) заданих URL.
* **Зручний дашборд:** Відображення статусу, аптайму (%) та історії перевірок у вигляді інтерактивного графіка.
* **Управління:** Додавання, редагування та видалення сайтів для моніторингу (CRUD).
* **Сповіщення:** Інтеграція з Telegram-ботом для миттєвих повідомлень про падіння та відновлення ресурсів.
* **Сучасний UI:** Чуйний дизайн (Responsive Web Design), побудований на React та Tailwind CSS з іконками Phosphor Icons.

## 🛠 Технологічний стек

* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Backend:** NestJS, TypeScript, Mongoose
* **Database:** MongoDB Atlas
* **Deployment:** Vercel (Client), Render (API)

## 🚀 Встановлення та запуск (Локально)

**1. Клонування репозиторію**

```bash
git clone https://github.com/ТВІЙ-ЮЗЕРНЕЙМ/site-activity-monitor.git
cd site-activity-monitor
```

**2. Запуск Backend (NestJS)**

```bash
cd server
npm install
# Створіть файл .env у папці server та додайте MONGO_URI
npm run start:dev
```

Бекенд запуститься на порту `4000`.

**3. Запуск Frontend (React/Vite)**

```bash
cd ../client
npm install
npm run dev
```

Фронтенд запуститься на локальному порту (зазвичай `5173`). Усі запити `/api` проксіюватимуться на бекенд.

## 🌍 Деплоймент

Проєкт налаштований для деплою:

* **Клієнтська частина:** на Vercel (використовує `vercel.json` для правильної маршрутизації API-запитів).
* **Серверна частина:** на Render.com (з використанням змінних оточення для порту та підключення до бази).

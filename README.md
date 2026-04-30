# Month Wastes — Telegram Mini App

Трекер обязательных ежемесячных трат. Открывается прямо в Telegram.

Mini App: `https://t.me/monthwasteslns_bot`

---

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | React 18 + Vite + vite-plugin-singlefile |
| Хранилище | Telegram CloudStorage (`wastes_v1`, `wastes_settings_v1`), fallback localStorage |
| Backend | Express (статика + REST API) |
| БД | PostgreSQL (напоминания) |
| Cron | node-cron (9:00 Europe/Moscow, per-row `days_before`) |
| Deploy | Docker multi-stage → nginx reverse proxy |

---

## Фичи

- **Два режима:** неделя (ближайшие 7 дней) и месяц с навигацией по месяцам
- **Карточка суммы:** итог за период + счётчик трат
- **Категории:** 8 штук (Жильё / Кредиты / Подписки / Транспорт / Здоровье / Связь / Образование / Прочее) с цветными бейджами
- **Фильтр по категории:** появляется автоматически при 2+ разных категориях в периоде
- **Ограниченные траты:** опциональный `endDate`, показывает "осталось N мес."
- **Напоминания:** бот пишет в Telegram за N дней до списания; тогл в карточке траты и в формах добавления/редактирования; при включении в пределах окна — уведомление приходит сразу
- **Настройки:** кнопка ⚙ в футере, настройка количества дней напоминания (1–14), сохраняется в CloudStorage и обновляет все записи в БД
- **Детальная карточка:** все поля, инлайн-тогл напоминания, кнопки редактирования и удаления
- **iOS-bottom sheets:** добавление, редактирование, детали, настройки — анимированные снизу
- **Telegram UX:** BackButton, HapticFeedback, expand(), safe-area insets, dark mode

---

## Структура проекта

```
month_wastes_miniapp/
├── backend/
│   ├── index.html              # Vite entry
│   ├── vite.config.js          # vite-plugin-singlefile, outDir: dist
│   ├── package.json            # react + react-dom + vite + express + pg + node-cron
│   ├── server.js               # Express: статика + API + cron 9:00 Moscow
│   ├── Dockerfile              # multi-stage: builder (vite build) + runtime
│   ├── .env.example            # PORT, BOT_TOKEN, DATABASE_URL
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # весь state: expenses, reminderIds, reminderDays, sheets
│       ├── index.css           # все стили, один файл
│       ├── utils/
│       │   ├── dates.js        # date utils, getEntries, fmtAmount/fmtDate
│       │   ├── storage.js      # tg(), cloudGet/cloudSet, STORAGE_KEY, SETTINGS_KEY
│       │   ├── categories.js   # CATEGORIES[], getCategoryById()
│       │   └── reminders.js    # fetchReminderIds(), toggleReminder(), saveReminderSettings()
│       ├── hooks/
│       │   ├── useSwipeDown.js
│       │   └── useKeyboardOffset.js
│       └── components/
│           ├── PeriodSwitcher.jsx
│           ├── MonthSwitcher.jsx
│           ├── TotalCard.jsx
│           ├── ExpenseItem.jsx
│           ├── Toggle.jsx
│           ├── CategoryPicker.jsx
│           ├── CategoryFilter.jsx
│           ├── AddSheet.jsx
│           ├── EditSheet.jsx
│           ├── DetailSheet.jsx
│           └── SettingsSheet.jsx
├── docker-compose.yml
├── setup_bot.js
└── prompt.md
```

---

## API endpoints

| Метод | Путь | Описание |
|-------|------|---------|
| POST | `/api/reminder` | Включить/выключить напоминание для траты |
| GET | `/api/reminders` | Получить список id активных напоминаний пользователя |
| POST | `/api/settings` | Обновить `days_before` для всех напоминаний пользователя |

Все запросы валидируются через `initData` (HMAC-SHA256 подпись Telegram).

---

## Модель данных

CloudStorage, ключ `wastes_v1`:

```json
[{
  "id": "abc123",
  "name": "Аренда",
  "amount": 35000,
  "category": "housing",
  "date": "2026-05-31",
  "endDate": null
}]
```

CloudStorage, ключ `wastes_settings_v1`:

```json
{ "reminderDays": 5 }
```

PostgreSQL, таблица `reminders`:

```sql
CREATE TABLE reminders (
  user_id      BIGINT  NOT NULL,
  expense_id   TEXT    NOT NULL,
  expense_name TEXT    NOT NULL,
  amount       INTEGER NOT NULL,
  day_of_month INTEGER NOT NULL,
  days_before  INTEGER NOT NULL DEFAULT 3,
  PRIMARY KEY (user_id, expense_id)
);
```

Cron `0 9 * * *` (Europe/Moscow) — для каждой строки проверяет `today + days_before == day_of_month`.

---

## Сборка и деплой

```bash
cp backend/.env.example backend/.env
# заполнить BOT_TOKEN, DATABASE_URL

docker compose up -d --build
```

vite-plugin-singlefile инлайнит всё в один `dist/index.html`. nginx проксирует `/wastes/` → Express, API доступен на `/wastes/api/...`.

---

## Переменные окружения

| Переменная | Описание |
|-----------|---------|
| `PORT` | Порт Express (default 3003) |
| `BOT_TOKEN` | Токен Telegram-бота (валидация initData + рассылка) |
| `DATABASE_URL` | PostgreSQL connection string; без него напоминания отключены |

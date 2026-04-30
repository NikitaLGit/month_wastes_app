# Month Wastes — Telegram Mini App

Трекер обязательных ежемесячных трат. Открывается прямо в Telegram.

Mini App: `https://t.me/monthwasteslns_bot`

---

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | React 18 + Vite + vite-plugin-singlefile |
| Хранилище | Telegram CloudStorage (`wastes_v1`), fallback localStorage |
| Backend | Express (статика + REST API) |
| БД | PostgreSQL (напоминания) |
| Cron | node-cron (ежедневная рассылка в 9:00) |
| Deploy | Docker multi-stage → nginx reverse proxy |

---

## Фичи

- **Два режима:** неделя (ближайшие 7 дней) и месяц с навигацией по месяцам
- **Карточка суммы:** итог за период + счётчик трат
- **Категории:** 8 штук (Жильё / Кредиты / Подписки / Транспорт / Здоровье / Связь / Образование / Прочее) с цветными бейджами
- **Фильтр по категории:** появляется автоматически при 2+ разных категориях в периоде
- **Ограниченные траты:** опциональный `endDate`, показывает "осталось N мес."
- **Напоминания:** бот пишет в Telegram за 3 дня до списания; включается/выключается в карточке траты
- **Детальная карточка:** все поля, ссылки на даты, инлайн-тогл напоминания
- **iOS-bottom sheets:** добавление, редактирование, детали — анимированные снизу
- **Telegram UX:** BackButton, HapticFeedback, expand(), safe-area insets, dark mode

---

## Структура проекта

```
month_wastes_miniapp/
├── backend/
│   ├── index.html              # Vite entry
│   ├── vite.config.js          # vite-plugin-singlefile, outDir: dist
│   ├── package.json
│   ├── server.js               # Express: статика + /api/reminder + /api/reminders + cron
│   ├── Dockerfile              # multi-stage: builder (vite build) + runtime (express)
│   ├── .env.example            # PORT, BOT_TOKEN, DATABASE_URL
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # весь state: expenses, reminderIds, sheets
│       ├── index.css           # все стили, один файл
│       ├── utils/
│       │   ├── dates.js        # date utils, getEntries, fmtAmount/fmtDate
│       │   ├── storage.js      # tg(), cloudGet/cloudSet, STORAGE_KEY
│       │   ├── categories.js   # CATEGORIES[], getCategoryById()
│       │   └── reminders.js    # fetchReminderIds(), toggleReminder()
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
│           └── DetailSheet.jsx
├── docker-compose.yml
└── setup_bot.js
```

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

- `date` — первый платёж; далее ежемесячно в тот же день
- Если числа нет в месяце — переносится на последний день
- `endDate: null` → бессрочно; `endDate: "YYYY-MM-DD"` → последний платёж

Напоминания хранятся в PostgreSQL (таблица `reminders`):

```sql
CREATE TABLE reminders (
  user_id      BIGINT  NOT NULL,
  expense_id   TEXT    NOT NULL,
  expense_name TEXT    NOT NULL,
  amount       INTEGER NOT NULL,
  day_of_month INTEGER NOT NULL,
  PRIMARY KEY (user_id, expense_id)
);
```

---

## Сборка и деплой

```bash
# Скопировать и заполнить .env
cp backend/.env.example backend/.env

# Собрать и поднять (Vite билдит внутри Docker)
docker compose up -d --build

```

vite-plugin-singlefile инлайнит весь JS и CSS в один `dist/index.html` — нет отдельных asset-файлов, нет проблем с base path.

---

## Переменные окружения

| Переменная | Описание |
|-----------|---------|
| `PORT` | Порт Express (default 3003) |
| `BOT_TOKEN` | Токен Telegram-бота (для валидации initData и рассылки) |
| `DATABASE_URL` | PostgreSQL connection string (напоминания; опционально — без БД фича отключается) |

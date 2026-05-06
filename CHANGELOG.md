# Changelog

## 2026-05-06 (3)

### Убран catch-up при включении напоминания
- **remove**: при включении ремайндера уведомление больше не приходит сразу — только через cron в 9:00 МСК

## 2026-05-06 (2)

### Фикс: напоминание не удалялось из БД при удалении траты
- **fix**: `toggleReminder({ id }, false)` падал на `expense.date.split` — `date` отсутствует при удалении; теперь `dayOfMonth` вычисляется только при `enabled = true`
- **fix**: очищена осиротевшая запись `тестоповещение` из таблицы `reminders`

## 2026-05-06

### Фикс: напоминания не работали (nginx + новый формат сообщения)
- **fix**: nginx `proxy_pass $upstream/` с переменной не стрипал путь — все `/wastes/api/*` запросы приходили в Express как `POST /` → 404; исправлено через `rewrite ^/wastes/(.*)$ /$1 break` + `proxy_pass $upstream` (без слеша), по аналогии с `/wow/api/`
- **fix**: добавлен `Cache-Control: no-store` для `dist/index.html` — Telegram WebView больше не кешировал старую версию приложения
- **feat**: формат сообщения-напоминания: заголовок `🔔 Спишется через N дня:` + список `• Название — сумма ₽`; несколько трат на один день — одно сообщение

## 2026-05-01

### Фикс: иконка напоминания исчезала при открытии
- **fix**: `fetchReminderIds()` теперь возвращает `null` при ошибке (вместо `[]`) — позволяет отличить сбой от пустого списка
- **fix**: `reminderIds` кэшируются в CloudStorage (`wastes_reminder_ids_v1`) — при сбое API используется кэш
- **fix**: при каждом изменении reminder-состояния (add/edit/delete/toggle) кэш обновляется синхронно внутри setState

### Фикс: счётчик оставшихся платежей обновлялся 1-го числа месяца
- **fix**: `monthsLeft(endDate)` заменён на `paymentsLeft(nextDate, endDate)` — считает платежи от `nextDate` включительно
- **fix**: счётчик теперь убывает только когда платёж проходит (nextDate меняется), а не при смене календарного месяца

## 2026-04-30 (4)

### Тема
- **feat**: переключатель темы в SettingsSheet — `[Тёмная] [Светлая]`, стиль как у PeriodSwitcher
- **feat**: `THEME_VARS` в App.jsx — инлайн CSS-переменные на `.app-layout` перебивают Telegram SDK без конфликтов
- **feat**: тема сохраняется в `wastes_settings_v1` вместе с `reminderDays`
- **feat**: `useEffect` синхронизирует `document.body.style.backgroundColor` при смене темы

## 2026-04-30 (3)

### Карточка траты
- **style**: сумма → правый верхний угол, 17px → 19px
- **style**: 🔔 → правый нижний угол, в `.expense-icons` (flex-row, gap 4px, min-height 18px — зарезервировано место для будущих иконок)
- **refactor**: `expense-tag` (↻ N мес.) перенесён в левую колонку
- **style**: `.expense-card` `align-items: center` → `stretch`; `.expense-right` добавлен `justify-content: space-between`

## 2026-04-30

### Фильтр и сортировка
- **feat**: `SortPicker` — dropdown По дате / По сумме / По названию; кнопка-пилюля, синяя при не-дефолтной сортировке
- **feat**: `CategoryFilter` — переработан в одну кнопку "Категории ▼" с мозаичным dropdown (flex-wrap); убран горизонтальный скролл
- **feat**: `filter-sort-row` — единая строка `[CategoryFilter] [SortPicker]`; видна когда есть траты
- **style**: `filter-pill` увеличен: font-size 13px → 15px, padding 5/13 → 8/16, border-radius 10 → 12

### Настройки
- **feat**: `SettingsSheet` — настройка дней напоминания (1–14), stepper, кнопка Сохранить; кнопка ⚙ в футере
- **feat**: `POST /api/settings` — обновляет `days_before` для всех напоминаний пользователя в БД
- **feat**: `saveReminderSettings()` в reminders.js

### Напоминания (bugfix и доработка)
- **fix**: API path `/api` → `/wastes/api` в reminders.js (nginx не знал `/api/`)
- **fix**: кнопка напоминания в DetailSheet → строка с Toggle внутри `detail-rows`
- **fix**: cron timezone → `Europe/Moscow` (было UTC = 12:00 Москва)
- **fix**: `POST /api/settings` — `days_before` теперь реально записывается в БД при сохранении настроек
- **feat**: cron per-row: каждая трата проверяется по своему `days_before`
- **feat**: catch-up уведомление при включении ремайндера если платёж через ≤ N дней
- **feat**: колонка `days_before` в таблице `reminders`, автомиграция `ADD COLUMN IF NOT EXISTS`

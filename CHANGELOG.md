# Changelog

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

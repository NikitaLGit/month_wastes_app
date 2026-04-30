import { useState, useEffect, useCallback } from 'react';
import { today, addDays, endOfMonth, getEntries, capitalize } from './utils/dates';
import { tg, cloudGet, cloudSet, STORAGE_KEY, SETTINGS_KEY } from './utils/storage';
import { fetchReminderIds, toggleReminder, saveReminderSettings } from './utils/reminders';
import PeriodSwitcher from './components/PeriodSwitcher';
import MonthSwitcher from './components/MonthSwitcher';
import TotalCard from './components/TotalCard';
import ExpenseItem from './components/ExpenseItem';
import CategoryFilter from './components/CategoryFilter';
import AddSheet from './components/AddSheet';
import EditSheet from './components/EditSheet';
import DetailSheet from './components/DetailSheet';
import SettingsSheet from './components/SettingsSheet';

export default function App() {
  const [period, setPeriod] = useState('week');
  const [monthOffset, setMonthOffset] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [ready, setReady] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [reminderIds, setReminderIds] = useState(new Set());
  const [reminderDays, setReminderDays] = useState(3);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { tg()?.ready(); tg()?.expand(); }, []);

  useEffect(() => {
    cloudGet(STORAGE_KEY).then(raw => {
      try { setExpenses(JSON.parse(raw) || []); } catch { setExpenses([]); }
      setReady(true);
    });
    cloudGet(SETTINGS_KEY).then(raw => {
      try { const s = JSON.parse(raw); if (s?.reminderDays) setReminderDays(s.reminderDays); } catch {}
    });
    fetchReminderIds().then(ids => setReminderIds(new Set(ids)));
  }, []);

  useEffect(() => {
    if (!ready) return;
    cloudSet(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses, ready]);

  useEffect(() => { setFilterCategory(null); }, [period, monthOffset]);

  const handleAdd = useCallback((expense, hasReminder) => {
    tg()?.HapticFeedback?.selectionChanged();
    setExpenses(prev => [...prev, expense]);
    setShowAdd(false);
    if (hasReminder) {
      toggleReminder(expense, true, reminderDays).then(ok => {
        if (ok) setReminderIds(prev => new Set([...prev, expense.id]));
      });
    }
  }, [reminderDays]);

  const handleDelete = useCallback(id => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toggleReminder({ id }, false);
    setReminderIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  }, []);

  const handleEdit = useCallback((updated, hasReminder) => {
    tg()?.HapticFeedback?.selectionChanged();
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditing(null);
    setReminderIds(prev => {
      const wasOn = prev.has(updated.id);
      if (hasReminder === wasOn) return prev;
      const next = new Set(prev);
      hasReminder ? next.add(updated.id) : next.delete(updated.id);
      toggleReminder(updated, hasReminder, reminderDays);
      return next;
    });
  }, [reminderDays]);

  const handleToggleReminder = useCallback((entry) => {
    const enabled = !reminderIds.has(entry.id);
    tg()?.HapticFeedback?.selectionChanged();
    setReminderIds(prev => {
      const next = new Set(prev);
      enabled ? next.add(entry.id) : next.delete(entry.id);
      return next;
    });
    toggleReminder(entry, enabled, reminderDays).then(ok => {
      if (!ok) {
        setReminderIds(prev => {
          const next = new Set(prev);
          enabled ? next.delete(entry.id) : next.add(entry.id);
          return next;
        });
      }
    });
  }, [reminderIds, reminderDays]);

  if (!ready) return null;

  const t = today();
  let from, to, totalLabel;
  if (period === 'week') {
    from = t;
    to = addDays(t, 6);
    totalLabel = 'На ближайшие 7 дней';
  } else {
    const sel = new Date(t.getFullYear(), t.getMonth() + monthOffset, 1);
    from = sel;
    to = endOfMonth(sel);
    const sameYear = sel.getFullYear() === t.getFullYear();
    totalLabel = capitalize(sel.toLocaleDateString('ru-RU', {
      month: 'long', ...(!sameYear ? { year: 'numeric' } : {}),
    }));
  }

  const entries = getEntries(expenses, from, to);
  const activeCategoryIds = [...new Set(entries.map(e => e.category).filter(Boolean))];
  const showFilter = activeCategoryIds.length >= 2;
  const filteredEntries = filterCategory
    ? entries.filter(e => e.category === filterCategory)
    : entries;
  const total = filteredEntries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="app-layout">
      <div className="app-header">
        <PeriodSwitcher value={period} onChange={p => { setPeriod(p); if (p === 'week') setMonthOffset(0); }} />
        {period === 'month' && <MonthSwitcher offset={monthOffset} onChange={setMonthOffset} />}
      </div>

      <div className="app-content">
        <TotalCard total={total} count={filteredEntries.length} label={totalLabel} />

        {showFilter && (
          <CategoryFilter
            active={filterCategory}
            onChange={setFilterCategory}
            availableIds={activeCategoryIds}
          />
        )}

        {filteredEntries.length > 0 ? (
          <>
            <div className="section-title">Предстоящие</div>
            <div className="expense-list">
              {filteredEntries.map(entry => (
                <ExpenseItem
                  key={entry.id + entry.nextDate}
                  entry={entry}
                  onClick={setSelected}
                  hasReminder={reminderIds.has(entry.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty">
            <div className="empty-emoji">💸</div>
            <div className="empty-text">
              Нет обязательных трат<br />на этот период
            </div>
          </div>
        )}
      </div>

      <div className="app-footer">
        {period === 'month' && monthOffset !== 0 && (
          <button className="btn-to-current" onClick={() => setMonthOffset(0)}>
            К текущему месяцу
          </button>
        )}
        <div className="footer-row">
          <button className="fab" onClick={() => setShowAdd(true)}>
            + Добавить трату
          </button>
          <button className="btn-settings" onClick={() => setShowSettings(true)}>⚙</button>
        </div>
      </div>

      {showAdd && (
        <AddSheet onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}

      {selected && (
        <DetailSheet
          entry={selected}
          hasReminder={reminderIds.has(selected.id)}
          onDelete={handleDelete}
          onEdit={e => { setEditing(e); setSelected(null); }}
          onToggleReminder={() => handleToggleReminder(selected)}
          onClose={() => setSelected(null)}
        />
      )}

      {editing && (
        <EditSheet
          expense={editing}
          hasReminder={reminderIds.has(editing.id)}
          onEdit={handleEdit}
          onClose={() => setEditing(null)}
        />
      )}

      {showSettings && (
        <SettingsSheet
          reminderDays={reminderDays}
          onSave={days => {
            setReminderDays(days);
            cloudSet(SETTINGS_KEY, JSON.stringify({ reminderDays: days }));
            saveReminderSettings(days);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

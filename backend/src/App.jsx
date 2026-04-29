import { useState, useEffect, useCallback } from 'react';
import { today, addDays, endOfMonth, getEntries, capitalize } from './utils/dates';
import { tg, cloudGet, cloudSet, STORAGE_KEY } from './utils/storage';
import PeriodSwitcher from './components/PeriodSwitcher';
import MonthSwitcher from './components/MonthSwitcher';
import TotalCard from './components/TotalCard';
import ExpenseItem from './components/ExpenseItem';
import CategoryFilter from './components/CategoryFilter';
import AddSheet from './components/AddSheet';
import EditSheet from './components/EditSheet';
import DetailSheet from './components/DetailSheet';

export default function App() {
  const [period, setPeriod] = useState('week');
  const [monthOffset, setMonthOffset] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [ready, setReady] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);

  useEffect(() => { tg()?.ready(); tg()?.expand(); }, []);

  useEffect(() => {
    cloudGet(STORAGE_KEY).then(raw => {
      try { setExpenses(JSON.parse(raw) || []); } catch { setExpenses([]); }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    cloudSet(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses, ready]);

  useEffect(() => { setFilterCategory(null); }, [period, monthOffset]);

  const handleAdd = useCallback(expense => {
    tg()?.HapticFeedback?.selectionChanged();
    setExpenses(prev => [...prev, expense]);
    setShowAdd(false);
  }, []);

  const handleDelete = useCallback(id => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleEdit = useCallback(updated => {
    tg()?.HapticFeedback?.selectionChanged();
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditing(null);
  }, []);

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
        <button className="fab" onClick={() => setShowAdd(true)}>
          + Добавить трату
        </button>
      </div>

      {showAdd && (
        <AddSheet onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}

      {selected && (
        <DetailSheet
          entry={selected}
          onDelete={handleDelete}
          onEdit={e => { setEditing(e); setSelected(null); }}
          onClose={() => setSelected(null)}
        />
      )}

      {editing && (
        <EditSheet
          expense={editing}
          onEdit={handleEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

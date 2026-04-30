// Карточка с итоговой суммой периода. Props: total (число), count, label (строка периода).
import { fmtAmount } from '../utils/dates';

export default function TotalCard({ total, count, label }) {
  // Склонение: 1 трата / 2-4 траты / 5+ трат
  const noun = count === 1 ? 'трата' : count < 5 ? 'траты' : 'трат';

  return (
    <div className="total-card">
      <div className="total-label">{label}</div>
      <div className="total-row">
        <div className="total-amount">{fmtAmount(total)}</div>
        <div className="total-currency">₽</div>
      </div>
      <div className="total-count">
        {count === 0 ? 'Нет трат' : `${count} ${noun}`}
      </div>
    </div>
  );
}

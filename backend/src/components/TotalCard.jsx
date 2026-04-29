import { fmtAmount } from '../utils/dates';

export default function TotalCard({ total, count, label }) {
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

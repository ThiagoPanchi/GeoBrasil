import type { DashboardRow, Indicator } from '../types';
import { formatValue } from '../utils/format';

type DashboardChartsProps = {
  rows: DashboardRow[];
  indicators: Indicator[];
  selectedIndicator: string;
};

export function DashboardCharts({ rows, indicators, selectedIndicator }: DashboardChartsProps) {
  const indicator = indicators.find((item) => item.id === selectedIndicator);
  const values = rows
    .map((row) => row.indicators[selectedIndicator])
    .filter((value): value is number => value !== undefined && value !== null);
  const max = Math.max(...values, 1);
  const topRows = [...rows]
    .filter((row) => row.indicators[selectedIndicator] !== undefined && row.indicators[selectedIndicator] !== null)
    .sort((first, second) => (second.indicators[selectedIndicator] ?? 0) - (first.indicators[selectedIndicator] ?? 0))
    .slice(0, 5);

  return (
    <section className="charts-grid">
      <article className="info-card chart-card">
        <h2>Ranking - {indicator?.name ?? 'Indicador'}</h2>
        {topRows.length > 0 ? (
          topRows.map((row) => {
            const value = row.indicators[selectedIndicator] ?? 0;
            return (
              <div className="bar-row" key={row.id}>
                <span>{row.name}</span>
                <div>
                  <i style={{ width: `${Math.max((value / max) * 100, 3)}%` }} />
                </div>
                <strong>{formatValue(value)}</strong>
              </div>
            );
          })
        ) : (
          <p>Nenhum dado carregado.</p>
        )}
      </article>

      <article className="info-card chart-card">
        <h2>Distribuicao</h2>
        {values.length > 0 ? (
          <dl>
            <dt>Registros</dt>
            <dd>{values.length}</dd>
            <dt>Minimo</dt>
            <dd>{formatValue(Math.min(...values))}</dd>
            <dt>Maximo</dt>
            <dd>{formatValue(Math.max(...values))}</dd>
            <dt>Total</dt>
            <dd>{formatValue(values.reduce((total, value) => total + value, 0))}</dd>
          </dl>
        ) : (
          <p>Nao ha valores para calcular a distribuicao atual.</p>
        )}
      </article>
    </section>
  );
}

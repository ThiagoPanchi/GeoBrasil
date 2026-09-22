import { useState } from 'react';
import type { Indicator, MunicipalityDetails } from '../types';
import { formatValue } from '../utils/format';

type SortMode = 'value-desc' | 'value-asc' | 'name-asc';

type DashboardPanelProps = {
  rows: MunicipalityDetails[];
  indicators: Indicator[];
  selectedIndicator: string;
  selectedFeature: MunicipalityDetails | null;
  onRowSelect: (row: MunicipalityDetails) => void;
};

export function DashboardPanel({ rows, indicators, selectedIndicator, selectedFeature, onRowSelect }: DashboardPanelProps) {
  const [sortMode, setSortMode] = useState<SortMode>('value-desc');
  const indicator = indicators.find((item) => item.id === selectedIndicator);
  const max = rows.reduce((current, row) => Math.max(current, row.indicators[selectedIndicator] ?? 0), 0);
  const sortedRows = [...rows].sort((a, b) => compareRows(a, b, selectedIndicator, sortMode));

  function handleInvertValueOrder() {
    setSortMode((current) => (current === 'value-asc' ? 'value-desc' : 'value-asc'));
  }

  return (
    <section className="dashboard-panel" aria-label="Grafico e tabela">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Grafico e tabela</span>
          <h2>{indicator?.name ?? 'Indicador selecionado'}</h2>
        </div>
        <div className="panel-actions" aria-label="Ordenacao do grafico e tabela">
          <small>{rows.length} registros exibidos no mapa</small>
          <button className={sortMode === 'value-desc' ? 'active' : ''} type="button" onClick={() => setSortMode('value-desc')}>
            Maiores primeiro
          </button>
          <button className={sortMode === 'value-asc' ? 'active' : ''} type="button" onClick={handleInvertValueOrder}>
            Inverter ordem
          </button>
          <button className={sortMode === 'name-asc' ? 'active' : ''} type="button" onClick={() => setSortMode('name-asc')}>
            A-Z
          </button>
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="dashboard-content">
          <div className="chart-scroll" role="region" aria-label="Grafico com rolagem horizontal" tabIndex={0}>
            <div className="bar-chart" style={{ minWidth: `${Math.max(rows.length * 72, 420)}px` }}>
              {sortedRows.map((row) => {
                const value = row.indicators[selectedIndicator] ?? 0;
                const height = max > 0 ? Math.max(10, (value / max) * 100) : 0;
                const active = selectedFeature?.id === row.id && selectedFeature?.layer === row.layer;

                return (
                  <button
                    className={`bar-item${active ? ' active' : ''}`}
                    key={`${row.layer}-${row.id}`}
                    type="button"
                    onClick={() => onRowSelect(row)}
                    title={`${row.name}: ${formatValue(value)} ${indicator?.unit ?? ''}`}
                  >
                    <span className="bar-value">{formatValue(value)}</span>
                    <span className="bar-track">
                      <span className="bar-fill" style={{ height: `${height}%` }} />
                    </span>
                    <strong>{row.name}</strong>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="table-scroll" role="region" aria-label="Tabela de registros exibidos" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>UF</th>
                  <th>Codigo</th>
                  <th>{indicator?.name ?? 'Indicador'}</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr
                    className={selectedFeature?.id === row.id && selectedFeature?.layer === row.layer ? 'active' : ''}
                    key={`${row.layer}-${row.id}`}
                    onClick={() => onRowSelect(row)}
                  >
                    <td>{row.name}</td>
                    <td>{row.uf || 'Brasil'}</td>
                    <td>{row.id}</td>
                    <td>
                      {formatValue(row.indicators[selectedIndicator])} {indicator?.unit ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>Os registros carregados aparecerao aqui.</p>
      )}
    </section>
  );
}

function compareRows(a: MunicipalityDetails, b: MunicipalityDetails, selectedIndicator: string, sortMode: SortMode) {
  const nameOrder = a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });

  if (sortMode === 'name-asc') {
    return nameOrder || a.id.localeCompare(b.id);
  }

  const valueA = a.indicators[selectedIndicator] ?? 0;
  const valueB = b.indicators[selectedIndicator] ?? 0;
  const valueOrder = sortMode === 'value-desc' ? valueB - valueA : valueA - valueB;

  return valueOrder || nameOrder || a.id.localeCompare(b.id);
}

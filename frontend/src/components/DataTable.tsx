import { useEffect, useMemo, useState } from 'react';
import type { DashboardRow, Indicator } from '../types';
import { formatValue } from '../utils/format';

type DataTableProps = {
  rows: DashboardRow[];
  indicators: Indicator[];
};

const EXCLUDED_INDICATOR_IDS = new Set(['age_group', 'gender_sex', 'literacy', 'race_ethnicity']);
const DEFAULT_COLUMN_IDS = ['population', 'male_population', 'female_population', 'income', 'density', 'area_km2'];
const TABLE_ONLY_INDICATORS: Indicator[] = [{ id: 'area_km2', name: 'Area', unit: 'km2' }];

export function DataTable({ rows, indicators }: DataTableProps) {
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);

  const availableIndicators = useMemo(() => {
    const mergedIndicators = [...indicators, ...TABLE_ONLY_INDICATORS.filter((extra) => !indicators.some((indicator) => indicator.id === extra.id))];
    return mergedIndicators.filter((indicator) => !EXCLUDED_INDICATOR_IDS.has(indicator.id));
  }, [indicators]);

  useEffect(() => {
    if (availableIndicators.length === 0 || visibleColumnIds.length > 0) {
      return;
    }

    const defaultIds = DEFAULT_COLUMN_IDS.filter((id) => availableIndicators.some((indicator) => indicator.id === id));
    setVisibleColumnIds(defaultIds.length > 0 ? defaultIds : availableIndicators.slice(0, 6).map((indicator) => indicator.id));
  }, [availableIndicators, visibleColumnIds.length]);

  const visibleIndicators = availableIndicators.filter((indicator) => visibleColumnIds.includes(indicator.id));

  function toggleColumn(indicatorId: string) {
    setVisibleColumnIds((currentIds) =>
      currentIds.includes(indicatorId)
        ? currentIds.filter((id) => id !== indicatorId)
        : [...currentIds, indicatorId],
    );
  }

  return (
    <section className="data-table info-card">
      <div className="data-table-header">
        <h2>Tabela de dados</h2>
        <div className="column-selector">
          <button type="button" onClick={() => setIsColumnSelectorOpen((isOpen) => !isOpen)}>
            Colunas
          </button>
          {isColumnSelectorOpen ? (
            <div className="column-selector-menu">
              {availableIndicators.map((indicator) => (
                <label key={indicator.id} className="column-option">
                  <input
                    type="checkbox"
                    checked={visibleColumnIds.includes(indicator.id)}
                    onChange={() => toggleColumn(indicator.id)}
                  />
                  <span>{indicator.name}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Territorio</th>
              {visibleIndicators.map((indicator) => (
                <th key={indicator.id}>{indicator.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  {visibleIndicators.map((indicator) => (
                    <td key={indicator.id}>{formatValue(valueForIndicator(row, indicator.id))}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleIndicators.length + 1}>Nenhum registro carregado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function valueForIndicator(row: DashboardRow, indicatorId: string) {
  const value = row.indicators[indicatorId];
  if (value !== undefined && value !== null) {
    return value;
  }

  if (indicatorId === 'area_km2') {
    const population = row.indicators.population;
    const density = row.indicators.density;
    if (population !== undefined && density !== undefined && density > 0) {
      return population / density;
    }
  }

  return undefined;
}

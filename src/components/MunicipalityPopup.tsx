import type { Indicator, MunicipalityDetails } from '../types';
import { formatValue } from '../utils/format';

const reportAttributeLabels: Record<string, string> = {
  SITUACAO: 'Situacao',
  AREA_KM2: 'Area (km2)',
  NM_DIST: 'Distrito',
  NM_BAIRRO: 'Bairro',
};

const sectorContextAttributes = [
  { key: 'SITUACAO', label: 'Situacao' },
  { key: 'NM_DIST', label: 'Distrito' },
  { key: 'NM_BAIRRO', label: 'Bairro' },
] as const;

const sectorCoreMetricColumns = [
  [
    { id: 'population', source: 'indicator' },
    { id: 'AREA_KM2', source: 'attribute', label: 'Area', unit: 'km2' },
    { id: 'density', source: 'indicator' },
  ],
  [
    { id: 'income', source: 'indicator' },
    { id: 'households', source: 'indicator' },
    { id: 'responsible_persons', source: 'indicator' },
  ],
] as const;

const sectorContextAttributeKeys = new Set(sectorContextAttributes.map((item) => item.key));
const sectorCoreMetricAttributeKeys = new Set(['AREA_KM2']);
const sectorCoreMetricIndicatorIds = new Set(
  sectorCoreMetricColumns.flatMap((column) => column.filter((item) => item.source === 'indicator').map((item) => item.id)),
);

const demographicGroups = [
  {
    id: 'race',
    title: 'Cor ou raca',
    indicators: [
      { id: 'race_white', label: 'Branca', color: '#e2e8f0' },
      { id: 'race_black', label: 'Preta', color: '#334155' },
      { id: 'race_yellow', label: 'Amarela', color: '#facc15' },
      { id: 'race_brown', label: 'Parda', color: '#b45309' },
      { id: 'race_indigenous', label: 'Indigena', color: '#16a34a' },
    ],
  },
  {
    id: 'sex',
    title: 'Genero',
    indicators: [
      { id: 'men', label: 'Homens', color: '#2563eb' },
      { id: 'women', label: 'Mulheres', color: '#db2777' },
    ],
  },
] as const;

const demographicIndicatorIds = new Set(demographicGroups.flatMap((group) => group.indicators.map((item) => item.id)));

type MunicipalityPopupProps = {
  feature: MunicipalityDetails;
  indicators: Indicator[];
  selectedIndicator: string;
  report?: boolean;
};

export function MunicipalityPopup({
  feature,
  indicators,
  selectedIndicator,
  report = false,
}: MunicipalityPopupProps) {
  const indicator = indicators.find((item) => item.id === selectedIndicator);
  const indicatorById = new Map(indicators.map((item) => [item.id, item]));
  const isSector = feature.layer === 'sectors';
  const reportAttributes = Object.entries(feature.reportAttributes ?? {}).filter(
    ([key, value]) =>
      value !== '' &&
      value !== 0 &&
      (!isSector || (!sectorContextAttributeKeys.has(key) && !sectorCoreMetricAttributeKeys.has(key))),
  );
  const sectorContextItems = isSector
    ? sectorContextAttributes
        .map((item) => ({ ...item, value: feature.reportAttributes?.[item.key] }))
        .filter((item) => item.value !== undefined && item.value !== '' && item.value !== 0)
    : [];
  const sectorCoreMetricGroups = isSector
    ? sectorCoreMetricColumns
        .map((column) =>
          column
            .map((item) => buildSectorCoreMetric(item, indicatorById, feature, selectedIndicator))
            .filter((item): item is SectorCoreMetric => item !== null),
        )
        .filter((column) => column.length > 0)
    : [];
  const charts = demographicGroups
    .map((group) => buildChartData(group, feature.indicators, selectedIndicator))
    .filter((chart) => isSector || chart.total > 0);
  const chartIndicatorIds = new Set(charts.flatMap((chart) => chart.items.map((item) => item.id)));
  const rowIndicators = indicators.filter(
    (item) => !chartIndicatorIds.has(item.id) && (!isSector || (!demographicIndicatorIds.has(item.id) && !sectorCoreMetricIndicatorIds.has(item.id))),
  );
  const chartedSelectedIndicator = demographicIndicatorIds.has(selectedIndicator) && chartIndicatorIds.has(selectedIndicator);

  if (report) {
    return (
      <div className="municipality-popup municipality-popup-report">
        <div className="popup-report-heading">
          <span>Relatorio de indicadores</span>
          <strong>{feature.name}</strong>
          <small>{feature.uf || 'Brasil'}</small>
          {sectorContextItems.length > 0 ? (
            <div className="popup-sector-context-grid">
              {sectorContextItems.map((item) => (
                <div className="popup-sector-context-item" key={item.key}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="popup-report-list">
          {sectorCoreMetricGroups.length > 0 ? (
            <div className="popup-sector-core-section">
              <span>Indicadores principais</span>
              <div className="popup-sector-core-grid">
                {sectorCoreMetricGroups.map((group, index) => (
                  <div className="popup-sector-core-column" key={index}>
                    {group.map((item) => (
                      <div className={`popup-report-row${item.active ? ' active' : ''}`} key={item.id}>
                        <span>{item.label}</span>
                        <strong>
                          {item.value} {item.unit}
                        </strong>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {isSector && reportAttributes.length > 0 ? (
            <div className="popup-report-section">
              <span>Atributos do setor</span>
              {reportAttributes.map(([key, value]) => (
                <div className="popup-report-row" key={key}>
                  <span>{reportAttributeLabels[key] ?? key}</span>
                  <strong>{typeof value === 'number' ? formatValue(value) : value}</strong>
                </div>
              ))}
            </div>
          ) : null}
          {rowIndicators.map((item) => (
            <div className={`popup-report-row${item.id === selectedIndicator ? ' active' : ''}`} key={item.id}>
              <span>{item.name}</span>
              <strong>
                {formatValue(feature.indicators[item.id])} {item.unit}
              </strong>
            </div>
          ))}
          {charts.length > 0 ? (
            <div className="popup-chart-section">
              <span>Distribuicoes demograficas</span>
              <div className="popup-chart-grid">
                {charts.map((chart) => (
                  <DemographicPieChart chart={chart} key={chart.id} />
                ))}
              </div>
              {chartedSelectedIndicator ? <small>Indicador selecionado destacado no grafico.</small> : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="municipality-popup">
      <strong>{feature.name}</strong>
      <span>UF: {feature.uf || 'Brasil'}</span>
      <span>
        {indicator?.name ?? 'Indicador'}: {formatValue(feature.indicators[selectedIndicator])}
      </span>
    </div>
  );
}

type DemographicGroup = (typeof demographicGroups)[number];

type SectorCoreMetric = {
  id: string;
  label: string;
  unit: string;
  value: string;
  active: boolean;
};

type SectorCoreMetricSource = (typeof sectorCoreMetricColumns)[number][number];

type ChartData = {
  id: string;
  title: string;
  total: number;
  selected: boolean;
  gradient: string;
  items: Array<{ id: string; label: string; color: string; value: number; selected: boolean }>;
};

function buildChartData(group: DemographicGroup, values: Record<string, number>, selectedIndicator: string): ChartData {
  const items = group.indicators.map((item) => ({
    ...item,
    value: Number.isFinite(values[item.id]) ? values[item.id] : 0,
    selected: item.id === selectedIndicator,
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return {
    id: group.id,
    title: group.title,
    total,
    selected: items.some((item) => item.selected),
    gradient: buildConicGradient(items, total),
    items,
  };
}

function buildSectorCoreMetric(
  item: SectorCoreMetricSource,
  indicators: Map<string, Indicator>,
  feature: MunicipalityDetails,
  selectedIndicator: string,
): SectorCoreMetric | null {
  if (item.source === 'attribute') {
    const value = feature.reportAttributes?.[item.id];

    if (value === undefined || value === '' || value === 0) {
      return null;
    }

    return {
      id: item.id,
      label: item.label,
      unit: item.unit,
      value: typeof value === 'number' ? formatValue(value) : value,
      active: false,
    };
  }

  const indicator = indicators.get(item.id);

  if (!indicator) {
    return null;
  }

  return {
    id: item.id,
    label: indicator.name,
    unit: indicator.unit,
    value: formatValue(feature.indicators[item.id]),
    active: item.id === selectedIndicator,
  };
}

function buildConicGradient(items: ChartData['items'], total: number) {
  if (total <= 0) {
    return '#e2e8f0';
  }

  let cursor = 0;
  const segments = items
    .filter((item) => item.value > 0)
    .map((item) => {
      const start = cursor;
      cursor += (item.value / total) * 100;
      return `${item.color} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
    });

  return `conic-gradient(${segments.join(', ')})`;
}

function DemographicPieChart({ chart }: { chart: ChartData }) {
  const isZero = chart.total <= 0;

  return (
    <div className={`popup-pie-card${chart.selected ? ' active' : ''}${isZero ? ' zero' : ''}`}>
      <div className="popup-pie-heading">
        <strong>{chart.title}</strong>
        <span>Total: {formatValue(chart.total)}</span>
      </div>
      <div className="popup-pie-content">
        <div className="popup-pie" style={{ background: chart.gradient }} aria-hidden="true" />
        <div className="popup-pie-legend">
          {isZero ? <small className="popup-pie-empty-label">Total zerado</small> : null}
          {chart.items.map((item) => (
            <div className={`popup-pie-legend-row${item.selected ? ' active' : ''}`} key={item.id}>
              <span className="popup-pie-swatch" style={{ background: item.color }} />
              <span>{item.label}</span>
              <strong>{formatValue(item.value)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

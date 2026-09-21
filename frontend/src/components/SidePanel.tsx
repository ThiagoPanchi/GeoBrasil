import type { ChoroplethBreak, Indicator, MunicipalityDetails } from '../types';
import { formatValue } from '../utils/format';

type SidePanelProps = {
  selectedFeature: MunicipalityDetails | null;
  indicators: Indicator[];
  selectedIndicator: string;
  breaks: ChoroplethBreak[];
  rows: MunicipalityDetails[];
};

export function SidePanel({ selectedFeature, indicators, selectedIndicator, breaks, rows }: SidePanelProps) {
  const indicator = indicators.find((item) => item.id === selectedIndicator);
  const topRows = [...rows]
    .sort((a, b) => (b.indicators[selectedIndicator] ?? 0) - (a.indicators[selectedIndicator] ?? 0))
    .slice(0, 6);

  return (
    <>
      <section className="info-card">
        <h2>Geometria selecionada</h2>
        {selectedFeature ? (
          <dl>
            <dt>Nome</dt>
            <dd>{selectedFeature.name}</dd>
            <dt>UF</dt>
            <dd>{selectedFeature.uf || 'Brasil'}</dd>
            <dt>Codigo IBGE</dt>
            <dd>{selectedFeature.id}</dd>
            <dt>{indicator?.name ?? 'Indicador'}</dt>
            <dd>
              {formatValue(selectedFeature.indicators[selectedIndicator])} {indicator?.unit ?? ''}
            </dd>
          </dl>
        ) : (
          <p>Nenhuma geometria selecionada.</p>
        )}
      </section>

      <section className="legend">
        <h2>Legenda</h2>
        {breaks.length > 0 ? (
          breaks.map((item) => (
            <div className="legend-row" key={`${item.min}-${item.max}`}>
              <span style={{ background: item.color }} />
              <small>
                {formatValue(item.min)} a {formatValue(item.max)}
              </small>
            </div>
          ))
        ) : (
          <p>Selecione uma UF para gerar o coropletico.</p>
        )}
      </section>

      <section className="info-card">
        <h2>Grafico e tabela</h2>
        {topRows.length > 0 ? (
          <div className="ranking-list">
            {topRows.map((row) => {
              const value = row.indicators[selectedIndicator] ?? 0;
              const max = topRows[0]?.indicators[selectedIndicator] ?? 1;

              return (
                <div className="ranking-row" key={`${row.layer}-${row.id}`}>
                  <div>
                    <strong>{row.name}</strong>
                    <small>{formatValue(value)} {indicator?.unit ?? ''}</small>
                  </div>
                  <span style={{ width: `${Math.max(8, (value / Math.max(max, 1)) * 100)}%` }} />
                </div>
              );
            })}
          </div>
        ) : (
          <p>Os registros carregados aparecerao aqui.</p>
        )}
      </section>
    </>
  );
}

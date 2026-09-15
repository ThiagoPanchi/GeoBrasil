import type { ChoroplethBreak, DashboardRow, Indicator } from '../types';
import { formatValue } from '../utils/format';

type SidePanelProps = {
  selectedFeature: DashboardRow | null;
  selectedUfName?: string;
  currentLayer: string;
  indicators: Indicator[];
  selectedIndicator: string;
  breaks: ChoroplethBreak[];
};

export function SidePanel({
  selectedFeature,
  selectedUfName,
  currentLayer,
  indicators,
  selectedIndicator,
  breaks,
}: SidePanelProps) {
  const indicator = indicators.find((item) => item.id === selectedIndicator);

  return (
    <>
      <section className="info-card">
        <h2>Contexto atual</h2>
        <dl>
          <dt>Territorio</dt>
          <dd>{selectedUfName ?? 'Brasil'}</dd>
          <dt>Camada</dt>
          <dd>{currentLayer}</dd>
          <dt>Indicador</dt>
          <dd>{indicator?.name ?? 'Carregando'}</dd>
        </dl>
      </section>

      <section className="info-card">
        <h2>Geometria selecionada</h2>
        {selectedFeature ? (
          <dl>
            <dt>Nome</dt>
            <dd>{selectedFeature.name}</dd>
            <dt>Codigo</dt>
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
        <h2>Legenda - {indicator?.name ?? 'Indicador'}</h2>
        {breaks.length > 0 ? (
          breaks.map((item) => (
            <div className="legend-row" key={`${item.min}-${item.max}-${item.color}`}>
              <span style={{ background: item.color }} />
              <small>
                {formatValue(item.min)} a {formatValue(item.max)}
              </small>
            </div>
          ))
        ) : (
          <p>Sem classificacao coropletica para a visualizacao atual.</p>
        )}
      </section>
    </>
  );
}

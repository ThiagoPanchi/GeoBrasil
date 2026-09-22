import type { Indicator, MunicipalityDetails } from '../types';
import { formatValue } from '../utils/format';

type SidePanelProps = {
  selectedFeature: MunicipalityDetails | null;
  indicators: Indicator[];
  selectedIndicator: string;
};

export function SidePanel({ selectedFeature, indicators, selectedIndicator }: SidePanelProps) {
  const indicator = indicators.find((item) => item.id === selectedIndicator);

  return (
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
  );
}

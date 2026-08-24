import type { ChoroplethBreak, Indicator, MunicipalityDetails } from '../types';
import { formatValue } from '../utils/format';

type SidePanelProps = {
  municipality: MunicipalityDetails | null;
  indicators: Indicator[];
  selectedIndicator: string;
  breaks: ChoroplethBreak[];
};

export function SidePanel({ municipality, indicators, selectedIndicator, breaks }: SidePanelProps) {
  const indicator = indicators.find((item) => item.id === selectedIndicator);

  return (
    <>
      <section className="info-card">
        <h2>Municipio selecionado</h2>
        {municipality ? (
          <dl>
            <dt>Nome</dt>
            <dd>{municipality.name}</dd>
            <dt>UF</dt>
            <dd>{municipality.uf}</dd>
            <dt>Codigo IBGE</dt>
            <dd>{municipality.id}</dd>
            <dt>{indicator?.name ?? 'Indicador'}</dt>
            <dd>
              {formatValue(municipality.indicators[selectedIndicator])} {indicator?.unit ?? ''}
            </dd>
          </dl>
        ) : (
          <p>Nenhum municipio selecionado.</p>
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
    </>
  );
}

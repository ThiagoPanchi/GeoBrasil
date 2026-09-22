import type { Indicator, MunicipalityDetails } from '../types';
import { formatValue } from '../utils/format';

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

  if (report) {
    return (
      <div className="municipality-popup municipality-popup-report">
        <div className="popup-report-heading">
          <span>Relatorio de indicadores</span>
          <strong>{feature.name}</strong>
          <small>{feature.uf || 'Brasil'}</small>
        </div>
        <div className="popup-report-list">
          {indicators.map((item) => (
            <div className={`popup-report-row${item.id === selectedIndicator ? ' active' : ''}`} key={item.id}>
              <span>{item.name}</span>
              <strong>
                {formatValue(feature.indicators[item.id])} {item.unit}
              </strong>
            </div>
          ))}
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

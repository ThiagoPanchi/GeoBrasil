import type { Indicator, MunicipalityDetails } from '../types';
import { formatValue } from '../utils/format';

type MunicipalityPopupProps = {
  feature: MunicipalityDetails;
  indicators: Indicator[];
  selectedIndicator: string;
};

export function MunicipalityPopup({
  feature,
  indicators,
  selectedIndicator,
}: MunicipalityPopupProps) {
  const indicator = indicators.find((item) => item.id === selectedIndicator);

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

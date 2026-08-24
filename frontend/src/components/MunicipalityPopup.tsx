import type { Indicator, MunicipalityDetails } from '../types';
import { formatValue } from '../utils/format';

type MunicipalityPopupProps = {
  municipality: MunicipalityDetails;
  indicators: Indicator[];
  selectedIndicator: string;
};

export function MunicipalityPopup({
  municipality,
  indicators,
  selectedIndicator,
}: MunicipalityPopupProps) {
  const indicator = indicators.find((item) => item.id === selectedIndicator);

  return (
    <div className="municipality-popup">
      <strong>{municipality.name}</strong>
      <span>UF: {municipality.uf}</span>
      <span>
        {indicator?.name ?? 'Indicador'}: {formatValue(municipality.indicators[selectedIndicator])}
      </span>
    </div>
  );
}

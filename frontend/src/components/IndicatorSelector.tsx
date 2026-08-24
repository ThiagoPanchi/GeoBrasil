import type { Indicator } from '../types';

type IndicatorSelectorProps = {
  indicators: Indicator[];
  selectedIndicator: string;
  onIndicatorChange: (indicator: string) => void;
};

export function IndicatorSelector({
  indicators,
  selectedIndicator,
  onIndicatorChange,
}: IndicatorSelectorProps) {
  return (
    <label>
      Indicador censitario
      <select value={selectedIndicator} onChange={(event) => onIndicatorChange(event.target.value)}>
        {indicators.map((indicator) => (
          <option key={indicator.id} value={indicator.id}>
            {indicator.name}
          </option>
        ))}
      </select>
    </label>
  );
}

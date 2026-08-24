import type { Uf } from '../types';

type LayerControlProps = {
  ufs: Uf[];
  selectedUf: string;
  onUfChange: (uf: string) => void;
};

export function LayerControl({ ufs, selectedUf, onUfChange }: LayerControlProps) {
  return (
    <label>
      UF
      <select value={selectedUf} onChange={(event) => onUfChange(event.target.value)}>
        <option value="">Selecione</option>
        {ufs.map((uf) => (
          <option key={uf.code} value={uf.code}>
            {uf.name}
          </option>
        ))}
      </select>
    </label>
  );
}

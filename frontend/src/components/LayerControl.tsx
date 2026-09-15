import type { DashboardRow, Microregion, TerritorialLayer, Uf } from '../types';

type LayerControlProps = {
  ufs: Uf[];
  microregions: Microregion[];
  municipalities: DashboardRow[];
  currentLayer: TerritorialLayer;
  selectedUf: string;
  selectedMicroregion: string;
  selectedMunicipality: string;
  onUfChange: (uf: string) => void;
  onMicroregionChange: (microregion: string) => void;
  onMunicipalityChange: (municipality: string) => void;
  onLayerChange: (layer: TerritorialLayer) => void;
  onBack: () => void;
};

export function LayerControl({
  ufs,
  microregions,
  municipalities,
  currentLayer,
  selectedUf,
  selectedMicroregion,
  selectedMunicipality,
  onUfChange,
  onMicroregionChange,
  onMunicipalityChange,
  onLayerChange,
  onBack,
}: LayerControlProps) {
  return (
    <section className="controls">
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

      <label>
        Camada
        <select value={currentLayer} onChange={(event) => onLayerChange(event.target.value as TerritorialLayer)}>
          <option value="states">UFs</option>
          <option value="municipalities" disabled={!selectedUf}>
            Municipios
          </option>
          <option value="microregions" disabled={!selectedUf}>
            Microrregioes
          </option>
          <option value="sectors" disabled={!selectedMunicipality}>
            Setores censitarios
          </option>
        </select>
      </label>

      <label>
        Microrregiao
        <select
          value={selectedMicroregion}
          onChange={(event) => onMicroregionChange(event.target.value)}
          disabled={!selectedUf || microregions.length === 0}
        >
          <option value="">Opcional</option>
          {microregions.map((microregion) => (
            <option key={microregion.id} value={microregion.id}>
              {microregion.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Municipio
        <select
          value={selectedMunicipality}
          onChange={(event) => onMunicipalityChange(event.target.value)}
          disabled={!selectedUf || municipalities.length === 0}
        >
          <option value="">Selecione</option>
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={municipality.id}>
              {municipality.name}
            </option>
          ))}
        </select>
      </label>

      <button type="button" onClick={onBack} disabled={currentLayer === 'states'}>
        Voltar nivel
      </button>
    </section>
  );
}

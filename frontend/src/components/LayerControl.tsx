import type { Microregion, MunicipalityOption, TerritorialLayer, Uf } from '../types';

type LayerControlProps = {
  ufs: Uf[];
  microregions: Microregion[];
  municipalities: MunicipalityOption[];
  selectedUf: string;
  selectedMicroregion: string;
  selectedMunicipalityId: string;
  currentLayer: TerritorialLayer;
  onUfChange: (uf: string) => void;
  onMicroregionChange: (microregionId: string) => void;
  onMunicipalityChange: (municipalityId: string) => void;
  onLayerChange: (layer: TerritorialLayer) => void;
  onBack: () => void;
};

export function LayerControl({
  ufs,
  microregions,
  municipalities,
  selectedUf,
  selectedMicroregion,
  selectedMunicipalityId,
  currentLayer,
  onUfChange,
  onMicroregionChange,
  onMunicipalityChange,
  onLayerChange,
  onBack,
}: LayerControlProps) {
  return (
    <section className="control-stack">
      <label>
        UF
        <select value={selectedUf} onChange={(event) => onUfChange(event.target.value)}>
          <option value="">Brasil</option>
          {ufs.map((uf) => (
            <option key={uf.code} value={uf.code}>
              {uf.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Microrregiao
        <select
          value={selectedMicroregion}
          onChange={(event) => onMicroregionChange(event.target.value)}
          disabled={!selectedUf || microregions.length === 0}
        >
          <option value="">Todas na UF</option>
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
          value={selectedMunicipalityId}
          onChange={(event) => onMunicipalityChange(event.target.value)}
          disabled={!selectedMicroregion || municipalities.length === 0}
        >
          <option value="">Selecione</option>
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={municipality.id}>
              {municipality.name}
            </option>
          ))}
        </select>
      </label>

      <div className="layer-buttons" aria-label="Camadas territoriais">
        <button type="button" className={currentLayer === 'ufs' ? 'active' : ''} onClick={() => onLayerChange('ufs')}>
          UFs
        </button>
        <button
          type="button"
          className={currentLayer === 'microregions' ? 'active' : ''}
          disabled={!selectedUf}
          onClick={() => onLayerChange('microregions')}
        >
          Microrregioes
        </button>
        <button
          type="button"
          className={currentLayer === 'municipalities' ? 'active' : ''}
          disabled={!selectedMicroregion}
          onClick={() => onLayerChange('municipalities')}
        >
          Municipios
        </button>
        <button
          type="button"
          className={currentLayer === 'sectors' ? 'active' : ''}
          disabled={!selectedMunicipalityId}
          onClick={() => onLayerChange('sectors')}
        >
          Setores
        </button>
        <button type="button" onClick={onBack} disabled={currentLayer === 'ufs'}>
          Voltar
        </button>
      </div>
    </section>
  );
}

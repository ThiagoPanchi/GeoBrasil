import { useEffect, useState } from 'react';
import { getIndicators, getMicroregionsByState, getMunicipalitiesByMicroregion, getStates } from '../api';
import { IndicatorSelector } from '../components/IndicatorSelector';
import { LayerControl } from '../components/LayerControl';
import { MapView } from '../components/MapView';
import { SidePanel } from '../components/SidePanel';
import type { ChoroplethBreak, Indicator, Microregion, MunicipalityDetails, MunicipalityOption, TerritorialLayer, Uf } from '../types';

export function MapPage() {
  const [ufs, setUfs] = useState<Uf[]>([]);
  const [microregions, setMicroregions] = useState<Microregion[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityOption[]>([]);
  const [selectedUf, setSelectedUf] = useState('');
  const [selectedMicroregion, setSelectedMicroregion] = useState('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState('');
  const [currentLayer, setCurrentLayer] = useState<TerritorialLayer>('ufs');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('population');
  const [selectedFeature, setSelectedFeature] = useState<MunicipalityDetails | null>(null);
  const [rows, setRows] = useState<MunicipalityDetails[]>([]);
  const [breaks, setBreaks] = useState<ChoroplethBreak[]>([]);
  const [status, setStatus] = useState('Carregando catalogo estatico...');

  useEffect(() => {
    const controller = new AbortController();

    getStates(controller.signal)
      .then(setUfs)
      .catch(() => setStatus('Nao foi possivel carregar a lista estatica de UFs.'));

    getIndicators(controller.signal)
      .then((items) => {
        setIndicators(items);
        setSelectedIndicator(items[0]?.id ?? 'population');
      })
      .catch(() => setStatus('Nao foi possivel carregar a lista estatica de indicadores.'));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (!selectedUf) {
      setMicroregions([]);
      return () => controller.abort();
    }

    getMicroregionsByState(selectedUf, controller.signal)
      .then(setMicroregions)
      .catch(() => setStatus('Nao foi possivel carregar as microrregioes da UF.'));

    return () => controller.abort();
  }, [selectedUf]);

  useEffect(() => {
    const controller = new AbortController();

    if (!selectedMicroregion) {
      setMunicipalities([]);
      return () => controller.abort();
    }

    getMunicipalitiesByMicroregion(selectedMicroregion, controller.signal)
      .then(setMunicipalities)
      .catch(() => setStatus('Nao foi possivel carregar os municipios da microrregiao.'));

    return () => controller.abort();
  }, [selectedMicroregion]);

  function handleUfChange(uf: string) {
    setSelectedUf(uf);
    setSelectedMicroregion('');
    setSelectedMunicipalityId('');
    setMunicipalities([]);
    setSelectedFeature(null);
    setRows([]);
    setBreaks([]);
    setCurrentLayer(uf ? 'microregions' : 'ufs');
  }

  function handleMicroregionChange(microregionId: string) {
    setSelectedMicroregion(microregionId);
    setSelectedMunicipalityId('');
    setSelectedFeature(null);
    setCurrentLayer(microregionId ? 'municipalities' : 'microregions');
  }

  function handleMunicipalityChange(municipalityId: string) {
    setSelectedMunicipalityId(municipalityId);
    setSelectedFeature(null);
    setCurrentLayer(municipalityId ? 'sectors' : 'municipalities');
  }

  function handleLayerChange(layer: TerritorialLayer) {
    setCurrentLayer(layer);
    setSelectedFeature(null);

    if (layer === 'ufs') {
      setSelectedUf('');
      setSelectedMicroregion('');
      setSelectedMunicipalityId('');
    }

    if (layer !== 'sectors') {
      setSelectedMunicipalityId('');
    }
  }

  function handleMunicipalitySelect(municipalityId: string) {
    setSelectedMunicipalityId(municipalityId);
    setCurrentLayer('sectors');
  }

  function handleBack() {
    if (currentLayer === 'sectors') {
      setSelectedMunicipalityId('');
      setCurrentLayer('municipalities');
    } else if (currentLayer === 'municipalities' && selectedMicroregion) {
      setSelectedMicroregion('');
      setCurrentLayer('microregions');
    } else if (currentLayer === 'municipalities' || currentLayer === 'microregions') {
      handleLayerChange('ufs');
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header>
          <span className="eyebrow">GeoBrasil Portfolio</span>
          <h1>Censo e territorio</h1>
          <p>WebGIS estatico publicado com assets FlatGeobuf carregados conforme a selecao.</p>
        </header>

        <LayerControl
          ufs={ufs}
          microregions={microregions}
          municipalities={municipalities}
          selectedUf={selectedUf}
          selectedMicroregion={selectedMicroregion}
          selectedMunicipalityId={selectedMunicipalityId}
          currentLayer={currentLayer}
          onUfChange={handleUfChange}
          onMicroregionChange={handleMicroregionChange}
          onMunicipalityChange={handleMunicipalityChange}
          onLayerChange={handleLayerChange}
          onBack={handleBack}
        />

        <IndicatorSelector
          indicators={indicators}
          selectedIndicator={selectedIndicator}
          onIndicatorChange={setSelectedIndicator}
        />

        <SidePanel
          selectedFeature={selectedFeature}
          indicators={indicators}
          selectedIndicator={selectedIndicator}
          breaks={breaks}
          rows={rows}
        />

        <p className="status">{status}</p>
      </aside>

      <MapView
        selectedUf={selectedUf}
        selectedMicroregion={selectedMicroregion}
        selectedMunicipalityId={selectedMunicipalityId}
        currentLayer={currentLayer}
        selectedIndicator={selectedIndicator}
        indicators={indicators}
        onBreaksChange={setBreaks}
        onRowsChange={setRows}
        onFeatureSelect={setSelectedFeature}
        onUfSelect={handleUfChange}
        onMicroregionSelect={handleMicroregionChange}
        onMunicipalitySelect={handleMunicipalitySelect}
        onStatusChange={setStatus}
      />
    </main>
  );
}

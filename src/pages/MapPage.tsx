import { useEffect, useState } from 'react';
import { getIndicators, getMicroregionsByState, getMunicipalitiesByMicroregion, getStates } from '../api';
import { DashboardPanel } from '../components/DashboardPanel';
import { IndicatorSelector } from '../components/IndicatorSelector';
import { LayerControl } from '../components/LayerControl';
import { MapView } from '../components/MapView';
import { SidePanel } from '../components/SidePanel';
import type { ChoroplethBreak, ColorScale, Indicator, Microregion, MunicipalityDetails, MunicipalityOption, TerritorialLayer, Uf } from '../types';

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
  const [colorScale, setColorScale] = useState<ColorScale>('blue');
  const [selectedFeature, setSelectedFeature] = useState<MunicipalityDetails | null>(null);
  const [focusedFeatureKey, setFocusedFeatureKey] = useState<string | null>(null);
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
    setFocusedFeatureKey(null);
    setRows([]);
    setBreaks([]);
    setCurrentLayer(uf ? 'microregions' : 'ufs');
  }

  function handleMicroregionChange(microregionId: string) {
    setSelectedMicroregion(microregionId);
    setSelectedMunicipalityId('');
    setSelectedFeature(null);
    setFocusedFeatureKey(null);
    setCurrentLayer(microregionId ? 'municipalities' : 'microregions');
  }

  function handleMunicipalityChange(municipalityId: string) {
    setSelectedMunicipalityId(municipalityId);
    setSelectedFeature(null);
    setFocusedFeatureKey(null);
    setCurrentLayer(municipalityId ? 'sectors' : 'municipalities');
  }

  function handleLayerChange(layer: TerritorialLayer) {
    setCurrentLayer(layer);
    setSelectedFeature(null);
    setFocusedFeatureKey(null);

    if (layer === 'ufs') {
      setSelectedUf('');
      setSelectedMicroregion('');
      setSelectedMunicipalityId('');
    }

    if (layer !== 'sectors') {
      setSelectedMunicipalityId('');
    }
  }

  function handleIndicatorChange(indicatorId: string) {
    setSelectedIndicator(indicatorId);
    setSelectedFeature(null);
    setFocusedFeatureKey(null);
  }

  function handleMunicipalitySelect(municipalityId: string) {
    setSelectedMunicipalityId(municipalityId);
    setFocusedFeatureKey(null);
    setCurrentLayer('sectors');
  }

  function handleBack() {
    if (currentLayer === 'sectors') {
      setSelectedMunicipalityId('');
      setFocusedFeatureKey(null);
      setCurrentLayer('municipalities');
    } else if (currentLayer === 'municipalities' && selectedMicroregion) {
      setSelectedMicroregion('');
      setFocusedFeatureKey(null);
      setCurrentLayer('microregions');
    } else if (currentLayer === 'municipalities' || currentLayer === 'microregions') {
      handleLayerChange('ufs');
    }
  }

  function handleFeatureSelect(feature: MunicipalityDetails | null) {
    setSelectedFeature(feature);
    setFocusedFeatureKey(null);
  }

  function handleDashboardRowSelect(row: MunicipalityDetails) {
    setSelectedFeature(row);
    setFocusedFeatureKey(featureKey(row));
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
          onIndicatorChange={handleIndicatorChange}
        />

        <SidePanel
          selectedFeature={selectedFeature}
          indicators={indicators}
          selectedIndicator={selectedIndicator}
        />

        <p className="status">{status}</p>
      </aside>

      <section className="main-content">
        <MapView
          selectedUf={selectedUf}
          selectedMicroregion={selectedMicroregion}
          selectedMunicipalityId={selectedMunicipalityId}
          currentLayer={currentLayer}
          selectedIndicator={selectedIndicator}
          colorScale={colorScale}
          indicators={indicators}
          breaks={breaks}
          focusedFeatureKey={focusedFeatureKey}
          onBreaksChange={setBreaks}
          onRowsChange={setRows}
          onFeatureSelect={handleFeatureSelect}
          onUfSelect={handleUfChange}
          onMicroregionSelect={handleMicroregionChange}
          onMunicipalitySelect={handleMunicipalitySelect}
          onStatusChange={setStatus}
          onColorScaleChange={setColorScale}
        />

        <DashboardPanel
          rows={rows}
          indicators={indicators}
          selectedIndicator={selectedIndicator}
          selectedFeature={selectedFeature}
          onRowSelect={handleDashboardRowSelect}
        />
      </section>
    </main>
  );
}

function featureKey(feature: MunicipalityDetails) {
  return `${feature.layer}-${feature.id}`;
}

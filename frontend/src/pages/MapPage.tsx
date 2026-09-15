import { useEffect, useState } from 'react';
import { getIndicators, getMicroregionsByState, getStates } from '../api';
import { DashboardCharts } from '../components/DashboardCharts';
import { DataTable } from '../components/DataTable';
import { IndicatorSelector } from '../components/IndicatorSelector';
import { LayerControl } from '../components/LayerControl';
import { MapView } from '../components/MapView';
import { SidePanel } from '../components/SidePanel';
import type { ChoroplethBreak, DashboardRow, Indicator, Microregion, TerritorialLayer, Uf } from '../types';

export function MapPage() {
  const [ufs, setUfs] = useState<Uf[]>([]);
  const [microregions, setMicroregions] = useState<Microregion[]>([]);
  const [municipalities, setMunicipalities] = useState<DashboardRow[]>([]);
  const [rows, setRows] = useState<DashboardRow[]>([]);
  const [selectedUf, setSelectedUf] = useState('');
  const [selectedMicroregion, setSelectedMicroregion] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [currentLayer, setCurrentLayer] = useState<TerritorialLayer>('states');
  const [selectedFeature, setSelectedFeature] = useState<DashboardRow | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('population');
  const [breaks, setBreaks] = useState<ChoroplethBreak[]>([]);
  const [status, setStatus] = useState('Visualizacao inicial: UFs do Brasil.');

  useEffect(() => {
    getStates()
      .then(setUfs)
      .catch(() => setStatus('Nao foi possivel carregar a lista de UFs.'));

    getIndicators()
      .then(setIndicators)
      .catch(() => setStatus('Nao foi possivel carregar a lista de indicadores.'));
  }, []);

  useEffect(() => {
    if (!selectedUf) {
      setMicroregions([]);
      return;
    }

    getMicroregionsByState(selectedUf, selectedIndicator)
      .then((geojson) => {
        setMicroregions(
          geojson.features.map((feature) => ({
            id: String(feature.properties?.id ?? ''),
            name: String(feature.properties?.name ?? ''),
            uf: String(feature.properties?.uf ?? selectedUf),
          })),
        );
      })
      .catch(() => setStatus('Nao foi possivel carregar microrregioes da UF.'));
  }, [selectedUf, selectedIndicator]);

  function handleUfChange(uf: string) {
    setSelectedUf(uf);
    setSelectedMicroregion('');
    setSelectedMunicipality('');
    setSelectedSector('');
    setSelectedFeature(null);
    setMunicipalities([]);
    setRows([]);
    setBreaks([]);
    setCurrentLayer(uf ? 'municipalities' : 'states');
  }

  function handleMicroregionChange(microregion: string) {
    setSelectedMicroregion(microregion);
    setSelectedMunicipality('');
    setSelectedSector('');
    setSelectedFeature(null);
    setRows([]);
    setBreaks([]);
    setCurrentLayer(microregion ? 'municipalities' : 'microregions');
  }

  function handleMunicipalityChange(municipality: string) {
    setSelectedMunicipality(municipality);
    setSelectedSector('');
    setSelectedFeature(rows.find((row) => row.id === municipality) ?? null);
  }

  function handleLayerChange(layer: TerritorialLayer) {
    if (layer === 'states') {
      handleUfChange('');
      return;
    }
    setCurrentLayer(layer);
  }

  function handleBack() {
    if (currentLayer === 'sectors') {
      setSelectedSector('');
      setSelectedFeature(null);
      setCurrentLayer('municipalities');
      return;
    }
    if (currentLayer === 'municipalities' && selectedMicroregion) {
      setSelectedMicroregion('');
      setSelectedFeature(null);
      setCurrentLayer('microregions');
      return;
    }
    if (currentLayer === 'municipalities' || currentLayer === 'microregions') {
      handleUfChange('');
    }
  }

  const selectedUfName = ufs.find((uf) => uf.code === selectedUf)?.name;
  const currentLayerLabel = {
    states: 'UFs',
    microregions: 'Microrregioes',
    municipalities: 'Municipios',
    sectors: 'Setores censitarios',
  }[currentLayer];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header>
          <span className="eyebrow">GeoBrasil MVP</span>
          <h1>Censo e territorio</h1>
          <p>Explore dados do Censo 2022 respeitando a hierarquia territorial.</p>
        </header>

        <LayerControl
          ufs={ufs}
          microregions={microregions}
          municipalities={municipalities}
          currentLayer={currentLayer}
          selectedUf={selectedUf}
          selectedMicroregion={selectedMicroregion}
          selectedMunicipality={selectedMunicipality}
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
          selectedUfName={selectedUfName}
          currentLayer={currentLayerLabel}
          indicators={indicators}
          selectedIndicator={selectedIndicator}
          breaks={breaks}
        />

        <p className="status">{status}</p>
      </aside>

      <section className="workspace">
        <MapView
          currentLayer={currentLayer}
          selectedUf={selectedUf}
          selectedMicroregion={selectedMicroregion}
          selectedMunicipality={selectedMunicipality}
          selectedIndicator={selectedIndicator}
          indicators={indicators}
          onBreaksChange={setBreaks}
          onRowsChange={(nextRows) => {
            setRows(nextRows);
            if (currentLayer === 'municipalities') {
              setMunicipalities(nextRows);
            }
          }}
          onFeatureSelect={setSelectedFeature}
          onUfSelect={handleUfChange}
          onMunicipalitySelect={setSelectedMunicipality}
          onSectorSelect={setSelectedSector}
          onLayerChange={setCurrentLayer}
          onMicroregionSelect={handleMicroregionChange}
          onStatusChange={setStatus}
        />

        <div className="dashboard-area">
          <DashboardCharts rows={rows} indicators={indicators} selectedIndicator={selectedIndicator} />
          <DataTable rows={rows} indicators={indicators} />
        </div>
      </section>
    </main>
  );
}

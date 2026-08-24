import { useEffect, useState } from 'react';
import { getIndicators, getStates } from '../api';
import { IndicatorSelector } from '../components/IndicatorSelector';
import { LayerControl } from '../components/LayerControl';
import { MapView } from '../components/MapView';
import { SidePanel } from '../components/SidePanel';
import type { ChoroplethBreak, Indicator, MunicipalityDetails, Uf } from '../types';

export function MapPage() {
  const [ufs, setUfs] = useState<Uf[]>([]);
  const [selectedUf, setSelectedUf] = useState('');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('population');
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityDetails | null>(null);
  const [breaks, setBreaks] = useState<ChoroplethBreak[]>([]);
  const [status, setStatus] = useState('Selecione uma UF para carregar os municipios.');

  useEffect(() => {
    getStates()
      .then(setUfs)
      .catch(() => setStatus('Nao foi possivel carregar a lista de UFs.'));

    getIndicators()
      .then(setIndicators)
      .catch(() => setStatus('Nao foi possivel carregar a lista de indicadores.'));
  }, []);

  function handleUfChange(uf: string) {
    setSelectedUf(uf);
    setSelectedMunicipality(null);
    setBreaks([]);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header>
          <span className="eyebrow">GeoBrasil MVP</span>
          <h1>Censo e territorio</h1>
          <p>Selecione uma UF para carregar apenas os municipios necessarios.</p>
        </header>

        <LayerControl ufs={ufs} selectedUf={selectedUf} onUfChange={handleUfChange} />

        <IndicatorSelector
          indicators={indicators}
          selectedIndicator={selectedIndicator}
          onIndicatorChange={setSelectedIndicator}
        />

        <SidePanel
          municipality={selectedMunicipality}
          indicators={indicators}
          selectedIndicator={selectedIndicator}
          breaks={breaks}
        />

        <p className="status">{status}</p>
      </aside>

      <MapView
        selectedUf={selectedUf}
        selectedIndicator={selectedIndicator}
        indicators={indicators}
        onBreaksChange={setBreaks}
        onMunicipalitySelect={setSelectedMunicipality}
        onStatusChange={setStatus}
      />
    </main>
  );
}

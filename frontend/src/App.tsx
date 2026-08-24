import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { GeoJSONSource, Map, MapLayerMouseEvent, Popup } from 'maplibre-gl';

type Uf = {
  code: string;
  name: string;
};

type Indicator = {
  id: string;
  name: string;
  unit: string;
};

type MunicipalityDetails = {
  id: string;
  name: string;
  uf: string;
  indicators: Record<string, number>;
};

type ChoroplethBreak = {
  min: number;
  max: number;
  color: string;
};

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const emptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
} as GeoJSON.FeatureCollection;

const colorRamp = ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'];

export function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [ufs, setUfs] = useState<Uf[]>([]);
  const [selectedUf, setSelectedUf] = useState('');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('population');
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityDetails | null>(null);
  const [breaks, setBreaks] = useState<ChoroplethBreak[]>([]);
  const [status, setStatus] = useState('Selecione uma UF para carregar os municipios.');

  useEffect(() => {
    fetch(`${apiUrl}/states`)
      .then((response) => response.json())
      .then(setUfs)
      .catch(() => setStatus('Nao foi possivel carregar a lista de UFs.'));

    fetch(`${apiUrl}/indicators`)
      .then((response) => response.json())
      .then(setIndicators)
      .catch(() => setStatus('Nao foi possivel carregar a lista de indicadores.'));
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [-53.2, -10.3],
      zoom: 3.5,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      map.addSource('states', { type: 'geojson', data: emptyFeatureCollection });
      map.addLayer({
        id: 'states-fill',
        type: 'fill',
        source: 'states',
        paint: {
          'fill-color': '#f8fafc',
          'fill-opacity': 0.25,
        },
      });
      map.addLayer({
        id: 'states-line',
        type: 'line',
        source: 'states',
        paint: {
          'line-color': '#1e293b',
          'line-width': 1.4,
        },
      });

      map.addSource('municipalities', { type: 'geojson', data: emptyFeatureCollection });
      map.addLayer({
        id: 'municipalities-fill',
        type: 'fill',
        source: 'municipalities',
        paint: {
          'fill-color': ['coalesce', ['get', 'fillColor'], '#e2e8f0'],
          'fill-opacity': 0.72,
        },
      });
      map.addLayer({
        id: 'municipalities-line',
        type: 'line',
        source: 'municipalities',
        paint: {
          'line-color': '#334155',
          'line-width': 1,
        },
      });

      map.on('click', 'municipalities-fill', handleMunicipalityClick);
      map.on('mouseenter', 'municipalities-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'municipalities-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      fetch(`${apiUrl}/states/geojson`)
        .then((response) => response.json())
        .then((geojson) => {
          const source = map.getSource('states') as GeoJSONSource;
          source.setData(geojson);
        })
        .catch(() => setStatus('Nao foi possivel carregar a camada de estados.'));
    });

    mapRef.current = map;

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedUf) {
      return;
    }

    setStatus('Carregando municipios da UF selecionada...');
    setSelectedMunicipality(null);

    fetch(`${apiUrl}/states/${selectedUf}/municipalities?indicator=${selectedIndicator}`)
      .then((response) => response.json())
      .then((geojson) => {
        const source = map.getSource('municipalities') as GeoJSONSource;
        source.setData(geojson);
        setBreaks(geojson.metadata?.breaks ?? []);
        setStatus('Municipios carregados. Clique em um municipio para ver os indicadores.');

        if (geojson.metadata?.bbox) {
          map.fitBounds(geojson.metadata.bbox, { padding: 48, duration: 700 });
        }
      })
      .catch(() => setStatus('Nao foi possivel carregar os municipios da UF.'));
  }, [selectedUf, selectedIndicator]);

  function handleMunicipalityClick(event: MapLayerMouseEvent) {
    const feature = event.features?.[0];
    const municipalityId = feature?.properties?.id;

    if (!municipalityId) {
      return;
    }

    fetch(`${apiUrl}/municipalities/${municipalityId}`)
      .then((response) => response.json())
      .then((municipality) => {
        setSelectedMunicipality(municipality);
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup()
          .setLngLat(event.lngLat)
          .setHTML(
            `<strong>${municipality.name}</strong><br />UF: ${municipality.uf}<br />${selectedIndicatorLabel()}: ${formatValue(
              municipality.indicators[selectedIndicator],
            )}`,
          )
          .addTo(mapRef.current as Map);
      })
      .catch(() => setStatus('Nao foi possivel consultar o municipio.'));
  }

  function selectedIndicatorLabel() {
    return indicators.find((indicator) => indicator.id === selectedIndicator)?.name ?? 'Indicador';
  }

  function selectedIndicatorUnit() {
    return indicators.find((indicator) => indicator.id === selectedIndicator)?.unit ?? '';
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header>
          <span className="eyebrow">GeoBrasil MVP</span>
          <h1>Censo e territorio</h1>
          <p>Selecione uma UF para carregar apenas os municipios necessarios.</p>
        </header>

        <label>
          UF
          <select value={selectedUf} onChange={(event) => setSelectedUf(event.target.value)}>
            <option value="">Selecione</option>
            {ufs.map((uf) => (
              <option key={uf.code} value={uf.code}>
                {uf.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Indicador censitario
          <select value={selectedIndicator} onChange={(event) => setSelectedIndicator(event.target.value)}>
            {indicators.map((indicator) => (
              <option key={indicator.id} value={indicator.id}>
                {indicator.name}
              </option>
            ))}
          </select>
        </label>

        <section className="info-card">
          <h2>Municipio selecionado</h2>
          {selectedMunicipality ? (
            <dl>
              <dt>Nome</dt>
              <dd>{selectedMunicipality.name}</dd>
              <dt>UF</dt>
              <dd>{selectedMunicipality.uf}</dd>
              <dt>Codigo IBGE</dt>
              <dd>{selectedMunicipality.id}</dd>
              <dt>{selectedIndicatorLabel()}</dt>
              <dd>
                {formatValue(selectedMunicipality.indicators[selectedIndicator])} {selectedIndicatorUnit()}
              </dd>
            </dl>
          ) : (
            <p>Nenhum municipio selecionado.</p>
          )}
        </section>

        <section className="legend">
          <h2>Legenda</h2>
          {breaks.length > 0 ? (
            breaks.map((item) => (
              <div className="legend-row" key={`${item.min}-${item.max}`}>
                <span style={{ background: item.color }} />
                <small>
                  {formatValue(item.min)} a {formatValue(item.max)}
                </small>
              </div>
            ))
          ) : (
            <p>Selecione uma UF para gerar o coropletico.</p>
          )}
        </section>

        <p className="status">{status}</p>
      </aside>

      <section className="map-area">
        <div ref={mapContainer} className="map" />
      </section>
    </main>
  );
}

function formatValue(value: number | undefined) {
  if (value === undefined || value === null) {
    return 'Sem dado';
  }

  return new Intl.NumberFormat('pt-BR').format(value);
}

export { colorRamp };

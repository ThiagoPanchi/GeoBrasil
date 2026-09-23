import { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import L from 'leaflet';
import {
  getMicroregionsGeojsonByState,
  getMunicipalitiesByState,
  getSectorsByMunicipality,
  getStatesGeojson,
} from '../api';
import type { ChoroplethBreak, ColorScale, Indicator, MunicipalityDetails, MunicipalityFeatureCollection, TerritorialLayer } from '../types';
import { MunicipalityPopup } from './MunicipalityPopup';
import { formatValue } from '../utils/format';

type MapViewProps = {
  selectedUf: string;
  selectedMicroregion: string;
  selectedMunicipalityId: string;
  currentLayer: TerritorialLayer;
  selectedIndicator: string;
  colorScale: ColorScale;
  indicators: Indicator[];
  breaks: ChoroplethBreak[];
  focusedFeatureKey: string | null;
  onBreaksChange: (breaks: ChoroplethBreak[]) => void;
  onRowsChange: (rows: MunicipalityDetails[]) => void;
  onFeatureSelect: (feature: MunicipalityDetails | null) => void;
  onUfSelect: (uf: string) => void;
  onMicroregionSelect: (microregionId: string) => void;
  onMunicipalitySelect: (municipalityId: string) => void;
  onStatusChange: (status: string) => void;
  onColorScaleChange: (colorScale: ColorScale) => void;
};

const colorScaleOptions: Array<{ id: ColorScale; label: string; colors: string[] }> = [
  { id: 'blue', label: 'Azul', colors: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'] },
  { id: 'red', label: 'Vermelho', colors: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'] },
  { id: 'green', label: 'Verde', colors: ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'] },
  { id: 'semaforica', label: 'Semaforica', colors: ['#1a9850', '#91cf60', '#fee08b', '#fc8d59', '#d73027'] },
];

export function MapView({
  selectedUf,
  selectedMicroregion,
  selectedMunicipalityId,
  currentLayer,
  selectedIndicator,
  colorScale,
  indicators,
  breaks,
  focusedFeatureKey,
  onBreaksChange,
  onRowsChange,
  onFeatureSelect,
  onUfSelect,
  onMicroregionSelect,
  onMunicipalitySelect,
  onStatusChange,
  onColorScaleChange,
}: MapViewProps) {
  const selectedIndicatorName = indicators.find((item) => item.id === selectedIndicator)?.name ?? 'Indicador selecionado';
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const activeRequestRef = useRef(0);
  const indicatorsRef = useRef(indicators);
  const infoModeRef = useRef(false);
  const featureByKeyRef = useRef(new Map<string, GeoJSON.Feature>());
  const loadedContextRef = useRef('');
  const [mapReady, setMapReady] = useState(false);
  const [scaleEditorOpen, setScaleEditorOpen] = useState(false);
  const [infoMode, setInfoMode] = useState(false);

  useEffect(() => {
    indicatorsRef.current = indicators;
  }, [indicators]);

  useEffect(() => {
    infoModeRef.current = infoMode;
  }, [infoMode]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) {
      return;
    }

    const map = L.map(mapContainer.current, { preferCanvas: true }).setView([-10.3, -53.2], 4);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    map.createPane('territorial-overlay');
    const overlayPane = map.getPane('territorial-overlay');
    if (overlayPane) {
      overlayPane.style.zIndex = '450';
    }
    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setMapReady(true);
    const resizeHandle = window.setTimeout(() => {
      map.invalidateSize();
      map.setView([-10.3, -53.2], 4);
    }, 0);

    return () => {
      window.clearTimeout(resizeHandle);
      popupRootRef.current?.unmount();
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;
    const controller = new AbortController();

    async function loadLayer() {
      if (!mapReady || !map || !group) {
        return;
      }

      try {
        const collections = await loadCurrentCollections(controller.signal);

        if (controller.signal.aborted || activeRequestRef.current !== requestId) {
          return;
        }

        group.clearLayers();
        featureByKeyRef.current.clear();
        const renderedLayers = collections.map((collection) => addCollectionToMap(collection, group));
        const primaryCollection = collections[collections.length - 1];
        const rows = collections.flatMap((collection) => collection.metadata?.rows ?? []);
        const contextKey = [selectedUf, selectedMicroregion, selectedMunicipalityId, currentLayer, selectedIndicator].join('|');
        const contextChanged = loadedContextRef.current !== contextKey;
        loadedContextRef.current = contextKey;
        onBreaksChange(primaryCollection.metadata?.breaks ?? []);
        onRowsChange(rows);
        if (contextChanged) {
          onFeatureSelect(null);
        }

        const bounds = renderedLayers.reduce<L.LatLngBounds | null>((current, layer) => {
          const layerBounds = layer.getBounds();
          return current ? current.extend(layerBounds) : layerBounds;
        }, null);

        if (bounds?.isValid()) {
          map.invalidateSize();
          map.fitBounds(bounds.pad(0.08));
        }

        onStatusChange(successMessage(primaryCollection.metadata?.layer ?? currentLayer, rows.length || primaryCollection.features.length));
      } catch (error) {
        if (controller.signal.aborted || activeRequestRef.current !== requestId) {
          return;
        }

        onStatusChange(error instanceof Error ? error.message : 'Nao foi possivel carregar o asset estatico.');
      }
    }

    void loadLayer();

    return () => controller.abort();
  }, [mapReady, selectedUf, selectedMicroregion, selectedMunicipalityId, currentLayer, selectedIndicator, colorScale]);

  useEffect(() => {
    if (!focusedFeatureKey) {
      return;
    }

    const feature = featureByKeyRef.current.get(focusedFeatureKey);
    if (feature) {
      focusFeature(feature);
    }
  }, [focusedFeatureKey]);

  async function loadCurrentCollections(signal: AbortSignal): Promise<MunicipalityFeatureCollection[]> {
    if (!selectedUf || currentLayer === 'ufs') {
      onStatusChange('Carregando UFs a partir de assets estaticos...');
      return [await getStatesGeojson(selectedIndicator, colorScale, signal)];
    }

    if (!selectedMicroregion) {
      onStatusChange('Carregando microrregioes da UF selecionada...');
      return [await getMicroregionsGeojsonByState(selectedUf, selectedIndicator, colorScale, signal)];
    }

    if (currentLayer === 'sectors' && selectedMunicipalityId) {
      onStatusChange('Carregando setores censitarios do municipio selecionado...');
      return [await getSectorsByMunicipality(selectedMunicipalityId, selectedIndicator, colorScale, signal)];
    }

    onStatusChange('Carregando municipios da microrregiao selecionada...');
    return [await getMunicipalitiesByState(selectedUf, selectedIndicator, colorScale, selectedMicroregion, signal)];
  }

  function addCollectionToMap(collection: MunicipalityFeatureCollection, group: L.LayerGroup) {
    const layer = L.geoJSON(collection as GeoJSON.FeatureCollection, {
      pane: 'territorial-overlay',
      style: (feature) => ({
        color: layerColor(collection.metadata?.layer),
        weight: layerWeight(collection.metadata?.layer),
        fillColor: String(feature?.properties?.fillColor ?? fallbackFillColor(collection.metadata?.layer)),
        fillOpacity: layerFillOpacity(collection.metadata?.layer),
      }),
      onEachFeature: (_feature, featureLayer) => {
        const details = detailsFromFeature(_feature);
        if (details) {
          featureByKeyRef.current.set(featureKey(details), _feature);
        }

        featureLayer.on('click', () => handleFeatureClick(_feature));
        featureLayer.on('dblclick', () => handleFeatureDoubleClick(_feature));
      },
    });

    layer.addTo(group);
    layer.bringToFront();
    return layer;
  }

  function handleFeatureClick(feature: GeoJSON.Feature) {
    const details = detailsFromFeature(feature);

    if (!details) {
      return;
    }

    if (infoModeRef.current) {
      openFeaturePopup(feature, details, false, true);
      return;
    }

    onFeatureSelect(details);
    openFeaturePopup(feature, details);
  }

  function focusFeature(feature: GeoJSON.Feature) {
    const details = detailsFromFeature(feature);

    if (!details) {
      return;
    }

    onFeatureSelect(details);
    openFeaturePopup(feature, details, true);
  }

  function openFeaturePopup(feature: GeoJSON.Feature, details: MunicipalityDetails, fit = false, report = false) {
    const map = mapRef.current;
    const bounds = L.geoJSON(feature).getBounds();

    if (!map || !bounds.isValid()) {
      return;
    }

    popupRootRef.current?.unmount();
    const popupContainer = document.createElement('div');
    popupRootRef.current = createRoot(popupContainer);
    popupRootRef.current.render(
      <MunicipalityPopup feature={details} indicators={indicatorsRef.current} selectedIndicator={selectedIndicator} report={report} />,
    );

    if (fit) {
      map.fitBounds(bounds.pad(0.18), { maxZoom: 12 });
    }

    L.popup().setLatLng(bounds.getCenter()).setContent(popupContainer).openOn(map);
  }

  function handleFeatureDoubleClick(feature: GeoJSON.Feature) {
    const details = detailsFromFeature(feature);

    if (!details) {
      return;
    }

    if (details.layer === 'ufs') {
      onUfSelect(details.id);
    } else if (details.layer === 'microregions') {
      onMicroregionSelect(details.id);
    } else if (details.layer === 'municipalities') {
      onMunicipalitySelect(details.id);
    }
  }

  function detailsFromFeature(feature: GeoJSON.Feature): MunicipalityDetails | null {
    const properties = feature.properties;

    if (!properties) {
      return null;
    }

    return {
      id: String(properties.id ?? ''),
      name: String(properties.name ?? ''),
      uf: String(properties.uf ?? ''),
      layer: properties.layer as TerritorialLayer,
      microregionId: String(properties.microregionId ?? ''),
      microregionName: String(properties.microregionName ?? ''),
      indicators: parseIndicators(properties.indicators),
      reportAttributes: parseReportAttributes(properties.reportAttributes),
    };
  }

  return (
    <section className="map-area">
      <div ref={mapContainer} className="map" />
      <aside className="map-tools" aria-label="Ferramentas do mapa">
        <div className={`map-scale-editor${scaleEditorOpen ? ' open' : ''}`}>
          <button
            className={`map-tool-button scale-editor-toggle${scaleEditorOpen ? ' active' : ''}`}
            type="button"
            aria-expanded={scaleEditorOpen}
            aria-label="Editar escala de cores"
            title="Editar escala de cores"
            onClick={() => setScaleEditorOpen((open) => !open)}
          >
            ✏
          </button>
          {scaleEditorOpen ? (
            <div className="scale-selector" role="listbox" aria-label="Escala de cores">
              {colorScaleOptions.map((option) => (
                <button
                  className={`scale-option${colorScale === option.id ? ' active' : ''}`}
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={colorScale === option.id}
                  onClick={() => onColorScaleChange(option.id)}
                >
                  <span>{option.label}</span>
                  <span className="scale-preview" aria-hidden="true">
                    {option.colors.map((color) => (
                      <span key={color} style={{ background: color }} />
                    ))}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button
          className={`map-tool-button info-mode-toggle${infoMode ? ' active' : ''}`}
          type="button"
          aria-pressed={infoMode}
          aria-label="Mostrar relatorio de indicadores ao clicar no mapa"
          title="Mostrar relatorio de indicadores ao clicar no mapa"
          onClick={() => setInfoMode((active) => !active)}
        >
          i
        </button>
      </aside>
      <aside className="map-legend" aria-label="Legenda do mapa">
        <h2>Legenda</h2>
        <p className="legend-indicator">{selectedIndicatorName}</p>
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
          <p>Sem classificacao para a vista atual.</p>
        )}
      </aside>
    </section>
  );
}

function featureKey(feature: MunicipalityDetails) {
  return `${feature.layer}-${feature.id}`;
}

function fallbackFillColor(layer?: TerritorialLayer) {
  return layer === 'ufs' ? '#93c5fd' : '#e2e8f0';
}

function layerColor(layer?: TerritorialLayer) {
  if (layer === 'ufs') {
    return '#0f172a';
  }

  return layer === 'sectors' ? '#475569' : '#1e293b';
}

function layerWeight(layer?: TerritorialLayer) {
  if (layer === 'ufs') {
    return 1.8;
  }

  return layer === 'sectors' ? 0.4 : 1.2;
}

function layerFillOpacity(layer?: TerritorialLayer) {
  if (layer === 'ufs') {
    return 0.5;
  }

  return layer === 'sectors' ? 0.55 : 0.72;
}

function parseIndicators(value: unknown): Record<string, number> {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, number>;
    } catch {
      return {};
    }
  }

  return value && typeof value === 'object' ? (value as Record<string, number>) : {};
}

function parseReportAttributes(value: unknown): Record<string, string | number> | undefined {
  if (typeof value === 'string') {
    try {
      return parseReportAttributes(JSON.parse(value));
    } catch {
      return undefined;
    }
  }

  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const parsed = Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, typeof item === 'number' ? item : String(item ?? '').trim()])
      .filter(([, item]) => item !== '' && item !== 0),
  ) as Record<string, string | number>;

  return Object.keys(parsed).length > 0 ? parsed : undefined;
}

function successMessage(layer: TerritorialLayer, count: number) {
  const labels: Record<TerritorialLayer, string> = {
    ufs: 'UFs carregadas',
    microregions: 'Microrregioes carregadas',
    municipalities: 'Municipios carregados',
    sectors: 'Setores censitarios carregados',
  };

  return `${labels[layer]}: ${count} registros exibidos.`;
}

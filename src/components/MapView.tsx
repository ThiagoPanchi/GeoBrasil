import { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import L from 'leaflet';
import {
  getCnefePointsBySector,
  getMicroregionsGeojsonByState,
  getMunicipalitiesByState,
  getSectorsByMunicipality,
  getStatesGeojson,
} from '../api';
import type { ChoroplethBreak, CnefeAddressFeature, ColorScale, Indicator, MunicipalityDetails, MunicipalityFeatureCollection, TerritorialLayer } from '../types';
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

type CnefeSpeciesFilter = 'all' | string;

type CnefeDisplayPoint = {
  feature: CnefeAddressFeature;
  originalLatLng: L.LatLng;
  displayLatLng: L.LatLng;
  displaced: boolean;
};

const colorScaleOptions: Array<{ id: ColorScale; label: string; colors: string[] }> = [
  { id: 'blue', label: 'Azul', colors: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'] },
  { id: 'red', label: 'Vermelho', colors: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'] },
  { id: 'green', label: 'Verde', colors: ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'] },
  { id: 'semaforica', label: 'Semaforica', colors: ['#1a9850', '#91cf60', '#fee08b', '#fc8d59', '#d73027'] },
];

const cnefeSpeciesStyles = [
  { label: 'Domicílio particular', normalized: 'domicilio particular', color: '#2563eb', shape: '●' },
  { label: 'Domicílio coletivo', normalized: 'domicilio coletivo', color: '#7c3aed', shape: '◆' },
  { label: 'Estabelecimento agropecuário', normalized: 'estabelecimento agropecuario', color: '#16a34a', shape: '■' },
  { label: 'Estabelecimento de ensino', normalized: 'estabelecimento de ensino', color: '#f59e0b', shape: '▲' },
  { label: 'Estabelecimento de saúde', normalized: 'estabelecimento de saude', color: '#dc2626', shape: '✚' },
  { label: 'Estabelecimento de outras finalidades', normalized: 'estabelecimento de outras finalidades', color: '#0891b2', shape: '⬟' },
  { label: 'Edificação em construção ou reforma', normalized: 'edificacao em construcao ou reforma', color: '#64748b', shape: '⬢' },
  { label: 'Estabelecimento religioso', normalized: 'estabelecimento religioso', color: '#9333ea', shape: '✦' },
];

const cnefeSizeClasses = [
  { min: 1, max: 1, label: '1 endereco', size: 18 },
  { min: 2, max: 3, label: '2 a 3', size: 23 },
  { min: 4, max: 7, label: '4 a 7', size: 28 },
  { min: 8, max: 15, label: '8 a 15', size: 34 },
  { min: 16, max: Infinity, label: '16 ou mais', size: 40 },
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
  const cnefeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const activeRequestRef = useRef(0);
  const activeCnefeRequestRef = useRef(0);
  const indicatorsRef = useRef(indicators);
  const infoModeRef = useRef(false);
  const cnefeModeRef = useRef(false);
  const featureByKeyRef = useRef(new Map<string, GeoJSON.Feature>());
  const loadedContextRef = useRef('');
  const [mapReady, setMapReady] = useState(false);
  const [scaleEditorOpen, setScaleEditorOpen] = useState(false);
  const [infoMode, setInfoMode] = useState(false);
  const [cnefeMode, setCnefeMode] = useState(false);
  const [cnefeSpeciesFilter, setCnefeSpeciesFilter] = useState<CnefeSpeciesFilter>('all');
  const [cnefePoints, setCnefePoints] = useState<CnefeAddressFeature[]>([]);
  const [cnefeSectorName, setCnefeSectorName] = useState('');

  useEffect(() => {
    indicatorsRef.current = indicators;
  }, [indicators]);

  useEffect(() => {
    infoModeRef.current = infoMode;
  }, [infoMode]);

  useEffect(() => {
    cnefeModeRef.current = cnefeMode;

    if (!cnefeMode) {
      clearCnefeLayer();
      setCnefeSpeciesFilter('all');
    } else if (currentLayer === 'sectors') {
      onStatusChange('Clique em um setor censitario para exibir pontos CNEFE.');
    }
  }, [cnefeMode, currentLayer]);

  useEffect(() => {
    const map = mapRef.current;
    const group = cnefeLayerGroupRef.current;

    if (!map || !group || !cnefeMode) {
      return;
    }

    const render = () => {
      const filteredPoints = filterCnefePointsBySpecies(cnefePoints, cnefeSpeciesFilter);
      renderCnefePoints(filteredPoints, group, map);

      if (cnefePoints.length === 0) {
        return;
      }

      onStatusChange(cnefeStatusMessage(cnefePoints.length, filteredPoints.length, cnefeSpeciesFilter, cnefeSectorName));
    };

    render();
    map.on('zoomend', render);

    return () => {
      map.off('zoomend', render);
    };
  }, [cnefeMode, cnefePoints, cnefeSpeciesFilter, cnefeSectorName]);

  useEffect(() => {
    clearCnefeLayer();
    activeCnefeRequestRef.current += 1;
  }, [selectedUf, selectedMicroregion, selectedMunicipalityId, currentLayer]);

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
    cnefeLayerGroupRef.current = L.layerGroup().addTo(map);
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
      cnefeLayerGroupRef.current = null;
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

    if (cnefeModeRef.current && details.layer === 'sectors') {
      void loadCnefeForSector(details);
    }

    if (infoModeRef.current) {
      openFeaturePopup(feature, details, false, true);
      return;
    }

    onFeatureSelect(details);
    openFeaturePopup(feature, details);
  }

  async function loadCnefeForSector(details: MunicipalityDetails) {
    const map = mapRef.current;
    const group = cnefeLayerGroupRef.current;
    const municipalityId = details.id.slice(0, 7);
    const requestId = activeCnefeRequestRef.current + 1;
    activeCnefeRequestRef.current = requestId;

    if (!map || !group || !municipalityId) {
      return;
    }

    group.clearLayers();
    onStatusChange('Carregando pontos CNEFE do setor selecionado...');

    try {
      const points = await getCnefePointsBySector(municipalityId, details.id);

      if (activeCnefeRequestRef.current !== requestId || !cnefeModeRef.current) {
        return;
      }

      setCnefePoints(points);
      setCnefeSectorName(details.name || details.id);
      if (points.length === 0) {
        group.clearLayers();
        onStatusChange('Nenhum ponto CNEFE encontrado para o setor selecionado.');
      }
    } catch (error) {
      if (activeCnefeRequestRef.current !== requestId || !cnefeModeRef.current) {
        return;
      }

      group.clearLayers();
      onStatusChange(error instanceof Error ? error.message : 'Nao foi possivel carregar pontos CNEFE.');
    }
  }

  function renderCnefePoints(points: CnefeAddressFeature[], group: L.LayerGroup, map: L.Map) {
    group.clearLayers();

    for (const point of layoutCnefeDisplayPoints(points, map)) {
      if (point.displaced) {
        L.polyline([point.originalLatLng, point.displayLatLng], {
          className: 'cnefe-connector',
          color: '#334155',
          opacity: 0.38,
          weight: 1,
          interactive: false,
        }).addTo(group);
      }

      const marker = L.marker(point.displayLatLng, { icon: cnefeIcon(point.feature) });
      marker.bindPopup(cnefePopupHtml(point.feature));
      marker.addTo(group);
    }
  }

  function clearCnefeLayer() {
    cnefeLayerGroupRef.current?.clearLayers();
    setCnefePoints([]);
    setCnefeSectorName('');
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
          className={`map-tool-button cnefe-mode-toggle${cnefeMode ? ' active' : ''}`}
          type="button"
          aria-pressed={cnefeMode}
          aria-label="Mostrar CNEFE ao clicar em setores censitarios"
          title="Mostrar CNEFE ao clicar em setores censitarios"
          onClick={() => setCnefeMode((active) => !active)}
        >
          C
        </button>
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
        {cnefeMode ? (
          <div className="cnefe-legend" aria-label="Legenda CNEFE">
            <h3>CNEFE</h3>
            <label className="cnefe-filter">
              Filtrar especie
              <select
                aria-label="Filtrar CNEFE por especie do endereco"
                value={cnefeSpeciesFilter}
                onChange={(event) => setCnefeSpeciesFilter(event.target.value)}
              >
                <option value="all">Todas as especies</option>
                {cnefeSpeciesStyles.map((item) => (
                  <option key={item.normalized} value={item.normalized}>{item.label}</option>
                ))}
              </select>
            </label>
            {cnefeSpeciesFilter !== 'all' ? (
              <small className="cnefe-filter-status">Filtro ativo: {cnefeFilterLabel(cnefeSpeciesFilter)}</small>
            ) : null}
            <p>Especie do endereco</p>
            {cnefeSpeciesStyles.map((item) => (
              <div className="cnefe-legend-row" key={item.label}>
                <span className="cnefe-legend-symbol" style={{ color: item.color }}>{item.shape}</span>
                <small>{item.label}</small>
              </div>
            ))}
            <p>Quantidade</p>
            {cnefeSizeClasses.map((item) => (
              <div className="cnefe-size-row" key={item.label}>
                <span style={{ width: item.size / 2, height: item.size / 2 }} />
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        ) : null}
      </aside>
      <aside className="map-attribution-card" aria-label="Informacoes de contato e fontes">
        <strong>Criado por Thiago Panchiniak</strong>
        <a href="https://www.linkedin.com/in/thiago-panchiniak-65b63055/" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="mailto:panchiniak@gmail.com">panchiniak@gmail.com</a>
        <span>Fontes: IBGE, Censo 2022.</span>
      </aside>
    </section>
  );
}

function cnefeIcon(feature: CnefeAddressFeature) {
  const style = cnefeSpeciesStyle(feature.properties.ESPECIE_ENDERECO);
  const size = cnefeIconSize(feature.properties.QUANTIDADE);

  return L.divIcon({
    className: 'cnefe-marker',
    html: `<span style="--cnefe-color: ${style.color}; --cnefe-size: ${size}px">${style.shape}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function cnefePopupHtml(feature: CnefeAddressFeature) {
  const props = feature.properties;
  const title = escapeHtml(props.ESPECIE_ENDERECO || 'CNEFE');
  const address = escapeHtml(String(props.ENDERECO_COMPLETO ?? 'Endereco nao informado'));
  const establishment = escapeHtml(String(props.DSC_ESTABELECIMENTO ?? ''));

  return `
    <div class="cnefe-popup">
      <strong>${title}</strong>
      <span>${address}</span>
      ${establishment ? `<small>${establishment}</small>` : ''}
      <small>Quantidade: ${props.QUANTIDADE}</small>
    </div>
  `;
}

function cnefeSpeciesStyle(value: string) {
  const normalized = normalizeLabel(value);
  return cnefeSpeciesStyles.find((item) => item.normalized === normalized) ?? { label: value, normalized, color: '#0f172a', shape: '●' };
}

function filterCnefePointsBySpecies(points: CnefeAddressFeature[], filter: CnefeSpeciesFilter) {
  if (filter === 'all') {
    return points;
  }

  return points.filter((point) => normalizeLabel(point.properties.ESPECIE_ENDERECO) === filter);
}

function layoutCnefeDisplayPoints(points: CnefeAddressFeature[], map: L.Map): CnefeDisplayPoint[] {
  const groups = new Map<string, CnefeAddressFeature[]>();

  for (const point of points) {
    groups.set(cnefeCoordinateKey(point), [...(groups.get(cnefeCoordinateKey(point)) ?? []), point]);
  }

  return Array.from(groups.values()).flatMap((group) => layoutCnefeCoordinateGroup(group, map));
}

function layoutCnefeCoordinateGroup(points: CnefeAddressFeature[], map: L.Map): CnefeDisplayPoint[] {
  const [lng, lat] = points[0].geometry.coordinates;
  const originalLatLng = L.latLng(lat, lng);

  if (points.length === 1) {
    return [{ feature: points[0], originalLatLng, displayLatLng: originalLatLng, displaced: false }];
  }

  const center = map.latLngToLayerPoint(originalLatLng);
  const radius = Math.min(42, 18 + points.length * 2);
  const startAngle = -Math.PI / 2;

  return points.map((feature, index) => {
    const angle = startAngle + (index * 2 * Math.PI) / points.length;
    const displayPoint = L.point(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);

    return {
      feature,
      originalLatLng,
      displayLatLng: map.layerPointToLatLng(displayPoint),
      displaced: true,
    };
  });
}

function cnefeCoordinateKey(feature: CnefeAddressFeature) {
  const [lng, lat] = feature.geometry.coordinates;
  return `${lng}|${lat}`;
}

function cnefeStatusMessage(totalCount: number, filteredCount: number, filter: CnefeSpeciesFilter, sectorName: string) {
  const sectorSuffix = sectorName ? ` para ${sectorName}` : '';

  if (filter === 'all') {
    return `Pontos CNEFE exibidos${sectorSuffix}: ${totalCount} registros agregados.`;
  }

  const label = cnefeFilterLabel(filter);

  return filteredCount > 0
    ? `Pontos CNEFE exibidos${sectorSuffix}: ${filteredCount} de ${totalCount} registros agregados (${label}).`
    : `Nenhum ponto CNEFE corresponde ao filtro ${label}${sectorSuffix}.`;
}

function cnefeFilterLabel(filter: CnefeSpeciesFilter) {
  if (filter === 'all') {
    return 'Todas as especies';
  }

  return cnefeSpeciesStyles.find((item) => item.normalized === filter)?.label ?? filter;
}

function cnefeIconSize(value: number) {
  const quantidade = Number.isFinite(value) ? Math.max(1, value) : 1;
  return cnefeSizeClasses.find((item) => quantidade >= item.min && quantidade <= item.max)?.size ?? cnefeSizeClasses[cnefeSizeClasses.length - 1].size;
}

function normalizeLabel(value: string) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char] ?? char));
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

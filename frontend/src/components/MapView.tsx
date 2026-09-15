import { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import L, { GeoJSON as LeafletGeoJSON, LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import {
  getMicroregionsByState,
  getMunicipalitiesByMicroregion,
  getMunicipalitiesByState,
  getSectorsByMunicipality,
  getStatesGeojson,
} from '../api';
import type { ChoroplethBreak, DashboardRow, Indicator, TerritorialFeatureCollection, TerritorialLayer } from '../types';
import { MunicipalityPopup } from './MunicipalityPopup';

type MapViewProps = {
  currentLayer: TerritorialLayer;
  selectedUf: string;
  selectedMicroregion: string;
  selectedMunicipality: string;
  selectedIndicator: string;
  indicators: Indicator[];
  onBreaksChange: (breaks: ChoroplethBreak[]) => void;
  onRowsChange: (rows: DashboardRow[]) => void;
  onFeatureSelect: (feature: DashboardRow | null) => void;
  onUfSelect: (uf: string) => void;
  onMunicipalitySelect: (municipality: string) => void;
  onSectorSelect: (sector: string) => void;
  onLayerChange: (layer: TerritorialLayer) => void;
  onMicroregionSelect: (microregion: string) => void;
  onStatusChange: (status: string) => void;
};

const INITIAL_CENTER: [number, number] = [-14, -54];
const INITIAL_ZOOM = 4;
const TERRITORIAL_PANE = 'territorial-pane';

export function MapView({
  currentLayer,
  selectedUf,
  selectedMicroregion,
  selectedMunicipality,
  selectedIndicator,
  indicators,
  onBreaksChange,
  onRowsChange,
  onFeatureSelect,
  onUfSelect,
  onMunicipalitySelect,
  onSectorSelect,
  onLayerChange,
  onMicroregionSelect,
  onStatusChange,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LeafletGeoJSON | null>(null);
  const selectedLayerRef = useRef<L.Path | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const loadIdRef = useRef(0);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) {
      return;
    }

    const map = L.map(mapContainer.current, {
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      zoomControl: true,
    });

    map.createPane(TERRITORIAL_PANE);
    const territorialPane = map.getPane(TERRITORIAL_PANE);
    if (territorialPane) {
      territorialPane.style.zIndex = '450';
    }

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      popupRootRef.current?.unmount();
      layerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    selectedLayerRef.current = null;
    onFeatureSelect(null);
    popupRootRef.current?.unmount();
    popupRootRef.current = null;
    map.closePopup();
    layerRef.current?.remove();
    layerRef.current = null;
    const loadId = ++loadIdRef.current;

    if (currentLayer === 'states') {
      onStatusChange('Carregando UFs do Brasil...');
      getStatesGeojson(selectedIndicator)
        .then((geojson) => {
          if (loadId !== loadIdRef.current) {
            return;
          }
          layerRef.current = createGeoJsonLayer(geojson, currentLayer).addTo(map);
          layerRef.current.bringToFront();
          onRowsChange(toRows(geojson));
          onBreaksChange(geojson.metadata?.breaks ?? []);
          map.invalidateSize();
          window.setTimeout(() => {
            if (layerRef.current) {
              fitLayer(map, layerRef.current, geojson.metadata?.bbox);
              layerRef.current.bringToFront();
            }
          }, 0);
          window.setTimeout(() => {
            if (layerRef.current && currentLayer === 'states') {
              map.invalidateSize();
              fitLayer(map, layerRef.current, geojson.metadata?.bbox);
              layerRef.current.bringToFront();
            }
          }, 300);
          window.setTimeout(() => {
            if (layerRef.current && currentLayer === 'states') {
              map.invalidateSize();
              fitLayer(map, layerRef.current, geojson.metadata?.bbox);
              layerRef.current.bringToFront();
            }
          }, 1000);
          onStatusChange(`${geojson.features.length} UFs carregadas com valores por UF.`);
        })
        .catch(() => onStatusChange('Nao foi possivel carregar a camada de estados e valores por UF.'));
      return;
    }

    if (currentLayer === 'microregions' && selectedUf) {
      loadLayer('Carregando microrregioes da UF selecionada...', () => getMicroregionsByState(selectedUf, selectedIndicator), 'microregions');
      return;
    }

    if (currentLayer === 'municipalities' && selectedUf) {
      const request = selectedMicroregion
        ? () => getMunicipalitiesByMicroregion(selectedMicroregion, selectedIndicator)
        : () => getMunicipalitiesByState(selectedUf, selectedIndicator);
      loadLayer('Carregando municipios...', request, 'municipalities');
      return;
    }

    if (currentLayer === 'sectors' && selectedMunicipality) {
      loadLayer('Carregando setores censitarios...', () => getSectorsByMunicipality(selectedMunicipality, selectedIndicator), 'sectors');
    }
  }, [currentLayer, selectedUf, selectedMicroregion, selectedMunicipality, selectedIndicator]);

  function loadLayer(message: string, request: () => Promise<TerritorialFeatureCollection>, layer: TerritorialLayer) {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    onStatusChange(message);
    const loadId = loadIdRef.current;
    request()
      .then((geojson) => {
        if (loadId !== loadIdRef.current) {
          return;
        }
        layerRef.current = createGeoJsonLayer(geojson, layer).addTo(map);
        layerRef.current.bringToFront();
        onBreaksChange(geojson.metadata?.breaks ?? []);
        onRowsChange(toRows(geojson));
        map.invalidateSize();
        fitLayer(map, layerRef.current, geojson.metadata?.bbox);
        onStatusChange(`${geojson.features.length} registros carregados.`);
      })
      .catch(() => onStatusChange('Nao foi possivel carregar os dados territoriais.'));
  }

  function createGeoJsonLayer(geojson: GeoJSON.FeatureCollection, layer: TerritorialLayer) {
    return L.geoJSON(geojson, {
      pane: TERRITORIAL_PANE,
      renderer: L.svg({ padding: 0.5 }),
      style: (feature) => styleFeature(feature, layer),
      onEachFeature: (feature, leafletLayer) => {
        leafletLayer.on('click', (event: LeafletMouseEvent) => handleFeatureClick(event, feature, leafletLayer as L.Path, layer));
        leafletLayer.on('dblclick', () => handleFeatureDoubleClick(feature, layer));
      },
    });
  }

  function handleFeatureClick(event: LeafletMouseEvent, feature: GeoJSON.Feature, leafletLayer: L.Path, layer: TerritorialLayer) {
    const row = toRow(feature);
    if (!row) {
      return;
    }

    selectedLayerRef.current?.setStyle(styleFeature(selectedLayerRef.current.feature, layer));
    leafletLayer.setStyle({ weight: 4, color: '#0f172a', fillOpacity: 0.78 });
    selectedLayerRef.current = leafletLayer;

    if (layer === 'municipalities') {
      onMunicipalitySelect(row.id);
    }
    if (layer === 'sectors') {
      onSectorSelect(row.id);
    }

    onFeatureSelect(row);
    showPopup(event.latlng, row);
  }

  function handleFeatureDoubleClick(feature: GeoJSON.Feature, layer: TerritorialLayer) {
    const featureId = String(feature.properties?.id ?? '');
    if (!featureId) {
      return;
    }

    if (layer === 'microregions') {
      onMicroregionSelect(featureId);
      onLayerChange('municipalities');
      return;
    }

    if (layer === 'states') {
      onUfSelect(featureId);
      return;
    }

    if (layer === 'municipalities') {
      onMunicipalitySelect(featureId);
      onLayerChange('sectors');
    }
  }

  function showPopup(latlng: L.LatLng, row: DashboardRow) {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const popupContainer = document.createElement('div');
    popupRootRef.current?.unmount();
    popupRootRef.current = createRoot(popupContainer);
    popupRootRef.current.render(
      <MunicipalityPopup municipality={{ ...row, uf: row.uf ?? '', indicators: row.indicators }} indicators={indicators} selectedIndicator={selectedIndicator} />,
    );

    L.popup({ className: 'territory-popup', maxWidth: 420, minWidth: 260 })
      .setLatLng(latlng)
      .setContent(popupContainer)
      .openOn(map);
  }

  return (
    <section className="map-area">
      <div ref={mapContainer} className="map" />
    </section>
  );
}

function styleFeature(feature: GeoJSON.Feature | undefined, layer: TerritorialLayer): L.PathOptions {
  const fillColor = String(feature?.properties?.fillColor ?? fallbackColor(layer));
  return {
    color: layer === 'states' ? '#0f172a' : '#334155',
    weight: layer === 'states' ? 2.5 : 1,
    fillColor,
    fillOpacity: layer === 'states' ? 0.75 : 0.58,
  };
}

function fallbackColor(layer: TerritorialLayer) {
  if (layer === 'microregions') {
    return '#60a5fa';
  }
  if (layer === 'municipalities') {
    return '#f97316';
  }
  if (layer === 'sectors') {
    return '#fef3c7';
  }
  return '#2563eb';
}

function fitLayer(map: LeafletMap, layer: LeafletGeoJSON, bbox: [[number, number], [number, number]] | undefined) {
  if (bbox) {
    const [[west, south], [east, north]] = bbox;
    if ([west, south, east, north].every(Number.isFinite)) {
      map.fitBounds(
        [
          [south, west],
          [north, east],
        ],
        { padding: [32, 32] },
      );
      return;
    }
  }

  const bounds = layer.getBounds();
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [32, 32] });
  }
}

function toRows(geojson: GeoJSON.FeatureCollection): DashboardRow[] {
  return geojson.features.map(toRow).filter((row): row is DashboardRow => Boolean(row));
}

function toRow(feature: GeoJSON.Feature | undefined): DashboardRow | null {
  if (!feature?.properties) {
    return null;
  }
  return {
    id: String(feature.properties.id ?? ''),
    name: String(feature.properties.name ?? ''),
    uf: feature.properties.uf ? String(feature.properties.uf) : undefined,
    indicators: (feature.properties.indicators as Record<string, number>) ?? {},
  };
}

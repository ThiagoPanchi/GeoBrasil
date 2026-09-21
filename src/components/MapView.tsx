import { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import L from 'leaflet';
import {
  getMicroregionsGeojsonByState,
  getMunicipalitiesByState,
  getSectorsByMunicipality,
  getStatesGeojson,
} from '../api';
import type { ChoroplethBreak, Indicator, MunicipalityDetails, MunicipalityFeatureCollection, TerritorialLayer } from '../types';
import { MunicipalityPopup } from './MunicipalityPopup';

type MapViewProps = {
  selectedUf: string;
  selectedMicroregion: string;
  selectedMunicipalityId: string;
  currentLayer: TerritorialLayer;
  selectedIndicator: string;
  indicators: Indicator[];
  onBreaksChange: (breaks: ChoroplethBreak[]) => void;
  onRowsChange: (rows: MunicipalityDetails[]) => void;
  onFeatureSelect: (feature: MunicipalityDetails | null) => void;
  onUfSelect: (uf: string) => void;
  onMicroregionSelect: (microregionId: string) => void;
  onMunicipalitySelect: (municipalityId: string) => void;
  onStatusChange: (status: string) => void;
};

export function MapView({
  selectedUf,
  selectedMicroregion,
  selectedMunicipalityId,
  currentLayer,
  selectedIndicator,
  indicators,
  onBreaksChange,
  onRowsChange,
  onFeatureSelect,
  onUfSelect,
  onMicroregionSelect,
  onMunicipalitySelect,
  onStatusChange,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const activeRequestRef = useRef(0);
  const indicatorsRef = useRef(indicators);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    indicatorsRef.current = indicators;
  }, [indicators]);

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
        const renderedLayers = collections.map((collection) => addCollectionToMap(collection, group));
        const primaryCollection = collections[collections.length - 1];
        const rows = collections.flatMap((collection) => collection.metadata?.rows ?? []);
        onBreaksChange(primaryCollection.metadata?.breaks ?? []);
        onRowsChange(rows);
        onFeatureSelect(null);

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
  }, [mapReady, selectedUf, selectedMicroregion, selectedMunicipalityId, currentLayer, selectedIndicator]);

  async function loadCurrentCollections(signal: AbortSignal): Promise<MunicipalityFeatureCollection[]> {
    if (!selectedUf || currentLayer === 'ufs') {
      onStatusChange('Carregando UFs a partir de assets estaticos...');
      return [await getStatesGeojson(selectedIndicator, signal)];
    }

    if (!selectedMicroregion) {
      onStatusChange('Carregando microrregioes da UF selecionada...');
      return [await getMicroregionsGeojsonByState(selectedUf, selectedIndicator, signal)];
    }

    if (currentLayer === 'sectors' && selectedMunicipalityId) {
      onStatusChange('Carregando setores censitarios do municipio selecionado...');
      return [await getSectorsByMunicipality(selectedMunicipalityId, selectedIndicator, signal)];
    }

    onStatusChange('Carregando municipios da microrregiao selecionada...');
    return [await getMunicipalitiesByState(selectedUf, selectedIndicator, selectedMicroregion, signal)];
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

    popupRootRef.current?.unmount();
    const popupContainer = document.createElement('div');
    popupRootRef.current = createRoot(popupContainer);
    popupRootRef.current.render(
      <MunicipalityPopup feature={details} indicators={indicatorsRef.current} selectedIndicator={selectedIndicator} />,
    );

    onFeatureSelect(details);

    const map = mapRef.current;
    const bounds = L.geoJSON(feature).getBounds();
    if (map && bounds.isValid()) {
      L.popup().setLatLng(bounds.getCenter()).setContent(popupContainer).openOn(map);
    }
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
    };
  }

  return (
    <section className="map-area">
      <div ref={mapContainer} className="map" />
    </section>
  );
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

function successMessage(layer: TerritorialLayer, count: number) {
  const labels: Record<TerritorialLayer, string> = {
    ufs: 'UFs carregadas',
    microregions: 'Microrregioes carregadas',
    municipalities: 'Municipios carregados',
    sectors: 'Setores censitarios carregados',
  };

  return `${labels[layer]}: ${count} registros exibidos.`;
}

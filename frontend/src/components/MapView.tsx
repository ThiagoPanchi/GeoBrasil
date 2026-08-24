import { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import * as maplibregl from 'maplibre-gl';
import type { GeoJSONSource, Map, MapLayerMouseEvent, Popup } from 'maplibre-gl';
import { getMunicipalitiesByState, getMunicipality, getStatesGeojson } from '../api';
import type { ChoroplethBreak, Indicator, MunicipalityDetails } from '../types';
import { MunicipalityPopup } from './MunicipalityPopup';

type MapViewProps = {
  selectedUf: string;
  selectedIndicator: string;
  indicators: Indicator[];
  onBreaksChange: (breaks: ChoroplethBreak[]) => void;
  onMunicipalitySelect: (municipality: MunicipalityDetails) => void;
  onStatusChange: (status: string) => void;
};

const emptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
} as GeoJSON.FeatureCollection;

export function MapView({
  selectedUf,
  selectedIndicator,
  indicators,
  onBreaksChange,
  onMunicipalitySelect,
  onStatusChange,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const selectedIndicatorRef = useRef(selectedIndicator);
  const indicatorsRef = useRef(indicators);

  useEffect(() => {
    selectedIndicatorRef.current = selectedIndicator;
  }, [selectedIndicator]);

  useEffect(() => {
    indicatorsRef.current = indicators;
  }, [indicators]);

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

      getStatesGeojson()
        .then((geojson) => {
          const source = map.getSource('states') as GeoJSONSource;
          source.setData(geojson);
        })
        .catch(() => onStatusChange('Nao foi possivel carregar a camada de estados.'));
    });

    mapRef.current = map;

    return () => {
      popupRootRef.current?.unmount();
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [onStatusChange]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedUf) {
      return;
    }

    onStatusChange('Carregando municipios da UF selecionada...');

    getMunicipalitiesByState(selectedUf, selectedIndicator)
      .then((geojson) => {
        const source = map.getSource('municipalities') as GeoJSONSource;
        source.setData(geojson);
        onBreaksChange(geojson.metadata?.breaks ?? []);
        onStatusChange('Municipios carregados. Clique em um municipio para ver os indicadores.');

        if (geojson.metadata?.bbox) {
          map.fitBounds(geojson.metadata.bbox, { padding: 48, duration: 700 });
        }
      })
      .catch(() => onStatusChange('Nao foi possivel carregar os municipios da UF.'));
  }, [selectedUf, selectedIndicator, onBreaksChange, onStatusChange]);

  function handleMunicipalityClick(event: MapLayerMouseEvent) {
    const feature = event.features?.[0];
    const municipalityId = feature?.properties?.id;

    if (!municipalityId) {
      return;
    }

    getMunicipality(municipalityId)
      .then((municipality) => {
        const popupContainer = document.createElement('div');
        popupRootRef.current?.unmount();
        popupRootRef.current = createRoot(popupContainer);
        popupRootRef.current.render(
          <MunicipalityPopup
            municipality={municipality}
            indicators={indicatorsRef.current}
            selectedIndicator={selectedIndicatorRef.current}
          />,
        );

        onMunicipalitySelect(municipality);
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup().setLngLat(event.lngLat).setDOMContent(popupContainer).addTo(mapRef.current as Map);
      })
      .catch(() => onStatusChange('Nao foi possivel consultar o municipio.'));
  }

  return (
    <section className="map-area">
      <div ref={mapContainer} className="map" />
    </section>
  );
}

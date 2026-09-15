export type Uf = {
  code: string;
  name: string;
};

export type Indicator = {
  id: string;
  name: string;
  unit: string;
};

export type TerritorialLayer = 'states' | 'microregions' | 'municipalities' | 'sectors';

export type Microregion = {
  id: string;
  name: string;
  uf: string;
};

export type Municipality = {
  id: string;
  name: string;
  uf: string;
};

export type TerritorialDetails = {
  id: string;
  name: string;
  uf: string;
  indicators: Record<string, number>;
};

export type MunicipalityDetails = TerritorialDetails;

export type CensusSectorDetails = TerritorialDetails & {
  municipalityId: string;
};

export type ChoroplethBreak = {
  min: number;
  max: number;
  color: string;
};

export type Bbox = [[number, number], [number, number]];

export type TerritorialFeatureCollection = GeoJSON.FeatureCollection & {
  metadata?: {
    indicator?: string;
    breaks?: ChoroplethBreak[];
    bbox?: Bbox;
  };
};

export type MunicipalityFeatureCollection = TerritorialFeatureCollection;

export type DashboardRow = {
  id: string;
  name: string;
  uf?: string;
  municipalityId?: string;
  indicators: Record<string, number>;
};

export type IndicatorValueRow = {
  id: string;
  name: string;
  indicator_id: string;
  value: number | null;
};

export type Uf = {
  code: string;
  name: string;
};

export type Indicator = {
  id: string;
  name: string;
  unit: string;
};

export type MunicipalityDetails = {
  id: string;
  name: string;
  uf: string;
  indicators: Record<string, number>;
};

export type ChoroplethBreak = {
  min: number;
  max: number;
  color: string;
};

export type MunicipalityFeatureCollection = GeoJSON.FeatureCollection & {
  metadata?: {
    indicator: string;
    breaks: ChoroplethBreak[];
    bbox: [[number, number], [number, number]];
  };
};

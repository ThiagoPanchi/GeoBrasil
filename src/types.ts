export type Uf = {
  code: string;
  name: string;
  ibgeCode?: string;
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
  layer?: TerritorialLayer;
  microregionId?: string;
  microregionName?: string;
  indicators: Record<string, number>;
  reportAttributes?: Record<string, string | number>;
};

export type ChoroplethBreak = {
  min: number;
  max: number;
  color: string;
};

export type ColorScale = 'blue' | 'red' | 'green' | 'semaforica';

export type MunicipalityFeatureCollection = GeoJSON.FeatureCollection & {
  metadata?: {
    indicator: string;
    breaks: ChoroplethBreak[];
    bbox: [[number, number], [number, number]];
    rows?: MunicipalityDetails[];
    layer?: TerritorialLayer;
  };
};

export type TerritorialLayer = 'ufs' | 'microregions' | 'municipalities' | 'sectors';

export type Microregion = {
  id: string;
  name: string;
  uf: string;
  ufCode?: string;
};

export type MunicipalityOption = {
  id: string;
  name: string;
  uf: string;
  ufCode?: string;
  microregionId?: string;
};

export type StaticAssetManifest = {
  generatedAt: string;
  assets: {
    ufs: string;
  };
  indicators: Indicator[];
  ufs: Array<Uf & { assets: { municipalities: string; microregions: string } }>;
  municipalities: Array<MunicipalityOption & { asset: string }>;
  microregions: Microregion[];
};

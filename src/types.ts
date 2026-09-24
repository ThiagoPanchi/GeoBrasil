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

export type CnefeAddressProperties = {
  COD_MUNICIPIO: string;
  COD_SETOR: string;
  ENDERECO_COMPLETO?: string;
  DSC_ESTABELECIMENTO?: string;
  ESPECIE_ENDERECO: string;
  QUANTIDADE: number;
  [key: string]: string | number | undefined;
};

export type CnefeAddressFeature = GeoJSON.Feature<GeoJSON.Point, CnefeAddressProperties>;

export type CnefeAggregatedManifest = {
  generatedAt: string;
  municipalities: Record<string, { files: string[] }>;
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

export type CityOption = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type Supplier = {
  id: string;
  name: string;
  city: string;
  tags: string[];
};

export type MaterialQuote = {
  supplierId: string;
  unitPriceUSD: number | null;
  unitLabel: string;
  sourceLabel?: string;
};

export type MaterialDef = {
  id: string;
  name: string;
  unit: string;
  defaultQty: number;
  quotes: MaterialQuote[];
};

export type DesignItem = {
  id: string;
  name: string;
  sourceImage: string;
  renderedImage?: string;
  renderedPath?: string;
  timestamp: number;
  ownerId?: string | null;
  isPublic?: boolean;
};

export type MaterialState = {
  qty: number;
  supplierId: string | null;
  prices: Record<string, number | null>;
};

export type MaterialSummary = {
  material: MaterialDef;
  state?: MaterialState;
  selectedSupplierId?: string | null;
  selectedPrice?: number | null;
  totalUSD: number | null;
  minPrice: number | null;
  maxPrice: number | null;
};

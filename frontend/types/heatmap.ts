// Types pour le composant Heatmap Treemap

export interface Stock {
  ticker: string;
  companyName: string;
  logoUrl?: string;
  marketCap: number;
  changePercent: number;
  price: number;
  volume?: number;
  sector?: string;
}

export interface Industry {
  name: string;
  stocks: Stock[];
}

export interface Sector {
  name: string;
  industries?: Industry[];
  stocks?: Stock[];
}

export interface HierarchicalData {
  name: string;
  children?: HierarchicalData[];
  value?: number;
  data?: Stock | Industry | Sector;
  type: 'root' | 'sector' | 'industry' | 'stock';
}


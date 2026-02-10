export interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OHLCInfo {
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
}

export interface RateRow {
  date?: string;
  city?: string;
  piece: string;
  tray: string;
  hundred_pcs: string;
  peti: string;
}

export interface MarketRow {
  piece: string;
  tray: string;
}

export interface ChartOne {
  chart_labels: string;
  chart_data: string;
  min: number;
  max: number;
}

export interface ChartTwo {
  chart_labels_two: string;
  chart_data_two: string;
  min: number;
  max: number;
}

export interface ReportRow {
  up_down: string;
  up_down_status: string;
  percentage: string;
  percentage_status: string;
  today_rate: string;
  month_rate: string;
}

export interface StateItem {
  state: string;
}

export interface CityItem {
  city: string;
}

export interface EggDataBlock {
  table: RateRow[];
  states?: StateItem[];
  citys?: CityItem[];
  market: MarketRow[];
  chart_one: ChartOne[];
  chart_two: ChartTwo[];
  report?: ReportRow[];
}

export type EggApiResponse = EggDataBlock[];

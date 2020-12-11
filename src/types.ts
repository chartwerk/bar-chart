import { TimeSerie, Options } from '@chartwerk/base';

export type BarSerieParams = {
  matchedKey: string;
}
export type BarTimeSerie = TimeSerie & Partial<BarSerieParams>;
export type BarOptionsParams = {
  renderBarLabels: boolean;
  stacked: boolean;
  maxBarWidth: number;
  matching: boolean;
}
export type BarOptions = Options & Partial<BarOptionsParams>;

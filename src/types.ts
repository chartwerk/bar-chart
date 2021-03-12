import { TimeSerie, Options } from '@chartwerk/core';

export type BarSerieParams = {
  matchedKey: string;
  colorFormatter: (serie: BarTimeSerie) => string;
}
export type BarTimeSerie = TimeSerie & Partial<BarSerieParams>;
export type BarOptionsParams = {
  renderBarLabels: boolean;
  stacked: boolean;
  maxBarWidth: number;
  matching: boolean;
}
export type BarOptions = Options & Partial<BarOptionsParams>;

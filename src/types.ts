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
  opacityFormatter: (data: rowValues) => number;
}
export type BarOptions = Options & Partial<BarOptionsParams>;
export type rowValues = {
  key: number,
  values: number[],
  supValues: (null | number)[],
  colors: string[]
}

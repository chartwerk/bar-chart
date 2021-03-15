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
  opacityFormatter: (data: RowValues) => number;
}
export type BarOptions = Options & Partial<BarOptionsParams>;
export type RowValues = {
  key: number,
  values: number[],
  additionalValues: (null | number)[], // values in datapoints third column
  colors: string[]
}

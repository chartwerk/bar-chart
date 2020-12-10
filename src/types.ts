import { TimeSerie, Options } from '@chartwerk/base';

export type BarSerieParams = {
  colors: string[];
}
export type BarTimeSerie = TimeSerie & Partial<BarSerieParams>;

export type BarOptionsParams = {
  renderBarLabels: boolean;
  stacked: boolean;
  maxBarWidth: number;
  // TODO: it's temporary option. Needs to update.
  // idea: If there are two ot more series, we doesn't guarantee that timestamps matched exactly
  matchedData: boolean;
}
export type BarOptions = Options & Partial<BarOptionsParams>;

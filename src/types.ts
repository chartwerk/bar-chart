import { TimeSerie, Options } from '@chartwerk/base';

export type BarTimeSerie = TimeSerie;
export type BarOptionsParams = {
  renderBarLabels: boolean;
  stacked: boolean;
}
export type BarOptions = Options & Partial<BarOptionsParams>;

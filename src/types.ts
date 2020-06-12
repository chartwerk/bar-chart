import { TimeSerie, Options, TickOrientation, TimeFormat } from '@chartwerk/base';

export type BarTimeSerie = TimeSerie;
export type BarOptionsParams = {
  renderBarLabels: boolean;
}
export type BarOptions = Options & Partial<BarOptionsParams>;
// TODO: improve import-export TickOrientation/TimeFormat
export { TickOrientation, TimeFormat };

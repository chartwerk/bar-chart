import { TimeSerie, Options, TickOrientation, TimeFormat } from '@chartwerk/base';
export declare type BarTimeSerie = TimeSerie;
export declare type BarOptionsParams = {
    renderBarLabels: boolean;
};
export declare type BarOptions = Options & Partial<BarOptionsParams>;
export { TickOrientation, TimeFormat };

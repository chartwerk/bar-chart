import { TimeSerie, Options } from '@chartwerk/base';
export declare type BarTimeSerie = TimeSerie;
export declare type BarOptionsParams = {
    renderBarLabels: boolean;
    stacked: boolean;
    barWidth: number;
};
export declare type BarOptions = Options & Partial<BarOptionsParams>;

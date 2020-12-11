import { TimeSerie, Options } from '@chartwerk/base';
export declare type BarSerieParams = {
    matchedKey: string;
};
export declare type BarTimeSerie = TimeSerie & Partial<BarSerieParams>;
export declare type BarOptionsParams = {
    renderBarLabels: boolean;
    stacked: boolean;
    maxBarWidth: number;
    matching: boolean;
};
export declare type BarOptions = Options & Partial<BarOptionsParams>;

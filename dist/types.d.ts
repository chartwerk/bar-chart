import { TimeSerie, Options } from '@chartwerk/core';
export declare type BarSerieParams = {
    matchedKey: string;
    colorFormatter: (serie: BarTimeSerie) => string;
};
export declare type BarTimeSerie = TimeSerie & Partial<BarSerieParams>;
export declare type BarOptionsParams = {
    renderBarLabels: boolean;
    stacked: boolean;
    maxBarWidth: number;
    matching: boolean;
    opacityFormatter: (value: number) => number;
};
export declare type BarOptions = Options & Partial<BarOptionsParams>;

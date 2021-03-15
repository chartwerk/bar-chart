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
    opacityFormatter: (data: RowValues) => number;
};
export declare type BarOptions = Options & Partial<BarOptionsParams>;
export declare type RowValues = {
    key: number;
    values: number[];
    additionalValues: (null | number)[];
    colors: string[];
};

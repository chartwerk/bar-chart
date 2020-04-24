// Generated by dts-bundle v0.7.3
// Dependencies for this module:
//   ../@chartwerk/base
//   ../d3

import { ChartwerkBase, TimeSerie, Options } from '@chartwerk/base';
import * as d3 from 'd3';

export class ChartwerkBarChart extends ChartwerkBase {
    constructor(el: HTMLElement, _series?: TimeSerie[], _options?: Options);
    _renderMetrics(): void;
    _renderMetric(datapoints: number[][], options: {
        color: string;
    }, idx: number): void;
    renderSharedCrosshair(timestamp: number): void;
    hideSharedCrosshair(): void;
    onMouseMove(): void;
    onMouseOver(): void;
    onMouseOut(): void;
    get rectWidth(): number;
    getBarHeight(value: number): number;
    get yScale(): d3.ScaleLinear<number, number>;
}


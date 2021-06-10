import { ChartwerkPod, TickOrientation, TimeFormat, AxisFormat } from '@chartwerk/core';
import { BarTimeSerie, BarOptions, RowValues } from './types';
import * as d3 from 'd3';
export declare class ChartwerkBarPod extends ChartwerkPod<BarTimeSerie, BarOptions> {
    metricsContainer: any;
    constructor(el: HTMLElement, _series?: BarTimeSerie[], _options?: BarOptions);
    protected renderMetrics(): void;
    renderSerie(data: any): void;
    getBarOpacity(rowValues: RowValues): number;
    mergeMacthedSeriesAndSort(matchedSeries: any[]): any;
    get seriesUniqKeys(): string[];
    get seriesForMatching(): BarTimeSerie[][];
    getZippedDataForRender(series: BarTimeSerie[]): RowValues[];
    renderSharedCrosshair(timestamp: number): void;
    hideSharedCrosshair(): void;
    onMouseMove(): void;
    getSeriesPointFromMousePosition(eventX: number): any[] | undefined;
    getBarColor(serie: any): any;
    onMouseOver(): void;
    onMouseOut(): void;
    contextMenu(): void;
    get barWidth(): number;
    updateBarWidthWithBorders(width: number): number;
    getBarHeight(value: number): number;
    getBarPositionX(key: number, idx: number): number;
    getBarPositionY(val: number, idx: number, values: number[]): number;
    get yScale(): d3.ScaleLinear<number, number>;
    get maxValue(): number | undefined;
}
export declare const VueChartwerkBarChartObject: {
    render(createElement: any): any;
    mixins: {
        props: {
            id: {
                type: StringConstructor;
                required: boolean;
            };
            series: {
                type: ArrayConstructor;
                required: boolean;
                default: () => any[];
            };
            options: {
                type: ObjectConstructor;
                required: boolean;
                default: () => {};
            };
        };
        watch: {
            id(): void;
            series(): void;
            options(): void;
        };
        mounted(): void;
        methods: {
            render(): void;
            renderChart(): void;
            appendEvents(): void;
            zoomIn(range: any): void;
            zoomOut(center: any): void;
            mouseMove(evt: any): void;
            mouseOut(): void;
            onLegendClick(idx: any): void;
            panningEnd(range: any): void;
            panning(range: any): void;
            contextMenu(evt: any): void;
        };
    }[];
    methods: {
        render(): void;
    };
};
export { BarTimeSerie, BarOptions, TickOrientation, TimeFormat, AxisFormat };

import { ChartwerkBase } from '@chartwerk/base';
import { BarTimeSerie, BarOptions } from './types';
import * as d3 from 'd3';
export declare class ChartwerkBarChart extends ChartwerkBase<BarTimeSerie, BarOptions> {
    constructor(el: HTMLElement, _series?: BarTimeSerie[], _options?: BarOptions);
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
    get xScale(): d3.ScaleTime<number, number>;
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
        };
    }[];
    methods: {
        render(): void;
    };
};

import { ChartwerkPod, VueChartwerkPodMixin, TickOrientation, TimeFormat, AxisFormat } from '@chartwerk/core';

import { BarTimeSerie, BarOptions, BarOptionsParams } from './types';

import * as d3 from 'd3';
import * as _ from 'lodash';


const DEFAULT_BAR_OPTIONS: BarOptions = {
  renderBarLabels: false,
  stacked: false,
  matching: false
}

export class ChartwerkBarPod extends ChartwerkPod<BarTimeSerie, BarOptions> {
  metricsContainer: any;

  constructor(el: HTMLElement, _series: BarTimeSerie[] = [], _options: BarOptions = {}) {
    super(d3, el, _series, _options);
    _.defaults(this.options, DEFAULT_BAR_OPTIONS);
  }

  protected renderMetrics(): void {
    if(this.series.length === 0 || this.series[0].datapoints.length === 0) {
      this.renderNoDataPointsMessage();
      return;
    }

    // container for clip path
    const clipContatiner = this.chartContainer
      .append('g')
      .attr('clip-path', `url(#${this.rectClipId})`)
      .attr('class', 'metrics-container');
    // container for panning
    this.metricsContainer = clipContatiner
      .append('g')
      .attr('class', ' metrics-rect');

    if(this.options.matching === false || this.seriesUniqKeys.length === 0) {
      const zippedData = this.getZippedDataForRender(this.visibleSeries);
      this.renderSerie(zippedData);
      return;
    }
    const matchedSeries = this.seriesForMatching.map((series: BarTimeSerie[], idx: number) => {
      return this.getZippedDataForRender(series);
    });
    const concatedSeries = this.mergeMacthedSeriesAndSort(matchedSeries);
    this.renderSerie(concatedSeries);
  }

  renderSerie(data: any): void {
    this.metricsContainer.selectAll(`.rects-container`)
      .data(data)
      .enter().append('g')
      .attr('class', 'rects-container')
      .attr('clip-path', `url(#${this.rectClipId})`)
      .each((d: { key: number, values: number[], supValues: (null | number)[], colors: string []}, i: number, nodes: any) => {
        const container = d3.select(nodes[i]);
        container.selectAll('rect')
        .data(d.values)
        .enter().append('rect')
        .style('fill', (val, i) => {
          console.log('fill', d, val, i);
          return d.colors[i];
        })
        .attr('opacity', (val, i) => {
          if(
            this.options.opacityFormatter === undefined ||
            d.supValues === undefined ||
            d.supValues.length === 0 ||
            d.supValues[0] === null
          ) {
            return 1;
          }
          return this.options.opacityFormatter(d.supValues[0]);
        })
        .attr('x', (val: number, idx: number) => {
          return this.getBarPositionX(d.key, idx);
        })
        .attr('y', (val: number, idx: number) => {
          return this.getBarPositionY(val, idx, d.values);
        })
        .attr('width', this.barWidth)
        .attr('height', (val: number) => this.getBarHeight(val))
        .on('contextmenu', this.contextMenu.bind(this));
      });

    // TODO: render bar labels
  }

  mergeMacthedSeriesAndSort(matchedSeries: any[]) {
    // TODO: refactor
    if(matchedSeries.length === 0) {
      throw new Error('Cant mergeMacthedSeriesAndSort');
    }
    if(matchedSeries.length === 1) {
      return matchedSeries[0];
    }
    let unionSeries = _.clone(matchedSeries[0]);
    for(let i = 1; i < matchedSeries.length; i++){
      unionSeries = [...unionSeries, ...matchedSeries[i]];
    }
    const sortedSeries = _.sortBy(unionSeries, ['key']);
    return sortedSeries;
  }

  get seriesUniqKeys(): string[] {
    if(this.visibleSeries.length === 0) {
      return [];
    }
    const keys = this.visibleSeries.map(serie => serie.matchedKey);
    const uniqKeys = _.uniq(keys);
    const filteredKeys = _.filter(uniqKeys, key => key !== undefined);
    return filteredKeys;
  }

  get seriesForMatching(): BarTimeSerie[][] {
    if(this.seriesUniqKeys.length === 0) {
      return [this.visibleSeries];
    }
    const seriesList = this.seriesUniqKeys.map(key => {
      const seriesWithKey = _.filter(this.visibleSeries, serie => serie.matchedKey === key);
      return seriesWithKey;
    });
    return seriesList;
  }

  getZippedDataForRender(series: BarTimeSerie[]): { key: number, values: number[], supValues: (null | number)[], colors: string[] }[] {
    if(series.length === 0) {
      throw new Error('There is no visible series');
    }
    const keysColumn = _.map(series[0].datapoints, row => row[1]);
    const valuesColumns = _.map(series, serie => _.map(serie.datapoints, row => row[0]));
    // @ts-ignore
    const supValuesColumns = _.map(series, serie => _.map(serie.datapoints, row => row[2] !== undefined ? row[2] : null));
    const zippedSupValuesColumn = _.zip(...supValuesColumns);
    const zippedValuesColumn = _.zip(...valuesColumns);
    const colors = _.map(series, serie => this.getBarColor(serie));
    const zippedData = _.zip(keysColumn, zippedValuesColumn, zippedSupValuesColumn);
    const data = _.map(zippedData, row => { return { key: row[0], values: row[1], supValues: row[2], colors } });
    return data;
  }

  public renderSharedCrosshair(timestamp: number): void {
    this.crosshair.style('display', null);

    const x = this.xScale(timestamp);
    this.crosshair.select('#crosshair-line-x')
      .attr('x1', x)
      .attr('x2', x);
  }

  public hideSharedCrosshair(): void {
    this.crosshair.style('display', 'none');
  }

  onMouseMove(): void {
    // TODO: mouse move work bad with matching
    const event = this.d3.mouse(this.chartContainer.node());
    const eventX = event[0];
    if(this.isOutOfChart() === true) {
      this.crosshair.style('display', 'none');
      return;
    }
    this.crosshair.select('#crosshair-line-x')
      .attr('x1', eventX)
      .attr('x2', eventX);

    const series = this.getSeriesPointFromMousePosition(eventX);

    if(this.options.eventsCallbacks !== undefined && this.options.eventsCallbacks.mouseMove !== undefined) {
      this.options.eventsCallbacks.mouseMove({
        x: this.d3.event.pageX,
        y: this.d3.event.pageY,
        time: this.xScale.invert(eventX),
        series,
        chartX: eventX,
        chartWidth: this.width
      });
    } else {
      console.log('mouse move, but there is no callback');
    }
  }

  // TODO: not any[]
  getSeriesPointFromMousePosition(eventX: number): any[] | undefined {
    if(this.series === undefined || this.series.length === 0) {
      return undefined;
    }

    const bisectDate = this.d3.bisector((d: [number, number]) => d[1]).left;
    const mouseDate = this.xScale.invert(eventX);

    let idx = bisectDate(this.series[0].datapoints, mouseDate) - 1;

    const series: any[] = [];
    for(let i = 0; i < this.series.length; i++) {
      if(this.series[i].visible === false || this.series[i].datapoints.length < idx + 1) {
        continue;
      }

      series.push({
        value: this.series[i].datapoints[idx][0],
        xval: this.series[i].datapoints[idx][1],
        color: this.getBarColor(this.series[i]),
        label: this.series[i].alias || this.series[i].target
      });
    }
    return series;
  }

  getBarColor(serie: any) {
    if(serie.color === undefined) {
      return this.getSerieColor(0);
    }
    return serie.color;
  }

  onMouseOver(): void {
    this.crosshair.style('display', null);
    this.crosshair.raise();
  }

  onMouseOut(): void {
    if(this.options.eventsCallbacks !== undefined && this.options.eventsCallbacks.mouseOut !== undefined) {
      this.options.eventsCallbacks.mouseOut();
    } else {
      console.log('mouse out, but there is no callback');
    }
    this.crosshair.style('display', 'none');
  }

  contextMenu(): void {
    // maybe it is not the best name, but i took it from d3.
    this.d3.event.preventDefault(); // do not open browser's context menu.

    const event = this.d3.mouse(this.chartContainer.node());
    const eventX = event[0];
    const series = this.getSeriesPointFromMousePosition(eventX);

    if(this.options.eventsCallbacks !== undefined && this.options.eventsCallbacks.contextMenu !== undefined) {
      this.options.eventsCallbacks.contextMenu({
        x: this.d3.event.pageX,
        y: this.d3.event.pageY,
        time: this.xScale.invert(eventX),
        series,
        chartX: eventX
      });
    } else {
      console.log('contextmenu, but there is no callback');
    }
  }

  get barWidth(): number {
    // TODO: here we use first value + timeInterval as bar width. It is not a good idea
    const xAxisStartValue = _.first(this.series[0].datapoints)[1];
    let width = this.xScale(xAxisStartValue + this.timeInterval) / 2;
    if(this.options.maxBarWidth !== undefined) {
      // maxBarWidth now has axis-x dimension
      width = this.xScale(this.minValueX + this.options.maxBarWidth);
    }
    let rectColumns = this.visibleSeries.length;
    if(this.options.stacked === true) {
      rectColumns = 1;
    }
    return width / rectColumns;
  }

  getBarHeight(value: number): number {
    // TODO: Property 'sign' does not exist on type 'Math'
    // @ts-ignore
    const height = Math.sign(value) * (this.yScale(0) - this.yScale(value));
    return height;
  }

  getBarPositionX(key: number, idx: number): number {
    let xPosition: number = this.xScale(key);
    if(this.options.stacked === false) {
      xPosition += idx * this.barWidth;
    }
    return xPosition;
  }

  getBarPositionY(val: number, idx: number, values: number[]): number {
    let yPosition: number = this.yScale(Math.max(val, 0));
    if(this.options.stacked === true) {
      const previousBarsHeight = _.sum(
        _.map(_.range(idx), i => this.getBarHeight(values[i]))
      );
      yPosition -= previousBarsHeight;
    }
    return yPosition;
  }

  get yScale(): d3.ScaleLinear<number, number> {
    if(
      this.minValue === undefined ||
      this.maxValue === undefined
    ) {
      return this.d3.scaleLinear()
        .domain([1, 0])
        .range([0, this.height]);
    }
    return this.d3.scaleLinear()
      .domain([this.maxValue, Math.min(this.minValue, 0)])
      .range([0, this.height]);
  }

  get maxValue(): number | undefined {
    if(this.series === undefined || this.series.length === 0 || this.series[0].datapoints.length === 0) {
      return undefined;
    }
    if(this.options.axis.y !== undefined && this.options.axis.y.range !== undefined) {
      return _.max(this.options.axis.y.range);
    }
    let maxValue: number;
    if(this.options.stacked === true) {
      if(this.options.matching === true && this.seriesUniqKeys.length > 0) {
        const maxValues = this.seriesForMatching.map(series => {
          const valuesColumns = _.map(series, serie => _.map(serie.datapoints, row => row[0]));
          const zippedValuesColumn = _.zip(...valuesColumns);
          return maxValue = _.max(_.map(zippedValuesColumn, row => _.sum(row)));
        });
        return _.max(maxValues);
      } else {
        const valuesColumns = _.map(this.visibleSeries, serie => _.map(serie.datapoints, row => row[0]));
        const zippedValuesColumn = _.zip(...valuesColumns);
        maxValue = _.max(_.map(zippedValuesColumn, row => _.sum(row))); 
      }
    } else {
      maxValue = _.max(
        this.visibleSeries.map(
          serie => _.maxBy<number[]>(serie.datapoints, dp => dp[0])[0]
        )
      );
    }
    return Math.max(maxValue, 0);
  }

  get xScale(): d3.ScaleLinear<number, number> {
    const domain = this.state.xValueRange || [this.minValueX, this.maxValueX];
    return this.d3.scaleLinear()
      .domain([domain[0], domain[1] + this.timeInterval / 2])
      .range([0, this.width]);
  }
}

// it is used with Vue.component, e.g.: Vue.component('chartwerk-bar-chart', VueChartwerkBarChartObject)
export const VueChartwerkBarChartObject = {
  // alternative to `template: '<div class="chartwerk-bar-chart" :id="id" />'`
  render(createElement) {
    return createElement(
      'div',
      {
        class: { 'chartwerk-bar-chart': true },
        attrs: { id: this.id }
      }
    )
  },
  mixins: [VueChartwerkPodMixin],
  methods: {
    render() {
      const pod = new ChartwerkBarPod(document.getElementById(this.id), this.series, this.options);
      pod.render();
    }
  }
};

export { BarTimeSerie, BarOptions, TickOrientation, TimeFormat, AxisFormat };

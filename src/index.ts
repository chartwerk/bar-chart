import { ChartwerkBase, VueChartwerkBaseMixin, TickOrientation, TimeFormat, AxisFormat } from '@chartwerk/base';

import { BarTimeSerie, BarOptions, BarOptionsParams } from './types';

import * as d3 from 'd3';
import * as _ from 'lodash';


const DEFAULT_BAR_OPTIONS: BarOptions = {
  renderBarLabels: false,
  stacked: false
}

export class ChartwerkBarChart extends ChartwerkBase<BarTimeSerie, BarOptions> {
  _metricsContainer: any;

  constructor(el: HTMLElement, _series: BarTimeSerie[] = [], _options: BarOptions = {}) {
    super(d3, el, _series, _options);
    _.defaults(this._options, DEFAULT_BAR_OPTIONS);
  }

  _renderMetrics(): void {
    if(this._series.length === 0 || this._series[0].datapoints.length === 0) {
      this._renderNoDataPointsMessage();
      return;
    }

    // container for clip path
    const clipContatiner = this._chartContainer
      .append('g')
      .attr('clip-path', `url(#${this.rectClipId})`)
      .attr('class', 'metrics-container');
    // container for panning
    this._metricsContainer = clipContatiner
      .append('g')
      .attr('class', ' metrics-rect')

    const zippedData = this.zippedDataForRender;
    this._metricsContainer.selectAll('.rects-container')
      .data(zippedData)
      .enter().append('g')
      .attr('class', 'rects-container')
      .attr('clip-path', `url(#${this.rectClipId})`)
      .each((d: { key: number, values: number[] }, i: number, nodes: any) => {
        const container = d3.select(nodes[i]);
        container.selectAll('rect')
        .data(d.values)
        .enter().append('rect')
        .style('fill', (val, i) => this.getSerieColor(i))
        .style('pointer-events', 'none')
        .attr('x', (val: number, idx: number) => {
          return this.getBarPositionX(d.key, idx);
        })
        .attr('y', (val: number, idx: number) => {
          return this.getBarPositionY(val, idx, d.values);
        })
        .attr('width', this.barWidth)
        .attr('height', (val: number) => this.getBarHeight(val));
      });

    // TODO: render bar labels
  }

  get zippedDataForRender(): { key: number, values: number[] }[] {
    if(this.visibleSeries.length === 0) {
      throw new Error('There is no visible series');
    }
  
    const keysColumn = _.map(this.visibleSeries[0].datapoints, row => row[1]);
    const valuesColumns = _.map(this.visibleSeries, serie => _.map(serie.datapoints, row => row[0]));
    const zippedValuesColumn = _.zip(...valuesColumns);
    const zippedData = _.zip(keysColumn, zippedValuesColumn);
    const data = _.map(zippedData, row => { return { key: row[0], values: row[1] } });
    return data;
  }

  public renderSharedCrosshair(timestamp: number): void {
    this._crosshair.style('display', null);

    const x = this.xScale(timestamp);
    this._crosshair.select('#crosshair-line-x')
      .attr('x1', x)
      .attr('x2', x);
  }

  public hideSharedCrosshair(): void {
    this._crosshair.style('display', 'none');
  }

  onMouseMove(): void {
    const event = this._d3.mouse(this._chartContainer.node());
    const eventX = event[0];
    if(this.isOutOfChart() === true) {
      this._crosshair.style('display', 'none');
      return;
    }
    this._crosshair.select('#crosshair-line-x')
      .attr('x1', eventX)
      .attr('x2', eventX);

    if(this._series === undefined || this._series.length === 0) {
      return;
    }

    const bisectDate = this._d3.bisector((d: [number, number]) => d[1]).left;
    const mouseDate = this.xScale.invert(eventX);

    let idx = bisectDate(this._series[0].datapoints, mouseDate) - 1;

    const series: any[] = [];
    for(let i = 0; i < this._series.length; i++) {
      if(this._series[i].visible === false) {
        continue;
      }

      series.push({
        value: this._series[i].datapoints[idx][0],
        color: this.getSerieColor(i),
        label: this._series[i].alias || this._series[i].target
      });
    }

    if(this._options.eventsCallbacks !== undefined && this._options.eventsCallbacks.mouseMove !== undefined) {
      this._options.eventsCallbacks.mouseMove({
        x: this._d3.event.clientX,
        y: this._d3.event.clientY,
        time: this.xScale.invert(eventX),
        series,
        chartX: eventX,
        chartWidth: this.width
      });
    } else {
      console.log('mouse move, but there is no callback');
    }
  }

  onMouseOver(): void {
    this._crosshair.style('display', null);
    this._crosshair.raise();
  }

  onMouseOut(): void {
    if(this._options.eventsCallbacks !== undefined && this._options.eventsCallbacks.mouseOut !== undefined) {
      this._options.eventsCallbacks.mouseOut();
    } else {
      console.log('mouse out, but there is no callback');
    }
    this._crosshair.style('display', 'none');
  }

  get barWidth(): number {
    if(this._options.barWidth !== undefined) {
      return this._options.barWidth;
    }
    const xAxisStartValue = _.first(this._series[0].datapoints)[1];
    let width: number;
    if(this._options.axis.x.format === 'time') {
      width = this.xScale(new Date(xAxisStartValue + this.timeInterval)) / 2;
    } else {
      width = this.xScale(xAxisStartValue + this.timeInterval) / 2;
    }
    let rectColumns = this.visibleSeries.length;
    if(this._options.stacked === true) {
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
    if(this._options.stacked === false) {
      xPosition += idx * this.barWidth;
    }
    return xPosition;
  }

  getBarPositionY(val: number, idx: number, values: number[]): number {
    let yPosition: number = this.yScale(Math.max(val, 0));
    if(this._options.stacked === true) {
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
      return this._d3.scaleLinear()
        .domain([1, 0])
        .range([0, this.height]);
    }
    return this._d3.scaleLinear()
      .domain([this.maxValue, Math.min(this.minValue, 0)])
      .range([0, this.height]);
  }

  get maxValue(): number | undefined {
    if(this._series === undefined || this._series.length === 0 || this._series[0].datapoints.length === 0) {
      return undefined;
    }
    let maxValue: number;
    if(this._options.stacked === true) {
      const valuesColumns = _.map(this.visibleSeries, serie => _.map(serie.datapoints, row => row[0]));
      const zippedValuesColumn = _.zip(...valuesColumns);
      maxValue = _.max(_.map(zippedValuesColumn, row => _.sum(row))); 
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
    const domain = this._state.xValueRange || [this.minValueX, this.maxValueX];
    return this._d3.scaleLinear()
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
  mixins: [VueChartwerkBaseMixin],
  methods: {
    render() {
      const pod = new ChartwerkBarChart(document.getElementById(this.id), this.series, this.options);
      pod.render();
    }
  }
};

export { BarTimeSerie, BarOptions, TickOrientation, TimeFormat, AxisFormat };

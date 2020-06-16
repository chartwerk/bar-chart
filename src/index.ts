import { ChartwerkBase, VueChartwerkBaseMixin } from '@chartwerk/base';

import { BarTimeSerie, BarOptions, BarOptionsParams } from './types';

import * as d3 from 'd3';
import * as _ from 'lodash';

const DEFAULT_BAR_OPTIONS: BarOptionsParams = {
  renderBarLabels: false,
}

export class ChartwerkBarChart extends ChartwerkBase<BarTimeSerie, BarOptions> {

  constructor(el: HTMLElement, _series: BarTimeSerie[] = [], _options: BarOptions = {}) {
    super(d3, el, _series, _options);
    _.defaults(this._options, DEFAULT_BAR_OPTIONS);
  }

  _renderMetrics(): void {
    for(const i in this._series) {
      this._series[i].color = this._series[i].color || this._options.colors[i];
    }
    if(this.visibleSeries.length > 0) {
      for(const idx in this.visibleSeries) {
        this._renderMetric(
          this.visibleSeries[idx].datapoints,
          { color: this.visibleSeries[idx].color },
          Number(idx)
        );
      }
    } else {
      this._renderNoDataPointsMessage();
    }
  }

  _renderMetric(datapoints: number[][], options: { color: string }, idx: number): void {
    this._chartContainer.selectAll('bar')
      .data(datapoints)
      .enter().append('rect')
      .attr('class', 'bar-rect')
      .attr('clip-path', `url(#${this.rectClipId})`)
      .style('fill', options.color)
      .attr('x', (d: [number, number]) => {
        return this.xScale(new Date(d[1])) + idx * this.rectWidth;
      })
      .attr('y', (d: [number, number]) => {
        return this.yScale(Math.max(d[0],0));
      })
      .attr('width', this.rectWidth)
      .attr('height', (d: [number, number]) => this.getBarHeight(d[0]));

    if(!this._options.renderBarLabels) {
      return;
    }
    this._chartContainer.selectAll('.bar-text')
      .data(datapoints)
      .enter()
      .append('text')
      .attr('class', 'bar-text')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .attr('x', d => this.xScale(new Date(d[1])) + this.rectWidth / 2)
      .attr('y', d => this.yScale(Math.max(d[0], 0) + 1))
      .text(d => d[0]);
  }

  public renderSharedCrosshair(timestamp: number): void {
    this._crosshair.style('display', null);

    const x = this.timestampScale(timestamp);
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
    const mouseDate = this.xScale.invert(eventX).getTime();

    let idx = bisectDate(this._series[0].datapoints, mouseDate) - 1;

    const series: any[] = [];
    for(let i = 0; i < this._series.length; i++) {
      if(this._series[i].visible === false) {
        continue;
      }

      series.push({
        value: this._series[i].datapoints[idx][0],
        color: this._options.colors[i],
        label: this._series[i].alias || this._series[i].target
      });
    }

    if(this._options.eventsCallbacks !== undefined && this._options.eventsCallbacks.mouseMove !== undefined) {
      this._options.eventsCallbacks.mouseMove({
        x: this._d3.event.clientX,
        y: this._d3.event.clientY,
        time: this.timestampScale.invert(eventX),
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
  }

  onMouseOut(): void {
    if(this._options.eventsCallbacks !== undefined && this._options.eventsCallbacks.mouseOut !== undefined) {
      this._options.eventsCallbacks.mouseOut();
    } else {
      console.log('mouse out, but there is no callback');
    }
    this._crosshair.style('display', 'none');
  }

  get rectWidth(): number {
    if(this._options === undefined) {
      return 20;
    }
    const startTimestamp = _.first(this._series[0].datapoints)[1];
    const width = this.xScale(new Date(startTimestamp + this.timeInterval)) / 2;
    return width / this.visibleSeries.length;
  }

  getBarHeight(value: number): number {
    // TODO: Property 'sign' does not exist on type 'Math'
    // @ts-ignore
    return Math.sign(value) * (this.yScale(0) - this.yScale(value));
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
      .domain([Math.max(this.maxValue, 0), Math.min(this.minValue, 0)])
      .range([0, this.height]);
  }

  get xScale(): d3.ScaleTime<number, number> {
    if((this._series === undefined || this._series.length === 0 || this._series[0].datapoints.length === 0) &&
      this._options.timeRange !== undefined) {
      return this._d3.scaleTime()
        .domain([
          new Date(this._options.timeRange.from),
          new Date(this._options.timeRange.to)
        ])
        .range([0, this.width]);
    }
    // TODO: make this.timeInterval optional and move to base
    return this._d3.scaleTime()
      .domain([
        new Date(_.first(this._series[0].datapoints)[1]),
        new Date(_.last(this._series[0].datapoints)[1] + this.timeInterval)
      ])
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

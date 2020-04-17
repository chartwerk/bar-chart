import { ChartwerkBase, TimeSerie, Options } from '@chartwerk/base';

import * as d3 from 'd3';
import * as _ from 'lodash';


export class ChartwerkBarChart extends ChartwerkBase {
  constructor(el: HTMLElement, _series: TimeSerie[] = [], _options: Options = {}) {
    super(d3, el, _series, _options);
  }

  // TODO: private, type for timeseries
  _renderMetrics(): void {
    for(const i in this._series) {
      // @ts-ignore
      this._series[i].color = this._options.colors[i];
    }
    if(this.visibleSeries.length > 0) {
      for(const idx in this.visibleSeries) {
        this._renderMetric(
          this.visibleSeries[idx].datapoints,
          // @ts-ignore
          { color: this.visibleSeries[idx].color },
          Number(idx)
        );
      }
    } else {
      this._renderNoDataPointsMessage();
    }
    this._renderCrosshair();
    this._useBrush();
  }

  _renderNoDataPointsMessage(): void {
    this._chartContainer.append('text')
      .attr('class', 'alert-text')
      .attr('x', this.width / 2)
      .attr('y', this.height / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'currentColor')
      .text('No data points');
  }

  _renderMetric(datapoints: number[][], options: { color: string }, idx: number): void {
    this._chartContainer.selectAll('bar')
      .data(datapoints)
      .enter().append('rect')
      .attr('class', 'bar-rect')
      .style('fill', options.color)
      .attr('x', (d: [number, number]) => {
        return this.xScale(new Date(d[1])) + idx * this.rectWidth;
      })
      .attr('y', (d: [number, number]) => {
        return this.yScale(Math.max(d[0],0));
      })
      .attr('width', this.rectWidth)
      .attr('height', (d: [number, number]) => this.getBarHeight(d[0]));

    // TODO: use clip instead of display: none
    this._chartContainer.selectAll('.bar-rect').filter(function (d, i, list) {
      return i === list.length - 1;
    }).attr('display', 'none');
  }

  _renderCrosshair(): void {
    this._crosshair = this._chartContainer.append('g')
      .style('display', 'none');

    this._crosshair.append('line')
      .attr('class', 'crosshair-line')
      .attr('id', 'crosshair-line-x')
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', '0.5px');

    this._chartContainer.append('rect')
      .style('fill', 'none')
      .style('stroke', 'none')
      .style('pointer-events', 'all')
      .style('cursor', 'crosshair')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  // TODO: move brush to base
  _useBrush(): void {
    this._brush = this._d3.brushX()
      .extent([
        [0, 0],
        [this.width, this.height]
      ])
      .handleSize(20)
      .filter(() => !this._d3.event.shiftKey)
      .on('end', this.onBrushEnd.bind(this))

    this._chartContainer
      .call(this._brush)
      .on('mouseover', this.onMouseOver.bind(this))
      .on('mouseout', this.onMouseOut.bind(this))
      .on('mousemove', this.onMouseMove.bind(this))
      .on('dblclick', this.zoomOut.bind(this));
  }

  onMouseMove(): void {
    const event = this._d3.mouse(this._chartContainer.node());
    const eventX = event[0];
    if(this.isOutOfChart() === true) {
      this._crosshair.style('display', 'none');
      return;
    }
    this._crosshair.select('#crosshair-line-x')
      .attr('y1', 0).attr('x1', eventX)
      .attr('y2', this.height).attr('x2', eventX);

    if(this._series === undefined || this._series.length === 0) {
      return;
    }

    const bisectDate = this._d3.bisector((d: [number, number]) => d[1]).left;
    const mouseDate = this.xTimeScale.invert(eventX).getTime();

    let idx = bisectDate(this._series[0].datapoints, mouseDate) - 1;

    const series: any[] = [];
    for(let i = 0; i < this._series.length; i++) {
      if(this._series[i].visible === false) {
        continue;
      }
      const y = this.yScale(this._series[i].datapoints[idx][0]);
      const x = this.xScale(this._series[i].datapoints[idx][1]);

      series.push({
        value: this._series[i].datapoints[idx][0],
        color: this._options.colors[i],
        label: this._series[i].alias || this._series[i].target
      });

      this._crosshair.select(`#crosshair-circle-${i}`)
        .attr('cx', x)
        .attr('cy', y);
    }

    this._options.eventsCallbacks.mouseMove({
      x: this._d3.event.clientX,
      y: this._d3.event.clientY,
      time: this._series[0].datapoints[idx][1],
      series
    });
  }

  onMouseOver(): void {
    this._crosshair.style('display', null);
  }

  onMouseOut(): void {
    this._options.eventsCallbacks.mouseOut();
    this._crosshair.style('display', 'none');
  }

  onBrushEnd(): void {
    const extent = this._d3.event.selection;
    if(extent === undefined || extent === null || extent.length < 2) {
      return;
    }
    const startTimestamp = this.xTimeScale.invert(extent[0]).getTime();
    const endTimestamp = this.xTimeScale.invert(extent[1]).getTime();
    const range: [number, number] = [startTimestamp, endTimestamp];
    this._chartContainer
      .call(this._brush.move, null);
    if(this._options.eventsCallbacks !== undefined && this._options.eventsCallbacks.zoomIn !== undefined) {
      this._options.eventsCallbacks.zoomIn(range);
    } else {
      console.log('zoom in, but there is no callback');
    }
  }

  zoomOut(): void {
    if(this.isOutOfChart() === true) {
      return;
    }
    const midTimestamp = this.xTimeScale.invert(this.width / 2).getTime();
    if(this._options.eventsCallbacks !== undefined && this._options.eventsCallbacks.zoomOut !== undefined) {
      this._options.eventsCallbacks.zoomOut(midTimestamp);
    } else {
      console.log('zoom out, but there is no callback');
    }
  }

  get rectWidth(): number {
    if(this._options === undefined) {
      return 20;
    }
    const startTimestamp = _.first(this._series[0].datapoints)[1];
    const interval = this._options.timeInterval * 60 * 1000;
    const width = this.xScale(new Date(startTimestamp + interval)) / 2;
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
}

import { Component, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as Plotly from 'plotly.js-dist-min';
import { ChartService, ChartData } from './chart.service';

@Component({
  selector: 'app-parabola-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ParabolaChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chart') chartEl!: ElementRef;

  plotMin = -3;
  plotMax = 3;

  private destroy$ = new Subject<void>();
  private rendered = false;

  constructor(private chartService: ChartService) {}

  ngAfterViewInit(): void {
    this.rendered = true;

    this.chartService.params$
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.plotMin = params.min;
        this.plotMax = params.max;
      });

    this.chartService.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (this.rendered) {
          // Delay by one frame to ensure DOM layout has settled (essential for popouts)
          requestAnimationFrame(() => this.renderChart(data));
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chartEl?.nativeElement) {
      Plotly.purge(this.chartEl.nativeElement);
    }
  }

  onReset(): void {
    this.chartService.resetRange();
  }

  onRangeChange(): void {
    this.chartService.updateRange(this.plotMin, this.plotMax);
  }

  private renderChart(data: ChartData): void {
    if (!this.chartEl?.nativeElement) return;

    const { x, y } = data;
    const min = x[0];
    const max = x[x.length - 1];

    Plotly.react(this.chartEl.nativeElement, [{
      x, y,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#64c8ff', width: 2 },
      name: 'y = x^2'
    }], {
      title: { text: 'Parabola: y = x^2', font: { color: '#ffffff', size: 16 } },
      xaxis: {
        title: 'x', color: '#b0b0b0',
        gridcolor: 'rgba(255,255,255,0.1)',
        zerolinecolor: 'rgba(255,255,255,0.2)',
        range: [min, max]
      },
      yaxis: {
        title: 'y', color: '#b0b0b0',
        gridcolor: 'rgba(255,255,255,0.1)',
        zerolinecolor: 'rgba(255,255,255,0.2)'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: '#b0b0b0' },
      margin: { l: 50, r: 20, t: 40, b: 40 },
      autosize: true
    }, {
      responsive: true,
      displayModeBar: false
    }).then(() => {
      // CRITICAL: Force a resize calculation AFTER Plotly has rendered its SVG.
      // This solves the measurement race condition in popouts without brittle CSS.
      if (this.chartEl?.nativeElement) {
        Plotly.Plots.resize(this.chartEl.nativeElement);
      }
    });
  }
}

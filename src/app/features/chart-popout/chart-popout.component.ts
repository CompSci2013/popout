import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PopOutContextService } from '../../framework/services/popout-context.service';
import { PopOutMessageType } from '../../framework/models/popout.interface';
import { UrlStateService } from '../../framework/services/url-state.service';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-chart-popout',
  templateUrl: './chart-popout.component.html',
  styleUrls: ['./chart-popout.component.scss']
})
export class ChartPopoutComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chart') chartEl!: ElementRef;

  plotMin = -3;
  plotMax = 3;

  private destroy$ = new Subject<void>();
  private panelId = '';

  constructor(
    private route: ActivatedRoute,
    private popOutContext: PopOutContextService,
    private urlState: UrlStateService
  ) {}

  ngOnInit(): void {
    this.panelId = this.route.snapshot.paramMap.get('panelId') || 'parabola';

    // Initialize from URL query params
    this.urlState.watchParams()
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: any) => {
        let changed = false;
        if (params['min'] !== undefined && Number(params['min']) !== this.plotMin) {
          this.plotMin = Number(params['min']);
          changed = true;
        }
        if (params['max'] !== undefined && Number(params['max']) !== this.plotMax) {
          this.plotMax = Number(params['max']);
          changed = true;
        }
        if (changed) this.renderChart();
      });

    this.popOutContext.initializeAsPopOut(this.panelId);

    // Listen for messages from main window
    this.popOutContext.getMessages$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.type === PopOutMessageType.CLOSE_POPOUT) {
          window.close();
        }
        if (message.type === PopOutMessageType.STATE_UPDATE) {
          const state = message.payload?.state;
          if (state?.type === 'PLOT_RANGE') {
            this.plotMin = Number(state.min);
            this.plotMax = Number(state.max);
            this.urlState.setParams({ min: this.plotMin, max: this.plotMax }, true);
            this.renderChart();
          }
        }
      });

    this.popOutContext.sendMessage({
      type: PopOutMessageType.PANEL_READY,
      timestamp: Date.now()
    });
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnDestroy(): void {
    if (this.chartEl?.nativeElement) {
      Plotly.purge(this.chartEl.nativeElement);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private renderChart(): void {
    if (!this.chartEl?.nativeElement) return;

    const min = this.plotMin;
    const max = this.plotMax;
    const step = (max - min) / 200;
    const x: number[] = [];
    const y: number[] = [];

    for (let v = min; v <= max; v += step) {
      x.push(Math.round(v * 1000) / 1000);
      y.push(v * v);
    }

    const data: Plotly.Data[] = [{
      x, y,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#64c8ff', width: 2 },
      name: 'y = x^2'
    }];

    const layout: Partial<Plotly.Layout> = {
      title: { text: 'Parabola: y = x^2', font: { color: '#ffffff', size: 18 } },
      xaxis: {
        title: 'x',
        color: '#b0b0b0',
        gridcolor: 'rgba(255,255,255,0.1)',
        zerolinecolor: 'rgba(255,255,255,0.2)',
        range: [min, max]
      },
      yaxis: {
        title: 'y',
        color: '#b0b0b0',
        gridcolor: 'rgba(255,255,255,0.1)',
        zerolinecolor: 'rgba(255,255,255,0.2)'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: '#b0b0b0' },
      margin: { l: 50, r: 30, t: 50, b: 50 },
      autosize: true
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: 'hover'
    };

    Plotly.react(this.chartEl.nativeElement, data, layout, config);
  }
}

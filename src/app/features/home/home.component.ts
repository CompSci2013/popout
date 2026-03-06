import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { PopOutManagerService } from '../../framework/services/popout-manager.service';
import { PopOutContextService } from '../../framework/services/popout-context.service';
import { UrlStateService } from '../../framework/services/url-state.service';
import { PopOutMessageType } from '../../framework/models/popout.interface';
import * as Plotly from 'plotly.js-dist-min';

interface DomainTile {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [PopOutManagerService, PopOutContextService]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('parabolaChart') parabolaChartEl!: ElementRef;

  tiles: DomainTile[] = [
    { id: 'auto', icon: '🚗', title: 'Automobiles', description: 'Vehicle data' },
    { id: 'agriculture', icon: '🌾', title: 'Agriculture', description: 'Agricultural data analysis' },
    { id: 'physics', icon: '⚛️', title: 'Physics', description: 'Physics research data' },
    { id: 'chemistry', icon: '🧪', title: 'Chemistry', description: 'Chemical compound data' },
    { id: 'mathematics', icon: '📐', title: 'Mathematics', description: 'Mathematical datasets' }
  ];

  tileInputs: { [key: string]: string } = {};
  poppedOutTiles = new Set<string>();

  plotMin = -3;
  plotMax = 3;
  chartPoppedOut = false;

  private destroy$ = new Subject<void>();
  private inputChanges: { [key: string]: Subject<string> } = {};
  private plotRangeChange$ = new Subject<void>();

  constructor(
    private popOutManager: PopOutManagerService,
    private urlState: UrlStateService,
    private route: ActivatedRoute
  ) {
    this.tiles.forEach(tile => {
      this.tileInputs[tile.id] = '';
      this.inputChanges[tile.id] = new Subject<string>();
    });
  }

  ngOnInit(): void {
    this.popOutManager.initialize('home');

    // Initialize min/max from URL params
    const params = this.urlState.getParams<any>();
    if (params['min'] !== undefined) this.plotMin = Number(params['min']);
    if (params['max'] !== undefined) this.plotMax = Number(params['max']);

    // If no URL params yet, set defaults
    if (params['min'] === undefined || params['max'] === undefined) {
      this.urlState.setParams({ min: this.plotMin, max: this.plotMax }, true);
    }

    // Watch URL param changes
    this.urlState.watchParams()
      .pipe(takeUntil(this.destroy$))
      .subscribe((p: any) => {
        if (p['min'] !== undefined) this.plotMin = Number(p['min']);
        if (p['max'] !== undefined) this.plotMax = Number(p['max']);
      });

    // Handle popout closed
    this.popOutManager.closed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(panelId => {
        this.poppedOutTiles.delete(panelId);
        if (panelId === 'parabola') {
          this.chartPoppedOut = false;
          setTimeout(() => this.renderChart(), 50);
        }
      });

    // Handle messages from popouts (URL_PARAMS_CHANGED)
    this.popOutManager.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ panelId, message }) => {
        if (message.type === PopOutMessageType.URL_PARAMS_CHANGED) {
          const tileId = message.payload?.params?.tile;
          const text = message.payload?.params?.text || '';
          if (tileId && this.tileInputs.hasOwnProperty(tileId)) {
            this.tileInputs[tileId] = text;
          }
        }
      });

    // Debounce plot range changes -> update URL + sync to popout
    this.plotRangeChange$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.urlState.setParams({ min: this.plotMin, max: this.plotMax }, true);
        this.renderChart();
        if (this.chartPoppedOut) {
          this.popOutManager.broadcastState({
            type: 'PLOT_RANGE',
            min: this.plotMin,
            max: this.plotMax
          });
        }
      });

    // Set up debounced input sync for each tile
    this.tiles.forEach(tile => {
      this.inputChanges[tile.id]
        .pipe(
          debounceTime(300),
          takeUntil(this.destroy$)
        )
        .subscribe(text => {
          if (this.poppedOutTiles.has(tile.id)) {
            this.popOutManager.broadcastState({ tile: tile.id, text });
          }
        });
    });
  }

  ngAfterViewInit(): void {
    if (!this.chartPoppedOut) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.plotRangeChange$.complete();
    Object.values(this.inputChanges).forEach(s => s.complete());
  }

  isPoppedOut(tileId: string): boolean {
    return this.poppedOutTiles.has(tileId);
  }

  onInputChange(tileId: string, value: string): void {
    this.tileInputs[tileId] = value;
    this.inputChanges[tileId].next(value);
  }

  onPlotRangeChange(): void {
    this.plotRangeChange$.next();
  }

  openPopOut(tile: DomainTile): void {
    if (this.poppedOutTiles.has(tile.id)) {
      return;
    }

    const text = this.tileInputs[tile.id] || '';
    const success = this.popOutManager.openPopOut(tile.id, `tile?text=${encodeURIComponent(text)}`, {
      width: 400,
      height: 400
    });

    if (success) {
      this.poppedOutTiles.add(tile.id);
    }
  }

  openChartPopOut(): void {
    if (this.chartPoppedOut) return;

    const success = this.popOutManager.openPopOut(
      'parabola',
      `chart?min=${this.plotMin}&max=${this.plotMax}`,
      { width: 700, height: 550 }
    );

    if (success) {
      this.chartPoppedOut = true;
    }
  }

  private renderChart(): void {
    if (!this.parabolaChartEl?.nativeElement) return;

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
      title: { text: 'Parabola: y = x^2', font: { color: '#ffffff', size: 16 } },
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
      margin: { l: 50, r: 20, t: 40, b: 40 },
      autosize: true
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: false
    };

    Plotly.react(this.parabolaChartEl.nativeElement, data, layout, config);
  }
}

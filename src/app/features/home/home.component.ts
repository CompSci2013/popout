import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { PopOutManagerService } from '../../framework/services/popout-manager.service';
import { PopOutContextService } from '../../framework/services/popout-context.service';
import { PopOutMessageType } from '../../framework/models/popout.interface';
import { TileComponent } from '../tile/tile.component';
import { ParabolaChartComponent } from '../chart/chart.component';
import { ChartService } from '../chart/chart.service';

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
export class HomeComponent implements OnInit, OnDestroy {
  tiles: DomainTile[] = [
    { id: 'auto', icon: '🚗', title: 'Automobiles', description: 'Vehicle data' },
    { id: 'agriculture', icon: '🌾', title: 'Agriculture', description: 'Agricultural data analysis' },
    { id: 'physics', icon: '⚛️', title: 'Physics', description: 'Physics research data' },
    { id: 'chemistry', icon: '🧪', title: 'Chemistry', description: 'Chemical compound data' },
    { id: 'mathematics', icon: '📐', title: 'Mathematics', description: 'Mathematical datasets' }
  ];

  tileInputs: { [key: string]: string } = {};
  poppedOutTiles = new Set<string>();
  chartPoppedOut = false;
  plotMin = -3;
  plotMax = 3;

  private destroy$ = new Subject<void>();
  private inputChanges: { [key: string]: Subject<string> } = {};

  constructor(
    private popOutManager: PopOutManagerService,
    private chartService: ChartService
  ) {
    this.tiles.forEach(tile => {
      this.tileInputs[tile.id] = '';
      this.inputChanges[tile.id] = new Subject<string>();
    });
  }

  ngOnInit(): void {
    this.popOutManager.initialize('home');

    // Sync chart params from service
    this.chartService.params$
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.plotMin = params.min;
        this.plotMax = params.max;
      });

    // Handle popout closed
    this.popOutManager.closed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(panelId => {
        this.poppedOutTiles.delete(panelId);
        if (panelId === 'parabola') {
          this.chartPoppedOut = false;
        }
      });

    // Handle messages from popouts (tile text changes)
    this.popOutManager.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ panelId, message }) => {
        if (message.type === PopOutMessageType.URL_PARAMS_CHANGED) {
          const msgParams = message.payload?.params;
          const tileId = msgParams?.panelId || panelId;
          const text = msgParams?.text || '';
          if (tileId && this.tileInputs.hasOwnProperty(tileId)) {
            this.tileInputs[tileId] = text;
          }
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
            this.popOutManager.updatePopoutData(tile.id, 'inputText', text);
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    Object.values(this.inputChanges).forEach(s => s.complete());
  }

  isPoppedOut(tileId: string): boolean {
    return this.poppedOutTiles.has(tileId);
  }

  onPlotRangeChange(): void {
    this.chartService.updateRange(this.plotMin, this.plotMax);
  }

  onInputChange(tileId: string, value: string): void {
    this.tileInputs[tileId] = value;
    this.inputChanges[tileId].next(value);
  }

  openPopOut(tile: DomainTile): void {
    if (this.poppedOutTiles.has(tile.id)) {
      return;
    }

    const text = this.tileInputs[tile.id] || '';
    const success = this.popOutManager.openPopOut(
      tile.id,
      TileComponent,
      { tile, inputText: text, panelId: tile.id },
      { width: 400, height: 400 }
    );

    if (success) {
      this.poppedOutTiles.add(tile.id);
    }
  }

  openChartPopOut(): void {
    if (this.chartPoppedOut) return;

    const success = this.popOutManager.openPopOut(
      'parabola',
      ParabolaChartComponent,
      {},
      { width: 700, height: 500 }
    );

    if (success) {
      this.chartPoppedOut = true;
    }
  }
}

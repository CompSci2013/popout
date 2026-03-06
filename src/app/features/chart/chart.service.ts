import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { UrlStateService } from '../../framework/services/url-state.service';

export interface ChartParams {
  min: number;
  max: number;
}

export interface ChartData {
  x: number[];
  y: number[];
}

const DEFAULTS: ChartParams = { min: -3, max: 3 };

@Injectable({ providedIn: 'root' })
export class ChartService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private paramsSubject = new BehaviorSubject<ChartParams>(DEFAULTS);
  private dataSubject = new BehaviorSubject<ChartData>(this.computeData(DEFAULTS));
  private rangeInput$ = new Subject<ChartParams>();

  readonly params$: Observable<ChartParams> = this.paramsSubject.asObservable();
  readonly data$: Observable<ChartData> = this.dataSubject.asObservable();

  constructor(private urlState: UrlStateService) {
    // URL changes feed params (main window path)
    this.urlState.watchParams<any>().pipe(
      map(p => ({
        min: p.min !== undefined ? Number(p.min) : DEFAULTS.min,
        max: p.max !== undefined ? Number(p.max) : DEFAULTS.max
      })),
      distinctUntilChanged((a, b) => a.min === b.min && a.max === b.max),
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.paramsSubject.next(params);
    });

    // Debounced range input → update params + URL
    this.rangeInput$.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.paramsSubject.next(params);
      this.urlState.setParams({ min: params.min, max: params.max }, true);
    });

    // Params → data
    this.paramsSubject.pipe(
      distinctUntilChanged((a, b) => a.min === b.min && a.max === b.max),
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.dataSubject.next(this.computeData(params));
    });
  }

  updateRange(min: number, max: number): void {
    this.rangeInput$.next({ min, max });
  }

  resetRange(): void {
    this.paramsSubject.next(DEFAULTS);
    this.urlState.setParams({ min: DEFAULTS.min, max: DEFAULTS.max }, true);
  }

  private computeData(params: ChartParams): ChartData {
    const { min, max } = params;
    const step = (max - min) / 200;
    const x: number[] = [];
    const y: number[] = [];

    for (let v = min; v <= max; v += step) {
      x.push(Math.round(v * 1000) / 1000);
      y.push(v * v);
    }

    return { x, y };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

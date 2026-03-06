import { Component, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

export interface DomainTile {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnDestroy {
  tile: DomainTile | null = null;
  inputText = '';
  panelId = '';

  @Output() textChanged = new EventEmitter<{ panelId: string; text: string }>();

  private destroy$ = new Subject<void>();
  private inputChange$ = new Subject<string>();

  constructor() {
    this.inputChange$
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(text => {
        this.textChanged.emit({ panelId: this.panelId, text });
      });
  }

  onInputChange(value: string): void {
    this.inputChange$.next(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

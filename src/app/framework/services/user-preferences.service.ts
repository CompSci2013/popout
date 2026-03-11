import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';

/**
 * A single user preference — generic key/value pair.
 * The service has no knowledge of what "theme" means or how it's applied.
 */
export interface UserPreference {
  key: string;
  value: string;
}

const API_URL = 'assets/user-preferences.json';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private preferences$ = new BehaviorSubject<UserPreference[]>([]);

  /** Observable of all user preferences — subscribe and filter by key. */
  readonly all$: Observable<UserPreference[]> = this.preferences$.asObservable();

  constructor(private http: HttpClient) {
    this.loadPreferences();
  }

  /**
   * Get a specific preference value by key.
   * Returns an Observable that emits whenever that key's value changes.
   */
  getPreference$(key: string): Observable<string | undefined> {
    return this.all$.pipe(
      map(prefs => prefs.find(p => p.key === key)?.value)
    );
  }

  /** Synchronous snapshot of a preference value. */
  getPreference(key: string): string | undefined {
    return this.preferences$.value.find(p => p.key === key)?.value;
  }

  /**
   * Update a preference and persist via API.
   * If the key exists, its value is replaced. If not, a new entry is added.
   */
  setPreference(key: string, value: string): void {
    const current = [...this.preferences$.value];
    const idx = current.findIndex(p => p.key === key);
    if (idx >= 0) {
      current[idx] = { key, value };
    } else {
      current.push({ key, value });
    }
    this.preferences$.next(current);
    this.savePreferences(current);
  }

  // ---------------------------------------------------------------------------
  // Fake REST API — reads/writes a local JSON asset.
  //
  // In production, these would be real HTTP calls:
  //   GET  /api/user/preferences        → [{ key, value }, ...]
  //   PUT  /api/user/preferences        → [{ key, value }, ...]
  //
  // Because Angular's dev server serves assets read-only, the PUT is simulated
  // with a console log. The GET works normally via HttpClient.
  // ---------------------------------------------------------------------------

  private loadPreferences(): void {
    this.http.get<UserPreference[]>(API_URL).subscribe({
      next: (prefs) => {
        if (Array.isArray(prefs)) {
          this.preferences$.next(prefs);
        }
      },
      error: () => {
        // First run or missing file — empty preferences, consumers use defaults.
      }
    });
  }

  private savePreferences(prefs: UserPreference[]): void {
    // Simulate PUT /api/user/preferences
    console.log(
      `[UserPreferencesService] PUT ${API_URL}`,
      JSON.stringify(prefs)
    );
  }
}

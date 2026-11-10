import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FeatureDoc, PageDoc, StepDoc } from '../models/content';

/**
 * Loads all site content from the API once, at app start, into signals.
 * Pages read these signals (through the helpers below), so content appears as soon as it arrives
 * and is already in the HTML when the page is rendered on the server.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  /** Same-origin API: answered by the Cloudflare Worker from D1 (worker/index.mjs). */
  private readonly apiUrl = '/api';

  readonly pages = signal<PageDoc[]>([]);
  readonly features = signal<FeatureDoc[]>([]);
  readonly steps = signal<StepDoc[]>([]);

  constructor() {
    this.load('pages', this.pages);
    this.load('features', this.features);
    this.load('steps', this.steps);
  }

  /** The content record for one page; follows `pageId` when it changes. */
  page(pageId: () => string): Signal<PageDoc | undefined> {
    return computed(() => this.pages().find((p) => p._id === pageId()));
  }
  featuresFor(pageId: () => string): Signal<FeatureDoc[]> {
    return computed(() => this.features().filter((f) => f.page === pageId()));
  }
  stepsFor(pageId: () => string): Signal<StepDoc[]> {
    return computed(() => this.steps().filter((s) => s.page === pageId()));
  }

  private load<T>(collection: string, target: WritableSignal<T[]>): void {
    this.http.get<T[]>(`${this.apiUrl}/${collection}`).subscribe({
      next: (data) => target.set(data ?? []),
      error: () => target.set([]),
    });
  }
}

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { API_URL, PAGE_SIZE, DEFAULT_FILTERS } from '../lib/types';
import type { Card, FilterState } from '../lib/types';
import { deriveLanguages, deriveSets, filterAndSortCards } from '../lib/card-query';
import { buildUrlFromState, findCardByParam, parseUrlState, sanitizeUrlFilters, type ParsedUrlState } from '../lib/url-state';
import { DEFAULT_LOCALE, cardCountLabel, t, type Locale } from '../lib/i18n';
import gbFlag from '../assets/flags/gb.svg';
import seFlag from '../assets/flags/se.svg';
import './rauk-filter-bar';
import './rauk-card-grid';
import './rauk-modal';

@customElement('rauk-app')
export class RaukApp extends LitElement {
  override createRenderRoot() { return this; }

  private static readonly LOCALE_STORAGE_KEY = 'rauk-locale';

  @state() private allCards: Card[] = [];
  @state() private filteredCards: Card[] = [];
  @state() private visibleCount = PAGE_SIZE;
  @state() private selectedCard: Card | null = null;
  @state() private filters: FilterState = { ...DEFAULT_FILTERS };
  @state() private loading = true;
  @state() private error = '';
  @state() private locale: Locale = DEFAULT_LOCALE;

  private pendingUrlState: ParsedUrlState | null = null;
  private isApplyingUrlState = false;

  private readonly onPopState = (): void => {
    this.applyUrlStateFromLocation();
  };

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.initializeLocale();
    document.body.classList.remove('theme-raukar-subtle', 'theme-raukar-dramatic');
    document.body.classList.add('theme-raukar-balanced');
    this.pendingUrlState = this.parseUrlStateFromLocation();
    window.addEventListener('popstate', this.onPopState);
    await this.loadData();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.onPopState);
  }

  private initializeLocale(): void {
    const stored = localStorage.getItem(RaukApp.LOCALE_STORAGE_KEY);
    if (stored === 'en' || stored === 'sv') {
      this.locale = stored;
    }
    document.documentElement.lang = this.locale;
  }

  private setLocale(locale: Locale): void {
    if (this.locale === locale) return;
    this.locale = locale;
    localStorage.setItem(RaukApp.LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }

  private async loadData(): Promise<void> {
    try {
      const res = await fetch(API_URL);
      const data: Card[] = await res.json();
      this.allCards = data.filter(c => /pok[eé]mon/i.test(c.Game));
      if (this.pendingUrlState) {
        this.applyUrlState(this.pendingUrlState);
        this.pendingUrlState = null;
      } else {
        this.applyFilters();
      }
      this.loading = false;
    } catch {
      this.error = t(this.locale, 'app.errorLoad');
      this.loading = false;
    }
  }

  private parseUrlStateFromLocation(): { filters: Partial<FilterState>; cardId: string | null } {
    return parseUrlState(window.location.search);
  }

  private sanitizeUrlFilters(raw: Partial<FilterState>, base: FilterState = this.filters): FilterState {
    return sanitizeUrlFilters(raw, this.allCards, base, DEFAULT_FILTERS);
  }

  private findCardByParam(cardIdParam: string | null): Card | null {
    return findCardByParam(cardIdParam, this.allCards);
  }

  private applyUrlState(urlState: ParsedUrlState): void {
    this.isApplyingUrlState = true;
    this.filters = this.sanitizeUrlFilters(urlState.filters);
    this.applyFilters();
    this.selectedCard = this.findCardByParam(urlState.cardId);
    this.isApplyingUrlState = false;
  }

  private applyUrlStateFromLocation(): void {
    if (!this.allCards.length) {
      this.pendingUrlState = this.parseUrlStateFromLocation();
      return;
    }
    this.applyUrlState(this.parseUrlStateFromLocation());
  }

  private syncUrlFromState(mode: 'replace' | 'push'): void {
    if (this.isApplyingUrlState) return;

    const nextUrl = buildUrlFromState(window.location.href, this.filters, this.selectedCard, DEFAULT_FILTERS);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl === currentUrl) return;

    if (mode === 'push') {
      window.history.pushState(null, '', nextUrl);
      return;
    }

    window.history.replaceState(null, '', nextUrl);
  }

  private get languages(): string[] {
    return deriveLanguages(this.allCards);
  }

  private get sets(): string[] {
    return deriveSets(this.allCards, this.filters.language);
  }

  private applyFilters(): void {
    this.filteredCards = filterAndSortCards(this.allCards, this.filters);
    this.visibleCount = PAGE_SIZE;
  }

  private onFilterChange(e: Event): void {
    this.filters = (e as CustomEvent<FilterState>).detail;
    this.applyFilters();
    this.syncUrlFromState('replace');
  }

  private onCardSelect(e: Event): void {
    this.selectedCard = (e as CustomEvent<Card>).detail;
    this.syncUrlFromState('push');
  }

  private onLoadMore(): void {
    this.visibleCount += PAGE_SIZE;
  }

  private onSortChange(e: Event): void {
    this.filters = {
      ...this.filters,
      sort: (e.target as HTMLSelectElement).value,
    };
    this.applyFilters();
    this.syncUrlFromState('replace');
  }

  private onModalClose(): void {
    this.selectedCard = null;
    this.syncUrlFromState('push');
  }

  private reset(): void {
    this.filters = { ...DEFAULT_FILTERS };
    this.applyFilters();
    this.syncUrlFromState('replace');
  }

  private get hasActiveFilters(): boolean {
    const f = this.filters;
    return (
      f.query !== DEFAULT_FILTERS.query
      || f.language !== DEFAULT_FILTERS.language
      || f.sets.length > 0
      || f.grade !== DEFAULT_FILTERS.grade
      || f.sort !== DEFAULT_FILTERS.sort
    );
  }

  override render() {
    const visible   = this.filteredCards.slice(0, this.visibleCount);
    const hasMore   = this.filteredCards.length > this.visibleCount;
    const remaining = this.filteredCards.length - this.visibleCount;
    const count     = this.filteredCards.length;

    return html`
      <div class="locale-switch" role="group" aria-label="Language switcher">
        <button
          type="button"
          class="locale-btn ${this.locale === 'en' ? 'is-active' : ''}"
          @click=${() => this.setLocale('en')}
          aria-label=${t(this.locale, 'app.locale.switchToEnglish')}
          aria-pressed=${String(this.locale === 'en')}
        ><img class="flag-icon" src=${gbFlag} alt="" aria-hidden="true" decoding="async" /></button>
        <button
          type="button"
          class="locale-btn ${this.locale === 'sv' ? 'is-active' : ''}"
          @click=${() => this.setLocale('sv')}
          aria-label=${t(this.locale, 'app.locale.switchToSwedish')}
          aria-pressed=${String(this.locale === 'sv')}
        ><img class="flag-icon" src=${seFlag} alt="" aria-hidden="true" decoding="async" /></button>
      </div>

      <header class="personality-shell personality-header bg-raukar-balanced">
        <h1>${t(this.locale, 'app.title')}</h1>
        <p class="subtitle">${t(this.locale, 'app.subtitle', { count: this.allCards.length })}</p>
      </header>

      <rauk-filter-bar
        .filters=${this.filters}
        .languages=${this.languages}
        .sets=${this.sets}
        .locale=${this.locale}
        @rauk-filter-change=${this.onFilterChange}
      ></rauk-filter-bar>

      <div class="results-bar personality-shell personality-results bg-raukar-subtle">
        <span>${cardCountLabel(this.locale, count)}</span>
        <div class="results-actions">
          <button
            class="reset-btn ${this.hasActiveFilters ? '' : 'is-hidden'}"
            @click=${this.reset}
            ?disabled=${!this.hasActiveFilters}
            aria-hidden=${String(!this.hasActiveFilters)}
          >${t(this.locale, 'app.resetFilters')}</button>

          <select
            class="sort-select"
            @change=${this.onSortChange}
            .value=${this.filters.sort}
            aria-label=${t(this.locale, 'app.sortCards')}
          >
            <option value="date-desc">${t(this.locale, 'filters.sortNewest')}</option>
            <option value="date-asc">${t(this.locale, 'filters.sortOldest')}</option>
            <option value="grade-desc">${t(this.locale, 'filters.sortGradeHighLow')}</option>
            <option value="grade-asc">${t(this.locale, 'filters.sortGradeLowHigh')}</option>
            <option value="name-asc">${t(this.locale, 'filters.sortNameAZ')}</option>
          </select>
        </div>
      </div>

      ${this.loading
        ? html`<div class="loading">${t(this.locale, 'app.loadingCollection')}</div>`
        : this.error
          ? html`<div class="loading">${this.error}</div>`
          : html`
            <rauk-card-grid
              .cards=${visible}
              .hasMore=${hasMore}
              .remaining=${remaining}
              .locale=${this.locale}
              @rauk-card-select=${this.onCardSelect}
              @rauk-load-more=${this.onLoadMore}
            ></rauk-card-grid>
          `}

      ${this.selectedCard ? html`
        <rauk-modal
          .card=${this.selectedCard}
          .allCards=${this.allCards}
          .locale=${this.locale}
          @rauk-modal-close=${this.onModalClose}
        ></rauk-modal>
      ` : ''}
    `;
  }
}

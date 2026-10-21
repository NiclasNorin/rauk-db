import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { API_URL, PAGE_SIZE, DEFAULT_FILTERS } from '../lib/types';
import type { Card, FilterState } from '../lib/types';
import { getLanguage, gradeNumeric, compareCardsByGradeAndSubgrades } from '../lib/utils';
import './rauk-filter-bar';
import './rauk-card-grid';
import './rauk-modal';

@customElement('rauk-app')
export class RaukApp extends LitElement {
  override createRenderRoot() { return this; }

  @state() private allCards: Card[] = [];
  @state() private filteredCards: Card[] = [];
  @state() private visibleCount = PAGE_SIZE;
  @state() private selectedCard: Card | null = null;
  @state() private filters: FilterState = { ...DEFAULT_FILTERS };
  @state() private loading = true;
  @state() private error = '';

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    document.body.classList.remove('theme-raukar-subtle', 'theme-raukar-dramatic');
    document.body.classList.add('theme-raukar-balanced');
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const res = await fetch(API_URL);
      const data: Card[] = await res.json();
      this.allCards = data.filter(c => /pok[eé]mon/i.test(c.Game));
      this.applyFilters();
      this.loading = false;
    } catch {
      this.error = 'Failed to load collection. Please try again.';
      this.loading = false;
    }
  }

  private get languages(): string[] {
    return [...new Set(this.allCards.map(c => getLanguage(c.Game)))].sort();
  }

  private get sets(): string[] {
    const scope = this.filters.language
      ? this.allCards.filter(c => getLanguage(c.Game) === this.filters.language)
      : this.allCards;
    return [...new Set(scope.map(c => c.Set))].sort();
  }

  private applyFilters(): void {
    const { query, language, set, grade, sort } = this.filters;
    const q = query.trim().toLowerCase();
    const normalizedQ = q.startsWith('#') ? q.slice(1) : q;

    let results = this.allCards.filter(card => {
      if (language && getLanguage(card.Game) !== language) return false;
      if (set && card.Set !== set) return false;
      if (grade) {
        if (grade === 'CE')  { if (card.Grade !== 'CE') return false; }
        else if (grade === '7') { if (gradeNumeric(card.Grade) > 7 || card.Grade === 'CE') return false; }
        else { if (card.Grade !== grade) return false; }
      }
      if (q) {
        const searchable = `${card['Card Name']} ${card.Set}`.toLowerCase();
        const cardId = card.id.toLowerCase();
        const normalizedCardId = cardId.startsWith('#') ? cardId.slice(1) : cardId;
        const matchesText = searchable.includes(q);
        const matchesId = cardId.includes(q)
          || normalizedCardId.includes(normalizedQ)
          || cardId.includes(normalizedQ);
        if (!matchesText && !matchesId) return false;
      }
      return true;
    });

    results.sort((a, b) => {
      const aDate = a['Date Graded'] ?? '';
      const bDate = b['Date Graded'] ?? '';
      switch (sort) {
        case 'date-asc':   return aDate.localeCompare(bDate);
        case 'date-desc':  return bDate.localeCompare(aDate);
        case 'grade-desc': return compareCardsByGradeAndSubgrades(a, b, false);
        case 'grade-asc':  return compareCardsByGradeAndSubgrades(a, b, true);
        case 'name-asc':   return a['Card Name'].localeCompare(b['Card Name']);
        default:           return 0;
      }
    });

    this.filteredCards = results;
    this.visibleCount = PAGE_SIZE;
  }

  private onFilterChange(e: Event): void {
    this.filters = (e as CustomEvent<FilterState>).detail;
    this.applyFilters();
  }

  private onCardSelect(e: Event): void {
    this.selectedCard = (e as CustomEvent<Card>).detail;
  }

  private onLoadMore(): void {
    this.visibleCount += PAGE_SIZE;
  }

  private onModalClose(): void {
    this.selectedCard = null;
  }

  private reset(): void {
    this.filters = { ...DEFAULT_FILTERS };
    this.applyFilters();
  }

  override render() {
    const visible   = this.filteredCards.slice(0, this.visibleCount);
    const hasMore   = this.filteredCards.length > this.visibleCount;
    const remaining = this.filteredCards.length - this.visibleCount;
    const count     = this.filteredCards.length;

    return html`
      <header class="personality-shell personality-header bg-raukar-balanced">
        <h1>RaukCard Pokémon Card Collection</h1>
        <p class="subtitle">${this.allCards.length} Pokémon cards in collection</p>
      </header>

      <rauk-filter-bar
        .filters=${this.filters}
        .languages=${this.languages}
        .sets=${this.sets}
        @rauk-filter-change=${this.onFilterChange}
      ></rauk-filter-bar>

      <div class="results-bar personality-shell personality-results bg-raukar-subtle">
        <span>${count} card${count !== 1 ? 's' : ''}</span>
        <button class="reset-btn" @click=${this.reset}>Reset filters</button>
      </div>

      ${this.loading
        ? html`<div class="loading">Loading collection…</div>`
        : this.error
          ? html`<div class="loading">${this.error}</div>`
          : html`
            <rauk-card-grid
              .cards=${visible}
              .hasMore=${hasMore}
              .remaining=${remaining}
              @rauk-card-select=${this.onCardSelect}
              @rauk-load-more=${this.onLoadMore}
            ></rauk-card-grid>
          `}

      ${this.selectedCard ? html`
        <rauk-modal
          .card=${this.selectedCard}
          .allCards=${this.allCards}
          @rauk-modal-close=${this.onModalClose}
        ></rauk-modal>
      ` : ''}
    `;
  }
}

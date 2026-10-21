var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RaukApp_1;
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { API_URL, PAGE_SIZE, DEFAULT_FILTERS } from '../lib/types';
import { getLanguage, gradeNumeric, compareCardsByGradeAndSubgrades } from '../lib/utils';
import { DEFAULT_LOCALE, cardCountLabel, t } from '../lib/i18n';
import gbFlag from '../assets/flags/gb.svg';
import seFlag from '../assets/flags/se.svg';
import './rauk-filter-bar';
import './rauk-card-grid';
import './rauk-modal';
let RaukApp = RaukApp_1 = class RaukApp extends LitElement {
    constructor() {
        super(...arguments);
        this.allCards = [];
        this.filteredCards = [];
        this.visibleCount = PAGE_SIZE;
        this.selectedCard = null;
        this.filters = { ...DEFAULT_FILTERS };
        this.loading = true;
        this.error = '';
        this.locale = DEFAULT_LOCALE;
    }
    createRenderRoot() { return this; }
    async connectedCallback() {
        super.connectedCallback();
        this.initializeLocale();
        document.body.classList.remove('theme-raukar-subtle', 'theme-raukar-dramatic');
        document.body.classList.add('theme-raukar-balanced');
        await this.loadData();
    }
    initializeLocale() {
        const stored = localStorage.getItem(RaukApp_1.LOCALE_STORAGE_KEY);
        if (stored === 'en' || stored === 'sv') {
            this.locale = stored;
        }
        document.documentElement.lang = this.locale;
    }
    setLocale(locale) {
        if (this.locale === locale)
            return;
        this.locale = locale;
        localStorage.setItem(RaukApp_1.LOCALE_STORAGE_KEY, locale);
        document.documentElement.lang = locale;
    }
    async loadData() {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            this.allCards = data.filter(c => /pok[eé]mon/i.test(c.Game));
            this.applyFilters();
            this.loading = false;
        }
        catch {
            this.error = t(this.locale, 'app.errorLoad');
            this.loading = false;
        }
    }
    get languages() {
        return [...new Set(this.allCards.map(c => getLanguage(c.Game)))].sort();
    }
    get sets() {
        const scope = this.filters.language
            ? this.allCards.filter(c => getLanguage(c.Game) === this.filters.language)
            : this.allCards;
        return [...new Set(scope.map(c => c.Set))].sort();
    }
    applyFilters() {
        const { query, language, sets, grade, sort } = this.filters;
        const q = query.trim().toLowerCase();
        const normalizedQ = q.startsWith('#') ? q.slice(1) : q;
        let results = this.allCards.filter(card => {
            if (language && getLanguage(card.Game) !== language)
                return false;
            if (sets.length && !sets.includes(card.Set))
                return false;
            if (grade) {
                if (grade === 'CE') {
                    if (card.Grade !== 'CE')
                        return false;
                }
                else if (grade === '7') {
                    if (gradeNumeric(card.Grade) > 7 || card.Grade === 'CE')
                        return false;
                }
                else {
                    if (card.Grade !== grade)
                        return false;
                }
            }
            if (q) {
                const searchable = `${card['Card Name']} ${card.Set}`.toLowerCase();
                const cardId = card.id.toLowerCase();
                const normalizedCardId = cardId.startsWith('#') ? cardId.slice(1) : cardId;
                const matchesText = searchable.includes(q);
                const matchesId = cardId.includes(q)
                    || normalizedCardId.includes(normalizedQ)
                    || cardId.includes(normalizedQ);
                if (!matchesText && !matchesId)
                    return false;
            }
            return true;
        });
        results.sort((a, b) => {
            const aDate = a['Date Graded'] ?? '';
            const bDate = b['Date Graded'] ?? '';
            switch (sort) {
                case 'date-asc': return aDate.localeCompare(bDate);
                case 'date-desc': return bDate.localeCompare(aDate);
                case 'grade-desc': return compareCardsByGradeAndSubgrades(a, b, false);
                case 'grade-asc': return compareCardsByGradeAndSubgrades(a, b, true);
                case 'name-asc': return a['Card Name'].localeCompare(b['Card Name']);
                default: return 0;
            }
        });
        this.filteredCards = results;
        this.visibleCount = PAGE_SIZE;
    }
    onFilterChange(e) {
        this.filters = e.detail;
        this.applyFilters();
    }
    onCardSelect(e) {
        this.selectedCard = e.detail;
    }
    onLoadMore() {
        this.visibleCount += PAGE_SIZE;
    }
    onModalClose() {
        this.selectedCard = null;
    }
    reset() {
        this.filters = { ...DEFAULT_FILTERS };
        this.applyFilters();
    }
    get hasActiveFilters() {
        const f = this.filters;
        return (f.query !== DEFAULT_FILTERS.query
            || f.language !== DEFAULT_FILTERS.language
            || f.sets.length > 0
            || f.grade !== DEFAULT_FILTERS.grade
            || f.sort !== DEFAULT_FILTERS.sort);
    }
    render() {
        const visible = this.filteredCards.slice(0, this.visibleCount);
        const hasMore = this.filteredCards.length > this.visibleCount;
        const remaining = this.filteredCards.length - this.visibleCount;
        const count = this.filteredCards.length;
        return html `
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
        <button
          class="reset-btn ${this.hasActiveFilters ? '' : 'is-hidden'}"
          @click=${this.reset}
          ?disabled=${!this.hasActiveFilters}
          aria-hidden=${String(!this.hasActiveFilters)}
        >${t(this.locale, 'app.resetFilters')}</button>
      </div>

      ${this.loading
            ? html `<div class="loading">${t(this.locale, 'app.loadingCollection')}</div>`
            : this.error
                ? html `<div class="loading">${this.error}</div>`
                : html `
            <rauk-card-grid
              .cards=${visible}
              .hasMore=${hasMore}
              .remaining=${remaining}
              .locale=${this.locale}
              @rauk-card-select=${this.onCardSelect}
              @rauk-load-more=${this.onLoadMore}
            ></rauk-card-grid>
          `}

      ${this.selectedCard ? html `
        <rauk-modal
          .card=${this.selectedCard}
          .allCards=${this.allCards}
          .locale=${this.locale}
          @rauk-modal-close=${this.onModalClose}
        ></rauk-modal>
      ` : ''}
    `;
    }
};
RaukApp.LOCALE_STORAGE_KEY = 'rauk-locale';
__decorate([
    state()
], RaukApp.prototype, "allCards", void 0);
__decorate([
    state()
], RaukApp.prototype, "filteredCards", void 0);
__decorate([
    state()
], RaukApp.prototype, "visibleCount", void 0);
__decorate([
    state()
], RaukApp.prototype, "selectedCard", void 0);
__decorate([
    state()
], RaukApp.prototype, "filters", void 0);
__decorate([
    state()
], RaukApp.prototype, "loading", void 0);
__decorate([
    state()
], RaukApp.prototype, "error", void 0);
__decorate([
    state()
], RaukApp.prototype, "locale", void 0);
RaukApp = RaukApp_1 = __decorate([
    customElement('rauk-app')
], RaukApp);
export { RaukApp };

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import TomSelect from 'tom-select';
import { DEFAULT_LOCALE, localizeLanguage, t } from '../lib/i18n';
let RaukFilterBar = class RaukFilterBar extends LitElement {
    constructor() {
        super(...arguments);
        this.languages = [];
        this.sets = [];
        this.locale = DEFAULT_LOCALE;
        this.inputValue = '';
        this.filtersOpen = false;
        this.setSelect = null;
        this.setEnhancementFailed = false;
        this.searchTimer = null;
        this.hasMounted = false;
    }
    createRenderRoot() { return this; }
    normalizeSetValues(value) {
        if (Array.isArray(value))
            return value.filter(Boolean);
        if (!value)
            return [];
        return [value];
    }
    firstUpdated() {
        this.syncNativeSetOptions();
        this.initializeSetSelect();
        this.syncTomSelectOptions();
        this.hasMounted = true;
    }
    updated(changed) {
        if (changed.has('locale') && this.hasMounted) {
            queueMicrotask(() => {
                this.reinitializeSetSelect();
            });
        }
        if (changed.has('sets')) {
            this.syncTomSelectOptions();
        }
        const prev = changed.get('filters');
        if (prev) {
            if (prev.query !== this.filters.query) {
                this.inputValue = this.filters.query;
            }
            if (prev.sets !== this.filters.sets) {
                const nextValue = this.filters.sets.filter(s => this.sets.includes(s));
                if (this.setSelect) {
                    this.setSelect.setValue(nextValue, true);
                }
                const nativeSet = this.querySelector('#filter-set');
                if (nativeSet) {
                    const valueSet = new Set(nextValue);
                    Array.from(nativeSet.options).forEach(opt => {
                        opt.selected = valueSet.has(opt.value);
                    });
                }
            }
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.setSelect?.destroy();
        this.setSelect = null;
    }
    initializeSetSelect() {
        if (this.setEnhancementFailed || this.setSelect)
            return;
        const el = this.querySelector('#filter-set');
        if (!el)
            return;
        const existing = el.tomselect;
        if (existing) {
            this.setSelect = existing;
            return;
        }
        try {
            this.setSelect = new TomSelect(el, {
                maxOptions: 500,
                maxItems: null,
                plugins: {
                    remove_button: { title: t(this.locale, 'filters.removeSet') },
                },
                placeholder: t(this.locale, 'filters.showAllSets'),
                hidePlaceholder: true,
                hideSelected: true,
                closeAfterSelect: false,
                create: false,
                persist: false,
                onChange: (value) => {
                    this.emit({ ...this.filters, sets: this.normalizeSetValues(value) });
                },
            });
        }
        catch (error) {
            this.setEnhancementFailed = true;
            this.setSelect = null;
            console.warn('Set filter enhancement failed, using native select fallback.', error);
        }
    }
    syncTomSelectOptions() {
        this.syncNativeSetOptions();
        if (!this.setSelect)
            return;
        const nextValue = this.filters.sets.filter(s => this.sets.includes(s));
        this.setSelect.sync();
        this.setSelect.setValue(nextValue, true);
    }
    syncNativeSetOptions() {
        const nativeSet = this.querySelector('#filter-set');
        if (!nativeSet)
            return;
        const selected = new Set(this.filters.sets.filter(s => this.sets.includes(s)));
        nativeSet.replaceChildren(...this.sets.map(setName => new Option(setName, setName, false, selected.has(setName))));
    }
    reinitializeSetSelect() {
        this.setSelect?.destroy();
        this.setSelect = null;
        this.initializeSetSelect();
        this.syncTomSelectOptions();
    }
    emit(filters) {
        this.dispatchEvent(new CustomEvent('rauk-filter-change', {
            detail: filters,
            bubbles: true,
            composed: true,
        }));
    }
    onSearchInput(e) {
        this.inputValue = e.target.value;
        if (this.searchTimer)
            clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.emit({ ...this.filters, query: this.inputValue }), 200);
    }
    clearSearch() {
        this.inputValue = '';
        this.emit({ ...this.filters, query: '' });
        this.querySelector('#search')?.focus();
    }
    onLanguageChange(e) {
        this.emit({ ...this.filters, language: e.target.value, sets: [] });
    }
    onSetNativeChange(e) {
        const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
        this.emit({ ...this.filters, sets: selected });
    }
    onGradeChange(e) {
        this.emit({ ...this.filters, grade: e.target.value });
    }
    onSortChange(e) {
        this.emit({ ...this.filters, sort: e.target.value });
    }
    toggleFilters() {
        this.filtersOpen = !this.filtersOpen;
    }
    render() {
        return html `
      <div class="controls personality-shell personality-controls bg-raukar-subtle">
        <div class="search-wrap">
          <div class="search-field">
            <svg class="search-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M13 13L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input
              id="search"
              type="text"
              placeholder=${t(this.locale, 'filters.searchPlaceholder')}
              autocomplete="off"
              .value=${this.inputValue}
              @input=${this.onSearchInput}
            />
            <button
              class="clear-btn"
              style="opacity: ${this.inputValue ? '1' : '0'}"
              aria-label=${t(this.locale, 'filters.clearSearch')}
              @click=${this.clearSearch}
            >×</button>
          </div>

          <button
            class="filter-toggle-btn ${this.filtersOpen ? 'is-active' : ''}"
            type="button"
            aria-label=${this.filtersOpen ? t(this.locale, 'filters.hideFilters') : t(this.locale, 'filters.showFilters')}
            aria-expanded=${String(this.filtersOpen)}
            aria-controls="filter-options"
            @click=${this.toggleFilters}
          >
            ${this.filtersOpen
            ? html `
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M5 5L15 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              `
            : html `
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 5H17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M6 10H14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M8.5 15H11.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              `}
          </button>
        </div>

        <div id="filter-options" class="filters ${this.filtersOpen ? '' : 'is-collapsed'}">
          <select @change=${this.onLanguageChange} .value=${this.filters.language}>
            <option value="">${t(this.locale, 'filters.allLanguages')}</option>
            ${this.languages.map(l => html `<option value=${l}>${localizeLanguage(this.locale, l)}</option>`)}
          </select>

          <select @change=${this.onGradeChange} .value=${this.filters.grade}>
            <option value="">${t(this.locale, 'filters.allGrades')}</option>
            <option value="10">${t(this.locale, 'filters.grade10')}</option>
            <option value="9.5">${t(this.locale, 'filters.grade95')}</option>
            <option value="9">${t(this.locale, 'filters.grade9')}</option>
            <option value="8.5">${t(this.locale, 'filters.grade85')}</option>
            <option value="8">${t(this.locale, 'filters.grade8')}</option>
            <option value="7.5">${t(this.locale, 'filters.grade75')}</option>
            <option value="7">${t(this.locale, 'filters.grade7orBelow')}</option>
            <option value="CE">CE</option>
          </select>

          <select @change=${this.onSortChange} .value=${this.filters.sort}>
            <option value="date-desc">${t(this.locale, 'filters.sortNewest')}</option>
            <option value="date-asc">${t(this.locale, 'filters.sortOldest')}</option>
            <option value="grade-desc">${t(this.locale, 'filters.sortGradeHighLow')}</option>
            <option value="grade-asc">${t(this.locale, 'filters.sortGradeLowHigh')}</option>
            <option value="name-asc">${t(this.locale, 'filters.sortNameAZ')}</option>
          </select>

          <select id="filter-set" multiple @change=${this.onSetNativeChange}>
          </select>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Object })
], RaukFilterBar.prototype, "filters", void 0);
__decorate([
    property({ type: Array })
], RaukFilterBar.prototype, "languages", void 0);
__decorate([
    property({ type: Array })
], RaukFilterBar.prototype, "sets", void 0);
__decorate([
    property({ type: String })
], RaukFilterBar.prototype, "locale", void 0);
__decorate([
    state()
], RaukFilterBar.prototype, "inputValue", void 0);
__decorate([
    state()
], RaukFilterBar.prototype, "filtersOpen", void 0);
RaukFilterBar = __decorate([
    customElement('rauk-filter-bar')
], RaukFilterBar);
export { RaukFilterBar };

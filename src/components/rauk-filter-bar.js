var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import TomSelect from 'tom-select';
let RaukFilterBar = class RaukFilterBar extends LitElement {
    constructor() {
        super(...arguments);
        this.languages = [];
        this.sets = [];
        this.inputValue = '';
        this.setSelect = null;
        this.searchTimer = null;
    }
    createRenderRoot() { return this; }
    firstUpdated() {
        const el = this.querySelector('#filter-set');
        if (!el)
            return;
        this.setSelect = new TomSelect(el, {
            maxOptions: 500,
            placeholder: 'All Sets',
            onChange: (value) => {
                this.emit({ ...this.filters, set: value });
            },
        });
        this.syncTomSelectOptions();
    }
    updated(changed) {
        if (changed.has('sets')) {
            this.syncTomSelectOptions();
        }
        const prev = changed.get('filters');
        if (prev) {
            if (prev.query !== this.filters.query) {
                this.inputValue = this.filters.query;
            }
            if (prev.set !== this.filters.set && this.setSelect) {
                this.setSelect.setValue(this.filters.set, true);
            }
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.setSelect?.destroy();
        this.setSelect = null;
    }
    syncTomSelectOptions() {
        if (!this.setSelect)
            return;
        const current = this.filters.set;
        this.setSelect.clearOptions();
        this.sets.forEach(s => this.setSelect.addOption({ value: s, text: s }));
        this.setSelect.refreshOptions(false);
        this.setSelect.setValue(this.sets.includes(current) ? current : '', true);
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
        this.emit({ ...this.filters, language: e.target.value, set: '' });
    }
    onGradeChange(e) {
        this.emit({ ...this.filters, grade: e.target.value });
    }
    onSortChange(e) {
        this.emit({ ...this.filters, sort: e.target.value });
    }
    render() {
        return html `
      <div class="controls personality-shell personality-controls bg-raukar-subtle">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M13 13L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            id="search"
            type="text"
            placeholder="Search by name, set, or ID…"
            autocomplete="off"
            .value=${this.inputValue}
            @input=${this.onSearchInput}
          />
          <button
            class="clear-btn"
            style="opacity: ${this.inputValue ? '1' : '0'}"
            aria-label="Clear search"
            @click=${this.clearSearch}
          >×</button>
        </div>

        <div class="filters">
          <select @change=${this.onLanguageChange} .value=${this.filters.language}>
            <option value="">All Languages</option>
            ${this.languages.map(l => html `<option value=${l}>${l}</option>`)}
          </select>

          <select id="filter-set"></select>

          <select @change=${this.onGradeChange} .value=${this.filters.grade}>
            <option value="">All Grades</option>
            <option value="10">Grade 10</option>
            <option value="9.5">Grade 9.5</option>
            <option value="9">Grade 9</option>
            <option value="8.5">Grade 8.5</option>
            <option value="8">Grade 8</option>
            <option value="7.5">Grade 7.5</option>
            <option value="7">Grade 7 or below</option>
            <option value="CE">CE</option>
          </select>

          <select @change=${this.onSortChange} .value=${this.filters.sort}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="grade-desc">Grade: high to low</option>
            <option value="grade-asc">Grade: low to high</option>
            <option value="name-asc">Name A–Z</option>
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
    state()
], RaukFilterBar.prototype, "inputValue", void 0);
RaukFilterBar = __decorate([
    customElement('rauk-filter-bar')
], RaukFilterBar);
export { RaukFilterBar };

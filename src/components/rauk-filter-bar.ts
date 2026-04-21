import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import TomSelect from 'tom-select';
import type { FilterState } from '../lib/types';

@customElement('rauk-filter-bar')
export class RaukFilterBar extends LitElement {
  override createRenderRoot() { return this; }

  @property({ type: Object }) filters!: FilterState;
  @property({ type: Array })  languages: string[] = [];
  @property({ type: Array })  sets: string[] = [];

  @state() private inputValue = '';

  private setSelect: TomSelect | null = null;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  override firstUpdated(): void {
    const el = this.querySelector<HTMLSelectElement>('#filter-set');
    if (!el) return;
    this.setSelect = new TomSelect(el, {
      maxOptions: 500,
      placeholder: 'All Sets',
      onChange: (value: string) => {
        this.emit({ ...this.filters, set: value });
      },
    });
    this.syncTomSelectOptions();
  }

  override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('sets')) {
      this.syncTomSelectOptions();
    }
    const prev = changed.get('filters') as FilterState | undefined;
    if (prev) {
      if (prev.query !== this.filters.query) {
        this.inputValue = this.filters.query;
      }
      if (prev.set !== this.filters.set && this.setSelect) {
        this.setSelect.setValue(this.filters.set, true);
      }
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.setSelect?.destroy();
    this.setSelect = null;
  }

  private syncTomSelectOptions(): void {
    if (!this.setSelect) return;
    const current = this.filters.set;
    this.setSelect.clearOptions();
    this.sets.forEach(s => this.setSelect!.addOption({ value: s, text: s }));
    this.setSelect.refreshOptions(false);
    this.setSelect.setValue(this.sets.includes(current) ? current : '', true);
  }

  private emit(filters: FilterState): void {
    this.dispatchEvent(new CustomEvent<FilterState>('rauk-filter-change', {
      detail: filters,
      bubbles: true,
      composed: true,
    }));
  }

  private onSearchInput(e: Event): void {
    this.inputValue = (e.target as HTMLInputElement).value;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(
      () => this.emit({ ...this.filters, query: this.inputValue }),
      200
    );
  }

  private clearSearch(): void {
    this.inputValue = '';
    this.emit({ ...this.filters, query: '' });
    this.querySelector<HTMLInputElement>('#search')?.focus();
  }

  private onLanguageChange(e: Event): void {
    this.emit({ ...this.filters, language: (e.target as HTMLSelectElement).value, set: '' });
  }

  private onGradeChange(e: Event): void {
    this.emit({ ...this.filters, grade: (e.target as HTMLSelectElement).value });
  }

  private onSortChange(e: Event): void {
    this.emit({ ...this.filters, sort: (e.target as HTMLSelectElement).value });
  }

  override render() {
    return html`
      <div class="controls">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M13 13L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            id="search"
            type="text"
            placeholder="Search by name or set…"
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
            ${this.languages.map(l => html`<option value=${l}>${l}</option>`)}
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
}

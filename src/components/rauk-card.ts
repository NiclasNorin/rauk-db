import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Card } from '../lib/types';
import { getLanguage, gradeClass, formatDate } from '../lib/utils';
import { DEFAULT_LOCALE, localizeLanguage, t, type Locale } from '../lib/i18n';

@customElement('rauk-card')
export class RaukCard extends LitElement {
  override createRenderRoot() { return this; }

  @property({ type: Object }) card!: Card;
  @property({ type: String }) locale: Locale = DEFAULT_LOCALE;

  private isPerfectSubgrades(card: Card): boolean {
    const values = [card.Center, card.Edges, card.Surface, card.Corners];
    return values.every(v => {
      const n = parseFloat(v);
      return !Number.isNaN(n) && n === 10;
    });
  }

  private subGrade(label: string, value: string) {
    const display = value && value !== '-' ? value : '—';
    return html`
      <div class="sub-grade">
        <span class="sub-label">${label}</span>
        <span class="sub-val">${display}</span>
      </div>
    `;
  }

  override render() {
    const { card } = this;
    const lang  = localizeLanguage(this.locale, getLanguage(card.Game));
    const year  = card.Game.match(/\b(\d{4})\b/)?.[1] ?? '';
    const isPremium = this.isPerfectSubgrades(card);

    return html`
      <article class="card ${isPremium ? 'card--premium' : ''}" data-id=${card.id}>
        <div class="card-header">
          <span class="card-id">#${card.id}</span>
          <span class="grade-badge ${gradeClass(card.Grade)}">${card.Grade}</span>
        </div>
        <h2 class="card-name">${card['Card Name']}</h2>
        <div class="card-meta">
          ${year ? html`<span class="tag tag-year">${year}</span>` : ''}
          <span class="tag tag-lang">${lang}</span>
          <span class="tag tag-set">${card.Set}</span>
        </div>
        <div class="sub-grades">
          ${this.subGrade(t(this.locale, 'card.ctr'), card.Center)}
          ${this.subGrade(t(this.locale, 'card.edg'), card.Edges)}
          ${this.subGrade(t(this.locale, 'card.sur'), card.Surface)}
          ${this.subGrade(t(this.locale, 'card.cor'), card.Corners)}
        </div>
        <div class="card-date">${formatDate(card['Date Graded'], this.locale)}</div>
      </article>
    `;
  }
}

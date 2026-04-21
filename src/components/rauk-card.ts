import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Card } from '../lib/types';
import { getLanguage, gradeClass, formatDate } from '../lib/utils';

@customElement('rauk-card')
export class RaukCard extends LitElement {
  override createRenderRoot() { return this; }

  @property({ type: Object }) card!: Card;

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
    const lang  = getLanguage(card.Game);
    const year  = card.Game.match(/\b(\d{4})\b/)?.[1] ?? '';

    return html`
      <article class="card" data-id=${card.id}>
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
          ${this.subGrade('Ctr', card.Center)}
          ${this.subGrade('Edg', card.Edges)}
          ${this.subGrade('Sur', card.Surface)}
          ${this.subGrade('Cor', card.Corners)}
        </div>
        <div class="card-date">${formatDate(card['Date Graded'])}</div>
      </article>
    `;
  }
}

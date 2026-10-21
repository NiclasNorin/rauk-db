import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Card } from '../lib/types';
import { DEFAULT_LOCALE, t, type Locale } from '../lib/i18n';
import './rauk-card';

@customElement('rauk-card-grid')
export class RaukCardGrid extends LitElement {
  override createRenderRoot() { return this; }

  @property({ type: Array })   cards: Card[] = [];
  @property({ type: Boolean }) hasMore = false;
  @property({ type: Number })  remaining = 0;
  @property({ type: String }) locale: Locale = DEFAULT_LOCALE;

  private onCardClick(card: Card): void {
    this.dispatchEvent(new CustomEvent<Card>('rauk-card-select', {
      detail: card,
      bubbles: true,
      composed: true,
    }));
  }

  private onLoadMore(): void {
    this.dispatchEvent(new CustomEvent('rauk-load-more', {
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    if (!this.cards.length) {
      return html`<div class="empty personality-empty bg-raukar-dramatic">${t(this.locale, 'grid.empty')}</div>`;
    }

    return html`
      <div class="grid">
        ${this.cards.map(card => html`
          <rauk-card
            .card=${card}
            .locale=${this.locale}
            @click=${() => this.onCardClick(card)}
          ></rauk-card>
        `)}
        ${this.hasMore ? html`
          <button class="load-more" @click=${this.onLoadMore}>
            ${t(this.locale, 'grid.showMore', { remaining: this.remaining })}
          </button>
        ` : ''}
      </div>
    `;
  }
}

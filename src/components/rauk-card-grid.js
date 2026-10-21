var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DEFAULT_LOCALE, t } from '../lib/i18n';
import './rauk-card';
let RaukCardGrid = class RaukCardGrid extends LitElement {
    constructor() {
        super(...arguments);
        this.cards = [];
        this.hasMore = false;
        this.remaining = 0;
        this.locale = DEFAULT_LOCALE;
    }
    createRenderRoot() { return this; }
    onCardClick(card) {
        this.dispatchEvent(new CustomEvent('rauk-card-select', {
            detail: card,
            bubbles: true,
            composed: true,
        }));
    }
    onLoadMore() {
        this.dispatchEvent(new CustomEvent('rauk-load-more', {
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        if (!this.cards.length) {
            return html `<div class="empty personality-empty bg-raukar-dramatic">${t(this.locale, 'grid.empty')}</div>`;
        }
        return html `
      <div class="grid">
        ${this.cards.map(card => html `
          <rauk-card
            .card=${card}
            .locale=${this.locale}
            @click=${() => this.onCardClick(card)}
          ></rauk-card>
        `)}
        ${this.hasMore ? html `
          <button class="load-more" @click=${this.onLoadMore}>
            ${t(this.locale, 'grid.showMore', { remaining: this.remaining })}
          </button>
        ` : ''}
      </div>
    `;
    }
};
__decorate([
    property({ type: Array })
], RaukCardGrid.prototype, "cards", void 0);
__decorate([
    property({ type: Boolean })
], RaukCardGrid.prototype, "hasMore", void 0);
__decorate([
    property({ type: Number })
], RaukCardGrid.prototype, "remaining", void 0);
__decorate([
    property({ type: String })
], RaukCardGrid.prototype, "locale", void 0);
RaukCardGrid = __decorate([
    customElement('rauk-card-grid')
], RaukCardGrid);
export { RaukCardGrid };

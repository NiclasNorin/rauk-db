var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getLanguage, gradeClass, formatDate } from '../lib/utils';
let RaukCard = class RaukCard extends LitElement {
    createRenderRoot() { return this; }
    isPerfectSubgrades(card) {
        const values = [card.Center, card.Edges, card.Surface, card.Corners];
        return values.every(v => {
            const n = parseFloat(v);
            return !Number.isNaN(n) && n === 10;
        });
    }
    subGrade(label, value) {
        const display = value && value !== '-' ? value : '—';
        return html `
      <div class="sub-grade">
        <span class="sub-label">${label}</span>
        <span class="sub-val">${display}</span>
      </div>
    `;
    }
    render() {
        const { card } = this;
        const lang = getLanguage(card.Game);
        const year = card.Game.match(/\b(\d{4})\b/)?.[1] ?? '';
        const isPremium = this.isPerfectSubgrades(card);
        return html `
      <article class="card ${isPremium ? 'card--premium' : ''}" data-id=${card.id}>
        <div class="card-header">
          <span class="card-id">#${card.id}</span>
          <span class="grade-badge ${gradeClass(card.Grade)}">${card.Grade}</span>
        </div>
        <h2 class="card-name">${card['Card Name']}</h2>
        <div class="card-meta">
          ${year ? html `<span class="tag tag-year">${year}</span>` : ''}
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
};
__decorate([
    property({ type: Object })
], RaukCard.prototype, "card", void 0);
RaukCard = __decorate([
    customElement('rauk-card')
], RaukCard);
export { RaukCard };

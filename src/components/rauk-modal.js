var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getLanguage, gradeClass, gradeNumeric, formatDate } from '../lib/utils';
import { fetchTCGDexCard, renderTCGDexInfo } from '../lib/tcgdex';
let RaukModal = class RaukModal extends LitElement {
    constructor() {
        super(...arguments);
        this.allCards = [];
        this.tcgCard = null;
        this.tcgLoading = true;
        this.imgError = false;
        this.onKeyDown = (e) => {
            if (e.key === 'Escape')
                this.close();
        };
    }
    createRenderRoot() { return this; }
    connectedCallback() {
        super.connectedCallback();
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', this.onKeyDown);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this.onKeyDown);
    }
    firstUpdated() {
        this.fetchCard();
    }
    async fetchCard() {
        const tcg = await fetchTCGDexCard(this.card);
        this.tcgCard = tcg;
        this.tcgLoading = false;
    }
    close() {
        this.dispatchEvent(new CustomEvent('rauk-modal-close', {
            bubbles: true,
            composed: true,
        }));
    }
    onOverlayClick(e) {
        if (e.target === e.currentTarget)
            this.close();
    }
    subGradeRow(label, value) {
        const display = value && value !== '-' ? value : '—';
        return html `
      <div class="detail-sub">
        <span class="detail-sub-label">${label}</span>
        <span class="detail-sub-val">${display}</span>
      </div>
    `;
    }
    renderImage() {
        if (this.tcgLoading)
            return html `<div class="tcgdex-skeleton"></div>`;
        if (!this.tcgCard || this.imgError)
            return html `<p class="tcgdex-no-img">No image found</p>`;
        return html `
      <img
        class="tcgdex-img"
        src=${this.tcgCard.getImageURL('high', 'webp')}
        alt=${this.tcgCard.name ?? 'Card image'}
        loading="lazy"
        @error=${() => { this.imgError = true; }}
      />
    `;
    }
    render() {
        const { card, allCards } = this;
        const lang = getLanguage(card.Game);
        const year = card.Game.match(/\b(\d{4})\b/)?.[1] ?? '';
        const gradingId = card.id
            ? (card.id.startsWith('#') ? card.id : `#${card.id}`)
            : '';
        const copies = allCards
            .filter(c => c['Card Name'] === card['Card Name'])
            .sort((a, b) => gradeNumeric(b.Grade) - gradeNumeric(a.Grade));
        const distMap = copies.reduce((acc, c) => ({ ...acc, [c.Grade]: (acc[c.Grade] ?? 0) + 1 }), {});
        const distEntries = Object.entries(distMap)
            .sort((a, b) => gradeNumeric(b[0]) - gradeNumeric(a[0]));
        return html `
      <div class="modal-overlay" @click=${this.onOverlayClick} role="dialog" aria-modal="true">
        <div class="modal">
          <button class="modal-close" @click=${this.close} aria-label="Close">×</button>
          <div id="modal-content">

            <div class="modal-body">
              <div class="detail-image-col">
                <div class="tcgdex-img-wrap">${this.renderImage()}</div>
              </div>
              <div class="detail-info-col">
                <div class="detail-header">
                  <div>
                    <h2 class="detail-name">${card['Card Name']}</h2>
                    <div class="detail-meta">
                      ${year ? html `<span class="tag tag-year">${year}</span>` : ''}
                      <span class="tag tag-lang">${lang}</span>
                      <span class="tag tag-set">${card.Set}</span>
                    </div>
                    ${gradingId ? html `<div class="detail-id">Grading ID: <strong>${gradingId}</strong></div>` : ''}
                  </div>
                  <span class="grade-badge ${gradeClass(card.Grade)} grade-badge--lg">${card.Grade}</span>
                </div>
                <div class="detail-subgrades">
                  ${this.subGradeRow('Center', card.Center)}
                  ${this.subGradeRow('Edges', card.Edges)}
                  ${this.subGradeRow('Surface', card.Surface)}
                  ${this.subGradeRow('Corners', card.Corners)}
                </div>
                ${this.tcgLoading
            ? html `<div class="tcgdex-skeleton tcgdex-skeleton--text"></div>`
            : this.tcgCard ? renderTCGDexInfo(this.tcgCard) : ''}
              </div>
            </div>

            <div class="detail-section">
              <h3 class="detail-section-title">Grade distribution</h3>
              <div class="table-wrap">
                <table class="grade-table">
                  <thead><tr><th>Grade</th><th>Cards</th></tr></thead>
                  <tbody>
                    ${distEntries.map(([grade, count]) => html `
                      <tr>
                        <td><span class="grade-badge ${gradeClass(grade)}">${grade}</span></td>
                        <td>${count}</td>
                      </tr>
                    `)}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="detail-section">
              <h3 class="detail-section-title">
                All gradings of this card
                <span class="detail-count">${copies.length}</span>
              </h3>
              <div class="table-wrap">
                <table class="grade-table">
                  <thead>
                    <tr><th>Grade</th><th>Ctr</th><th>Edg</th><th>Sur</th><th>Cor</th><th>Set</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    ${copies.map(c => html `
                      <tr class=${c.id === card.id ? 'row-current' : ''}>
                        <td><span class="grade-badge ${gradeClass(c.Grade)}">${c.Grade}</span></td>
                        <td>${c.Center && c.Center !== '-' ? c.Center : '—'}</td>
                        <td>${c.Edges && c.Edges !== '-' ? c.Edges : '—'}</td>
                        <td>${c.Surface && c.Surface !== '-' ? c.Surface : '—'}</td>
                        <td>${c.Corners && c.Corners !== '-' ? c.Corners : '—'}</td>
                        <td>${c.Set}</td>
                        <td>${formatDate(c['Date Graded'])}</td>
                      </tr>
                    `)}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Object })
], RaukModal.prototype, "card", void 0);
__decorate([
    property({ type: Array })
], RaukModal.prototype, "allCards", void 0);
__decorate([
    state()
], RaukModal.prototype, "tcgCard", void 0);
__decorate([
    state()
], RaukModal.prototype, "tcgLoading", void 0);
__decorate([
    state()
], RaukModal.prototype, "imgError", void 0);
RaukModal = __decorate([
    customElement('rauk-modal')
], RaukModal);
export { RaukModal };

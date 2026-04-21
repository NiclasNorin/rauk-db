import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardModel } from '@tcgdex/sdk';
import type { Card } from '../lib/types';
import { getLanguage, gradeClass, gradeNumeric, formatDate } from '../lib/utils';
import { fetchTCGDexCard, renderTCGDexInfo } from '../lib/tcgdex';

@customElement('rauk-modal')
export class RaukModal extends LitElement {
  override createRenderRoot() { return this; }

  @property({ type: Object }) card!: Card;
  @property({ type: Array })  allCards: Card[] = [];

  @state() private tcgCard: CardModel | null = null;
  @state() private tcgLoading = true;
  @state() private imgError = false;

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.close();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.onKeyDown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.onKeyDown);
  }

  override firstUpdated(): void {
    this.fetchCard();
  }

  private async fetchCard(): Promise<void> {
    const tcg = await fetchTCGDexCard(this.card);
    this.tcgCard = tcg;
    this.tcgLoading = false;
  }

  private close(): void {
    this.dispatchEvent(new CustomEvent('rauk-modal-close', {
      bubbles: true,
      composed: true,
    }));
  }

  private onOverlayClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.close();
  }

  private subGradeRow(label: string, value: string) {
    const display = value && value !== '-' ? value : '—';
    return html`
      <div class="detail-sub">
        <span class="detail-sub-label">${label}</span>
        <span class="detail-sub-val">${display}</span>
      </div>
    `;
  }

  private renderImage() {
    if (this.tcgLoading) return html`<div class="tcgdex-skeleton"></div>`;
    if (!this.tcgCard || this.imgError) return html`<p class="tcgdex-no-img">No image found</p>`;
    return html`
      <img
        class="tcgdex-img"
        src=${this.tcgCard.getImageURL('high', 'webp')}
        alt=${this.tcgCard.name ?? 'Card image'}
        loading="lazy"
        @error=${() => { this.imgError = true; }}
      />
    `;
  }

  override render() {
    const { card, allCards } = this;
    const lang = getLanguage(card.Game);
    const year = card.Game.match(/\b(\d{4})\b/)?.[1] ?? '';

    const copies = allCards
      .filter(c => c['Card Name'] === card['Card Name'])
      .sort((a, b) => gradeNumeric(b.Grade) - gradeNumeric(a.Grade));

    const distMap = copies.reduce<Record<string, number>>(
      (acc, c) => ({ ...acc, [c.Grade]: (acc[c.Grade] ?? 0) + 1 }),
      {}
    );
    const distEntries = Object.entries(distMap)
      .sort((a, b) => gradeNumeric(b[0]) - gradeNumeric(a[0]));

    return html`
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
                      ${year ? html`<span class="tag tag-year">${year}</span>` : ''}
                      <span class="tag tag-lang">${lang}</span>
                      <span class="tag tag-set">${card.Set}</span>
                    </div>
                  </div>
                  <span class="grade-badge ${gradeClass(card.Grade)} grade-badge--lg">${card.Grade}</span>
                </div>
                <div class="detail-subgrades">
                  ${this.subGradeRow('Center',  card.Center)}
                  ${this.subGradeRow('Edges',   card.Edges)}
                  ${this.subGradeRow('Surface', card.Surface)}
                  ${this.subGradeRow('Corners', card.Corners)}
                </div>
                ${this.tcgLoading
                  ? html`<div class="tcgdex-skeleton tcgdex-skeleton--text"></div>`
                  : this.tcgCard ? renderTCGDexInfo(this.tcgCard) : ''}
              </div>
            </div>

            <div class="detail-section">
              <h3 class="detail-section-title">Grade distribution</h3>
              <div class="table-wrap">
                <table class="grade-table">
                  <thead><tr><th>Grade</th><th>Cards</th></tr></thead>
                  <tbody>
                    ${distEntries.map(([grade, count]) => html`
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
                    ${copies.map(c => html`
                      <tr class=${c.id === card.id ? 'row-current' : ''}>
                        <td><span class="grade-badge ${gradeClass(c.Grade)}">${c.Grade}</span></td>
                        <td>${c.Center  && c.Center  !== '-' ? c.Center  : '—'}</td>
                        <td>${c.Edges   && c.Edges   !== '-' ? c.Edges   : '—'}</td>
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
}

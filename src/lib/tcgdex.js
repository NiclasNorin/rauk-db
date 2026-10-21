import { html } from 'lit';
import TCGdex, { Query } from '@tcgdex/sdk';
import { extractSearchName } from './utils';
import { t } from './i18n';
export async function fetchTCGDexCard(card) {
    const tcgdex = new TCGdex('en');
    const searchName = extractSearchName(card['Card Name']);
    const numMatch = card['Card Name'].match(/^(\d+)/);
    const localIdVariants = numMatch
        ? [numMatch[1], String(parseInt(numMatch[1], 10))]
        : [];
    try {
        const results = await tcgdex.card.list(Query.create().contains('name', searchName).paginate(0, 50));
        if (!results?.length)
            return null;
        const best = localIdVariants.reduce((found, id) => found ?? results.find(r => r.localId === id), undefined) ?? results[0];
        return await best.getCard();
    }
    catch {
        return null;
    }
}
export function renderTCGDexInfo(tcg, locale) {
    const chips = [
        tcg.rarity ? html `<span class="tcg-chip">${tcg.rarity}</span>` : null,
    ].filter(Boolean);
    return html `
    <div class="tcg-info">
      ${chips.length ? html `<div class="tcg-chips">${chips}</div>` : ''}
      ${tcg.illustrator ? html `<p class="tcg-illustrator">${t(locale, 'tcg.illustratedBy', { name: tcg.illustrator })}</p>` : ''}
    </div>
  `;
}

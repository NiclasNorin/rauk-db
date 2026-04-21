import { html, type TemplateResult } from 'lit';
import TCGdex, { Query } from '@tcgdex/sdk';
import type { CardModel } from '@tcgdex/sdk';
import type { Card } from './types';
import { extractSearchName } from './utils';

export async function fetchTCGDexCard(card: Card): Promise<CardModel | null> {
  const tcgdex = new TCGdex('en');
  const searchName = extractSearchName(card['Card Name']);

  const numMatch = card['Card Name'].match(/^(\d+)/);
  const localIdVariants = numMatch
    ? [numMatch[1], String(parseInt(numMatch[1], 10))]
    : [];

  try {
    const results = await tcgdex.card.list(
      Query.create().contains('name', searchName).paginate(0, 50)
    );

    if (!results?.length) return null;

    const best = localIdVariants.reduce<typeof results[0] | undefined>(
      (found, id) => found ?? results.find(r => r.localId === id),
      undefined
    ) ?? results[0];

    return await best.getCard();
  } catch {
    return null;
  }
}

export function renderTCGDexInfo(tcg: CardModel): TemplateResult {
  const chips = [
    tcg.rarity ? html`<span class="tcg-chip">${tcg.rarity}</span>`   : null,
    ...(tcg.types?.map(t => html`<span class="tcg-chip tcg-chip--type">${t}</span>`) ?? []),
  ].filter(Boolean);

  return html`
    <div class="tcg-info">
      ${tcg.description ? html`<p class="tcg-description">${tcg.description}</p>` : ''}
      ${chips.length    ? html`<div class="tcg-chips">${chips}</div>`              : ''}
      ${tcg.illustrator ? html`<p class="tcg-illustrator">Illustrated by ${tcg.illustrator}</p>` : ''}
    </div>
  `;
}

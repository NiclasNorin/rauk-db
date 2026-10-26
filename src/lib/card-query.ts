import type { Card, FilterState } from './types';
import { compareCardsByGradeAndSubgrades, getLanguage, gradeNumeric } from './utils';

export function deriveLanguages(cards: Card[]): string[] {
  return [...new Set(cards.map(card => getLanguage(card.Game)))].sort();
}

export function deriveSets(cards: Card[], language: string): string[] {
  const scope = language
    ? cards.filter(card => getLanguage(card.Game) === language)
    : cards;

  return [...new Set(scope.map(card => card.Set))].sort();
}

export function filterAndSortCards(cards: Card[], filters: FilterState): Card[] {
  const { query, language, sets, grade, sort } = filters;
  const q = query.trim().toLowerCase();
  const normalizedQ = q.startsWith('#') ? q.slice(1) : q;

  const results = cards.filter(card => {
    if (language && getLanguage(card.Game) !== language) return false;
    if (sets.length && !sets.includes(card.Set)) return false;
    if (grade) {
      if (grade === 'CE') {
        if (card.Grade !== 'CE') return false;
      } else if (grade === '7') {
        if (gradeNumeric(card.Grade) > 7 || card.Grade === 'CE') return false;
      } else if (card.Grade !== grade) {
        return false;
      }
    }

    if (!q) return true;

    const searchable = `${card['Card Name']} ${card.Set}`.toLowerCase();
    const cardId = card.id.toLowerCase();
    const normalizedCardId = cardId.startsWith('#') ? cardId.slice(1) : cardId;
    const matchesText = searchable.includes(q);
    const matchesId = cardId.includes(q)
      || normalizedCardId.includes(normalizedQ)
      || cardId.includes(normalizedQ);

    return matchesText || matchesId;
  });

  results.sort((a, b) => {
    const aDate = a['Date Graded'] ?? '';
    const bDate = b['Date Graded'] ?? '';

    switch (sort) {
      case 'date-asc':
        return aDate.localeCompare(bDate);
      case 'date-desc':
        return bDate.localeCompare(aDate);
      case 'grade-desc':
        return compareCardsByGradeAndSubgrades(a, b, false);
      case 'grade-asc':
        return compareCardsByGradeAndSubgrades(a, b, true);
      case 'name-asc':
        return a['Card Name'].localeCompare(b['Card Name']);
      default:
        return 0;
    }
  });

  return results;
}

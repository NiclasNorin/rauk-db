import type { Card, FilterState } from './types';

const URL_QUERY_PARAM = 'q';
const URL_SET_PARAM = 'set';
const URL_GRADE_PARAM = 'grade';
const URL_SORT_PARAM = 'sort';
const URL_CARD_PARAM = 'card';

const VALID_SORTS = new Set(['date-desc', 'date-asc', 'grade-desc', 'grade-asc', 'name-asc']);
const VALID_GRADES = new Set(['10', '9.5', '9', '8.5', '8', '7.5', '7', 'CE']);

export interface ParsedUrlState {
  filters: Partial<FilterState>;
  cardId: string | null;
}

export function parseUrlState(search: string): ParsedUrlState {
  const params = new URLSearchParams(search);

  return {
    filters: {
      query: params.get(URL_QUERY_PARAM) ?? '',
      sets: params.getAll(URL_SET_PARAM).filter(Boolean),
      grade: params.get(URL_GRADE_PARAM) ?? '',
      sort: params.get(URL_SORT_PARAM) ?? '',
    },
    cardId: params.get(URL_CARD_PARAM),
  };
}

export function sanitizeUrlFilters(
  raw: Partial<FilterState>,
  allCards: Card[],
  base: FilterState,
  defaults: FilterState,
): FilterState {
  const allSets = new Set(allCards.map(card => card.Set));
  const sets = Array.from(new Set((raw.sets ?? []).filter(setName => allSets.has(setName))));
  const query = (raw.query ?? '').trim();
  const grade = raw.grade && VALID_GRADES.has(raw.grade) ? raw.grade : defaults.grade;
  const sort = raw.sort && VALID_SORTS.has(raw.sort) ? raw.sort : defaults.sort;

  return {
    ...base,
    query,
    sets,
    grade,
    sort,
  };
}

export function findCardByParam(cardIdParam: string | null, cards: Card[]): Card | null {
  if (!cardIdParam) return null;

  const raw = cardIdParam.trim().toLowerCase();
  const normalized = raw.startsWith('#') ? raw.slice(1) : raw;

  return cards.find(card => {
    const id = card.id.trim().toLowerCase();
    const idNormalized = id.startsWith('#') ? id.slice(1) : id;
    return id === raw || idNormalized === normalized;
  }) ?? null;
}

export function buildUrlFromState(
  currentHref: string,
  filters: FilterState,
  selectedCard: Card | null,
  defaults: FilterState,
): string {
  const url = new URL(currentHref);
  const params = url.searchParams;

  params.delete(URL_QUERY_PARAM);
  params.delete(URL_SET_PARAM);
  params.delete(URL_GRADE_PARAM);
  params.delete(URL_SORT_PARAM);
  params.delete(URL_CARD_PARAM);

  const query = filters.query.trim();
  if (query) params.set(URL_QUERY_PARAM, query);

  for (const setName of filters.sets) {
    params.append(URL_SET_PARAM, setName);
  }

  if (filters.grade) {
    params.set(URL_GRADE_PARAM, filters.grade);
  }

  if (filters.sort !== defaults.sort) {
    params.set(URL_SORT_PARAM, filters.sort);
  }

  if (selectedCard) {
    params.set(URL_CARD_PARAM, selectedCard.id);
  }

  return `${url.pathname}${params.toString() ? `?${params.toString()}` : ''}${url.hash}`;
}

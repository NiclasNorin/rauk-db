export type Locale = 'en' | 'sv';

export const DEFAULT_LOCALE: Locale = 'en';

const translations = {
  en: {
    'app.title': 'RaukCard PokéDB',
    'app.subtitle': '{count} Pokémon cards in collection',
    'app.resultsCount.one': '{count} card',
    'app.resultsCount.other': '{count} cards',
    'app.resetFilters': 'Reset filters',
    'app.sortCards': 'Sort cards',
    'app.loadingCollection': 'Loading collection…',
    'app.errorLoad': 'Failed to load collection. Please try again.',
    'app.locale.switchToEnglish': 'Switch language to English',
    'app.locale.switchToSwedish': 'Switch language to Swedish',

    'filters.searchPlaceholder': 'Search by name, set, or ID…',
    'filters.clearSearch': 'Clear search',
    'filters.showFilters': 'Show filters',
    'filters.hideFilters': 'Hide filters',
    'filters.allLanguages': 'All Languages',
    'filters.allGrades': 'All Grades',
    'filters.grade10': 'Grade 10',
    'filters.grade95': 'Grade 9.5',
    'filters.grade9': 'Grade 9',
    'filters.grade85': 'Grade 8.5',
    'filters.grade8': 'Grade 8',
    'filters.grade75': 'Grade 7.5',
    'filters.grade7orBelow': 'Grade 7 or below',
    'filters.sortNewest': 'Newest first',
    'filters.sortOldest': 'Oldest first',
    'filters.sortGradeHighLow': 'Grade: high to low',
    'filters.sortGradeLowHigh': 'Grade: low to high',
    'filters.sortNameAZ': 'Name A–Z',
    'filters.showAllSets': 'Show all sets',
    'filters.removeSet': 'Remove this set',

    'grid.empty': 'No cards match your filters.',
    'grid.showMore': 'Show more ({remaining} remaining)',

    'card.ctr': 'Ctr',
    'card.edg': 'Edg',
    'card.sur': 'Sur',
    'card.cor': 'Cor',

    'modal.noImageFound': 'No image found',
    'modal.cardImageAlt': 'Card image',
    'modal.close': 'Close',
    'modal.gradingId': 'Grading ID',
    'modal.center': 'Center',
    'modal.edges': 'Edges',
    'modal.surface': 'Surface',
    'modal.corners': 'Corners',
    'modal.gradeDistribution': 'Grade distribution',
    'modal.grade': 'Grade',
    'modal.cards': 'Cards',
    'modal.allGradingsOfCard': 'All gradings of this card',
    'modal.set': 'Set',
    'modal.date': 'Date',

    'tcg.illustratedBy': 'Illustrated by {name}',

    'language.English': 'English',
    'language.Japanese': 'Japanese',
    'language.Korean': 'Korean',
    'language.Chinese': 'Chinese',
    'language.German': 'German',
    'language.French': 'French',
    'language.Italian': 'Italian',
    'language.Spanish': 'Spanish',
    'language.Portuguese': 'Portuguese',
    'language.Other': 'Other',
  },
  sv: {
    'app.title': 'RaukCard PokéDB',
    'app.subtitle': '{count} kort i samlingen',
    'app.resultsCount.one': '{count} kort',
    'app.resultsCount.other': '{count} kort',
    'app.resetFilters': 'Återställ filter',
    'app.sortCards': 'Sortera kort',
    'app.loadingCollection': 'Laddar samling…',
    'app.errorLoad': 'Kunde inte ladda in. Försök igen.',
    'app.locale.switchToEnglish': 'Byt språk till engelska',
    'app.locale.switchToSwedish': 'Byt språk till svenska',

    'filters.searchPlaceholder': 'Sök på namn, set eller ID…',
    'filters.clearSearch': 'Rensa sökning',
    'filters.showFilters': 'Visa filter',
    'filters.hideFilters': 'Dölj filter',
    'filters.allLanguages': 'Alla språk',
    'filters.allGrades': 'Alla graderingar',
    'filters.grade10': 'Gradering 10',
    'filters.grade95': 'Gradering 9,5',
    'filters.grade9': 'Gradering 9',
    'filters.grade85': 'Gradering 8,5',
    'filters.grade8': 'Gradering 8',
    'filters.grade75': 'Gradering 7,5',
    'filters.grade7orBelow': 'Gradering 7 eller lägre',
    'filters.sortNewest': 'Nyast först',
    'filters.sortOldest': 'Äldst först',
    'filters.sortGradeHighLow': 'Gradering: hög till låg',
    'filters.sortGradeLowHigh': 'Gradering: låg till hög',
    'filters.sortNameAZ': 'Namn A–Ö',
    'filters.showAllSets': 'Visa alla set',
    'filters.removeSet': 'Ta bort detta set',

    'grid.empty': 'Inga kort matchar dina filter.',
    'grid.showMore': 'Visa fler ({remaining} kvar)',

    'card.ctr': 'Cen',
    'card.edg': 'Kan',
    'card.sur': 'Yta',
    'card.cor': 'Hörn',

    'modal.noImageFound': 'Ingen bild hittades',
    'modal.cardImageAlt': 'Kortbild',
    'modal.close': 'Stäng',
    'modal.gradingId': 'Graderings-ID',
    'modal.center': 'Centrering',
    'modal.edges': 'Kanter',
    'modal.surface': 'Yta',
    'modal.corners': 'Hörn',
    'modal.gradeDistribution': 'Graderingsfördelning',
    'modal.grade': 'Gradering',
    'modal.cards': 'Kort',
    'modal.allGradingsOfCard': 'Alla graderingar av detta kort',
    'modal.set': 'Set',
    'modal.date': 'Datum',

    'tcg.illustratedBy': 'Illustrerad av {name}',

    'language.English': 'Engelska',
    'language.Japanese': 'Japanska',
    'language.Korean': 'Koreanska',
    'language.Chinese': 'Kinesiska',
    'language.German': 'Tyska',
    'language.French': 'Franska',
    'language.Italian': 'Italienska',
    'language.Spanish': 'Spanska',
    'language.Portuguese': 'Portugisiska',
    'language.Other': 'Övrigt',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function t(locale: Locale, key: TranslationKey, params?: Record<string, string | number>): string {
  const template = translations[locale][key] ?? translations.en[key];
  return interpolate(template, params);
}

export function cardCountLabel(locale: Locale, count: number): string {
  const pluralCategory = new Intl.PluralRules(locale).select(count);
  const key: TranslationKey = pluralCategory === 'one' ? 'app.resultsCount.one' : 'app.resultsCount.other';
  return t(locale, key, { count });
}

export function localeToDateLocale(locale: Locale): string {
  return locale === 'sv' ? 'sv-SE' : 'en-GB';
}

const supportedLanguages = [
  'English',
  'Japanese',
  'Korean',
  'Chinese',
  'German',
  'French',
  'Italian',
  'Spanish',
  'Portuguese',
  'Other',
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export function localizeLanguage(locale: Locale, language: string): string {
  const normalized = supportedLanguages.find(l => l.toLowerCase() === language.toLowerCase()) ?? 'Other';
  return t(locale, `language.${normalized}` as TranslationKey);
}

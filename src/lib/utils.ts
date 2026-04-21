export function getLanguage(game: string): string {
  const match = game.match(/\b(English|Japanese|Korean|Chinese|German|French|Italian|Spanish|Portuguese)\b/i);
  return match ? match[1] : 'Other';
}

export function extractSearchName(rawName: string): string {
  return rawName
    .replace(/^\d+\s+/, '')
    .replace(/\s*(Holo|Reverse\s*Holo|Rev\.?\s*Holo|RH|Full\s*Art|Cosmos\s*Holo|Rainbow\s*Rare|Secret\s*Rare)\s*$/i, '')
    .trim();
}

export function gradeClass(grade: string): string {
  const n = parseFloat(grade);
  if (grade === 'CE') return 'grade-ce';
  if (n === 10) return 'grade-10';
  if (n >= 9)  return 'grade-9';
  if (n >= 8)  return 'grade-8';
  if (n >= 7)  return 'grade-7';
  return 'grade-low';
}

export function gradeNumeric(grade: string): number {
  if (grade === 'CE') return -1;
  const n = parseFloat(grade);
  return isNaN(n) ? -2 : n;
}

export function formatDate(raw: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getLanguage(game) {
    const match = game.match(/\b(English|Japanese|Korean|Chinese|German|French|Italian|Spanish|Portuguese)\b/i);
    return match ? match[1] : 'Other';
}
export function extractSearchName(rawName) {
    return rawName
        .replace(/^\d+\s+/, '')
        .replace(/\s*(Holo|Reverse\s*Holo|Rev\.?\s*Holo|RH|Full\s*Art|Cosmos\s*Holo|Rainbow\s*Rare|Secret\s*Rare)\s*$/i, '')
        .trim();
}
export function gradeClass(grade) {
    const n = parseFloat(grade);
    if (grade === 'CE')
        return 'grade-ce';
    if (n === 10)
        return 'grade-10';
    if (n >= 9)
        return 'grade-9';
    if (n >= 8)
        return 'grade-8';
    if (n >= 5)
        return 'grade-7';
    return 'grade-low';
}
export function gradeNumeric(grade) {
    if (grade === 'CE')
        return -1;
    const n = parseFloat(grade);
    return isNaN(n) ? -2 : n;
}
function subgradeNumeric(value) {
    const n = parseFloat(value);
    return Number.isNaN(n) ? -1 : n;
}
function normalizedSubgrades(card) {
    return [card.Center, card.Edges, card.Surface, card.Corners]
        .map(subgradeNumeric)
        .sort((a, b) => b - a);
}
export function compareCardsByGradeAndSubgrades(a, b, ascending = false) {
    const gradeDiff = ascending
        ? gradeNumeric(a.Grade) - gradeNumeric(b.Grade)
        : gradeNumeric(b.Grade) - gradeNumeric(a.Grade);
    if (gradeDiff !== 0)
        return gradeDiff;
    const aSubs = normalizedSubgrades(a);
    const bSubs = normalizedSubgrades(b);
    for (let i = 0; i < aSubs.length; i++) {
        if (aSubs[i] !== bSubs[i]) {
            return ascending ? aSubs[i] - bSubs[i] : bSubs[i] - aSubs[i];
        }
    }
    return a.id.localeCompare(b.id);
}
export function formatDate(raw) {
    if (!raw)
        return '—';
    const d = new Date(raw);
    if (isNaN(d.getTime()))
        return raw;
    return d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

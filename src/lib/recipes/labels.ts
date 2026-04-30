export const TAG_LABELS: Record<string, string> = {
  vegetarian: 'Végétarien',
  vegan: 'Vegan',
  gluten_free: 'Sans gluten',
  dairy_free: 'Sans lactose',
  nut_free: 'Sans noix',
  quick: 'Rapide',
  family: 'Famille',
  light: 'Léger',
  batch_cooking: 'Batch cooking',
  high_protein: 'Protéiné',
}

export const SEASON_LABELS: Record<string, string> = {
  spring: 'Printemps',
  summer: 'Été',
  autumn: 'Automne',
  winter: 'Hiver',
}

export function formatTag(value: string) {
  return TAG_LABELS[value] ?? value.replaceAll('_', ' ')
}

export function formatSeason(value: string) {
  return SEASON_LABELS[value] ?? value
}

export function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',')
}

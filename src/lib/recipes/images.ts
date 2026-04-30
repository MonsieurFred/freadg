const RECIPE_IMAGE_BY_KEY: Record<string, string> = {
  omelette: '/images/recipes/dish-omelette-champignons.jpg',
  lentilles: '/images/recipes/dish-salade-lentilles.jpg',
  tacos: '/images/recipes/dish-tacos-haricots.jpg',
  haricots: '/images/recipes/dish-tacos-haricots.jpg',
  pates: '/images/recipes/dish-pates-courgettes.jpg',
  courgettes: '/images/recipes/dish-pates-courgettes.jpg',
  curry: '/images/recipes/dish-curry-pois-chiches.jpg',
  chiches: '/images/recipes/dish-curry-pois-chiches.jpg',
  saumon: '/images/recipes/dish-saumon-laque.jpg',
  poulet: '/images/recipes/dish-poulet-four.jpg',
}

export function getRecipeImageUrl(title: string, photoUrl?: string | null) {
  if (photoUrl) return photoUrl

  const normalizedTitle = normalize(title)
  const matchedKey = Object.keys(RECIPE_IMAGE_BY_KEY).find((key) => normalizedTitle.includes(key))

  return matchedKey ? RECIPE_IMAGE_BY_KEY[matchedKey] : '/images/recipes/dish-curry-pois-chiches.jpg'
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

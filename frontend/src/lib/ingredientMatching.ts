export function normalizeIngredient(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[.,!?()]/g, "")
    .replace(/\s+/g, " ");
}

// Removes quantities and common measurement words from a recipe ingredient.
// Example:
// "150g Pasta" → "pasta"
// "2 cloves Garlic" → "garlic"
// "100g Spinach" → "spinach"
// "1 Lemon" → "lemon"
export function getIngredientName(value: string) {
  return normalizeIngredient(value)
    .replace(
      /^\d+(?:[.,]\d+)?\s*(?:g|kg|mg|ml|l|oz|lb|lbs|cloves?|pieces?|pcs?|cups?|tbsp|tsp|tablespoons?|teaspoons?|slices?|slice|cans?|packages?|packs?)\s+(?:of\s+)?/i,
      ""
    )
    .replace(/^of\s+/i, "")
    .trim();
}

export function ingredientMatchesPantry(
  recipeIngredient: string,
  pantryIngredient: string
) {
  const recipeName = getIngredientName(recipeIngredient);
  const pantryName = getIngredientName(pantryIngredient);

  if (!recipeName || !pantryName) {
    return false;
  }

  // Exact match
  if (recipeName === pantryName) {
    return true;
  }

  // Basic singular/plural matching
  if (
    recipeName === `${pantryName}s` ||
    pantryName === `${recipeName}s`
  ) {
    return true;
  }

  return false;
}

export function matchScore(
  recipeIngredients: string[],
  pantryIngredients: string[]
) {
  if (!recipeIngredients || recipeIngredients.length === 0) {
    return 0;
  }

  const matched = recipeIngredients.filter((recipeIngredient) =>
    pantryIngredients.some((pantryIngredient) =>
      ingredientMatchesPantry(recipeIngredient, pantryIngredient)
    )
  ).length;

  return Math.round((matched / recipeIngredients.length) * 100);
}
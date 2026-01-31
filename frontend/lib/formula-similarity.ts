/**
 * Formula Similarity Calculation Utilities
 *
 * Calculates similarity between formulas based on shared herbs,
 * considering both presence and relative proportions.
 */

import type { HerbIngredient } from '@/types/drupal';

export interface FormulaSimilarityResult {
  formulaId: string;
  formulaTitle: string;
  similarityScore: number;  // 0-100 percentage
  sharedHerbCount: number;
  totalHerbsInComparison: number;
  sharedHerbs: SharedHerb[];
}

export interface SharedHerb {
  herbId: string;
  herbTitle: string;
  percentageInSource: number;
  percentageInTarget: number;
}

interface NormalizedIngredient {
  id: string;
  title: string;
  percentage: number;
}

/**
 * Normalize ingredients to percentages for comparison
 */
function normalizeIngredients(
  ingredients: HerbIngredient[],
  totalWeight?: number
): NormalizedIngredient[] {
  // Calculate total if not provided
  const total = totalWeight || ingredients.reduce((sum, i) => sum + (i.field_quantity || 0), 0);

  if (total === 0) {
    // Equal distribution if no weights
    const equalPercentage = 100 / ingredients.length;
    return ingredients.map(i => ({
      id: i.id,
      title: i.title,
      percentage: equalPercentage,
    }));
  }

  return ingredients.map(i => ({
    id: i.id,
    title: i.title,
    percentage: i.field_percentage || ((i.field_quantity || 0) / total * 100),
  }));
}

/**
 * Calculate Jaccard similarity (intersection over union) for herb sets
 * Returns a value between 0 and 1
 */
function calculateJaccardSimilarity(
  herbsA: Set<string>,
  herbsB: Set<string>
): number {
  const intersection = new Set([...herbsA].filter(x => herbsB.has(x)));
  const union = new Set([...herbsA, ...herbsB]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Calculate weighted similarity based on herb proportions
 * Uses cosine similarity of percentage vectors for shared herbs
 */
function calculateWeightedSimilarity(
  normalizedA: NormalizedIngredient[],
  normalizedB: NormalizedIngredient[]
): number {
  const mapA = new Map(normalizedA.map(i => [i.id, i.percentage]));
  const mapB = new Map(normalizedB.map(i => [i.id, i.percentage]));

  // Get shared herb IDs
  const sharedIds = [...mapA.keys()].filter(id => mapB.has(id));

  if (sharedIds.length === 0) return 0;

  // Calculate cosine similarity for shared herbs
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const id of sharedIds) {
    const pctA = mapA.get(id) || 0;
    const pctB = mapB.get(id) || 0;
    dotProduct += pctA * pctB;
    magnitudeA += pctA * pctA;
    magnitudeB += pctB * pctB;
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Calculate overall similarity between two formulas
 * Combines Jaccard (set overlap) and weighted (proportion) similarity
 */
export function calculateFormulaSimilarity(
  sourceIngredients: HerbIngredient[],
  sourceTotalWeight: number | undefined,
  targetIngredients: HerbIngredient[],
  targetTotalWeight: number | undefined
): { score: number; sharedHerbs: SharedHerb[] } {
  if (!sourceIngredients.length || !targetIngredients.length) {
    return { score: 0, sharedHerbs: [] };
  }

  const normalizedSource = normalizeIngredients(sourceIngredients, sourceTotalWeight);
  const normalizedTarget = normalizeIngredients(targetIngredients, targetTotalWeight);

  const sourceHerbIds = new Set(normalizedSource.map(i => i.id));
  const targetHerbIds = new Set(normalizedTarget.map(i => i.id));

  // Calculate Jaccard similarity (50% weight)
  const jaccardScore = calculateJaccardSimilarity(sourceHerbIds, targetHerbIds);

  // Calculate weighted similarity (50% weight)
  const weightedScore = calculateWeightedSimilarity(normalizedSource, normalizedTarget);

  // Combined score (weighted average)
  const combinedScore = (jaccardScore * 0.5 + weightedScore * 0.5) * 100;

  // Get shared herbs with their percentages
  const sourceMap = new Map(normalizedSource.map(i => [i.id, i]));
  const targetMap = new Map(normalizedTarget.map(i => [i.id, i]));

  const sharedHerbs: SharedHerb[] = [];
  for (const [id, sourceHerb] of sourceMap) {
    const targetHerb = targetMap.get(id);
    if (targetHerb) {
      sharedHerbs.push({
        herbId: id,
        herbTitle: sourceHerb.title,
        percentageInSource: Math.round(sourceHerb.percentage * 10) / 10,
        percentageInTarget: Math.round(targetHerb.percentage * 10) / 10,
      });
    }
  }

  // Sort shared herbs by source percentage (highest first)
  sharedHerbs.sort((a, b) => b.percentageInSource - a.percentageInSource);

  return {
    score: Math.round(combinedScore * 10) / 10, // Round to 1 decimal
    sharedHerbs,
  };
}

/**
 * Find similar formulas from a list
 * Returns formulas sorted by similarity score (highest first)
 */
export function findSimilarFormulas(
  sourceFormula: {
    id: string;
    ingredients: HerbIngredient[];
    totalWeight?: number;
  },
  allFormulas: Array<{
    id: string;
    title: string;
    ingredients: HerbIngredient[];
    totalWeight?: number;
  }>,
  options: {
    minSimilarity?: number;  // Minimum similarity score (0-100)
    maxResults?: number;      // Maximum number of results
  } = {}
): FormulaSimilarityResult[] {
  const { minSimilarity = 10, maxResults = 10 } = options;

  const results: FormulaSimilarityResult[] = [];

  for (const formula of allFormulas) {
    // Skip comparing with itself
    if (formula.id === sourceFormula.id) continue;

    const { score, sharedHerbs } = calculateFormulaSimilarity(
      sourceFormula.ingredients,
      sourceFormula.totalWeight,
      formula.ingredients,
      formula.totalWeight
    );

    // Only include if above minimum similarity
    if (score >= minSimilarity && sharedHerbs.length > 0) {
      const sourceHerbCount = sourceFormula.ingredients.length;
      const targetHerbCount = formula.ingredients.length;
      const uniqueHerbCount = new Set([
        ...sourceFormula.ingredients.map(i => i.id),
        ...formula.ingredients.map(i => i.id),
      ]).size;

      results.push({
        formulaId: formula.id,
        formulaTitle: formula.title,
        similarityScore: score,
        sharedHerbCount: sharedHerbs.length,
        totalHerbsInComparison: uniqueHerbCount,
        sharedHerbs,
      });
    }
  }

  // Sort by similarity score (highest first)
  results.sort((a, b) => b.similarityScore - a.similarityScore);

  // Limit results
  return results.slice(0, maxResults);
}

/**
 * Get a human-readable similarity description
 */
export function getSimilarityLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 80) {
    return { label: 'Very Similar', color: 'text-green-700 bg-green-100' };
  } else if (score >= 60) {
    return { label: 'Similar', color: 'text-blue-700 bg-blue-100' };
  } else if (score >= 40) {
    return { label: 'Moderately Similar', color: 'text-amber-700 bg-amber-100' };
  } else if (score >= 20) {
    return { label: 'Somewhat Similar', color: 'text-orange-700 bg-orange-100' };
  } else {
    return { label: 'Low Similarity', color: 'text-gray-700 bg-gray-100' };
  }
}

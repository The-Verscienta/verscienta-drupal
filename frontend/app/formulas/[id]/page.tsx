import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { drupal } from '@/lib/drupal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { FormulaEntity } from '@/types/drupal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SafeHtml } from '@/components/ui/SafeHtml';
import { GroupedIngredientsList } from '@/components/formula';
import { HerbRoleBadge } from '@/components/formula/HerbRoleBadge';
import { SimilarFormulasSkeleton, ContributionsSkeleton } from '@/components/formula/LoadingSkeletons';
import { getTextValue, getProcessedValue, hasTextContent } from '@/lib/drupal-helpers';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

// Lazy load heavy client components
const SimilarFormulas = dynamic(
  () => import('@/components/formula/SimilarFormulas').then(mod => ({ default: mod.SimilarFormulas })),
  { loading: () => <SimilarFormulasSkeleton /> }
);

const ContributionsSection = dynamic(
  () => import('@/components/formula/ContributionsSection').then(mod => ({ default: mod.ContributionsSection })),
  { loading: () => <ContributionsSkeleton /> }
);

interface FormulaDetailProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate static params for all formulas at build time
export async function generateStaticParams() {
  try {
    const formulas = await drupal.getResourceCollection<FormulaEntity[]>('node--formula', {
      params: {
        'filter[status]': 1,
        'fields[node--formula]': 'id', // Only fetch IDs
        'page[limit]': 100,
      },
    });

    return (formulas || []).map((formula) => ({
      id: formula.id,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

async function getFormula(id: string): Promise<FormulaEntity | null> {
  try {
    const drupalUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || 'https://backend.ddev.site';
    const params = new URLSearchParams({
      include: 'field_herb_ingredients,field_herb_ingredients.field_herb_reference,field_conditions',
    });

    const response = await fetch(
      `${drupalUrl}/jsonapi/node/formula/${id}?${params.toString()}`,
      {
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch formula:', response.status);
      return null;
    }

    const json = await response.json();
    const data = json.data;
    const included = json.included || [];

    // Build a map of included entities
    const includedMap = new Map<string, any>();
    for (const item of included) {
      includedMap.set(item.id, item);
    }

    // Process herb ingredients from paragraphs
    const herbIngredients: FormulaEntity['field_herb_ingredients'] = [];
    const ingredientRefs = data.relationships?.field_herb_ingredients?.data || [];

    for (const ref of ingredientRefs) {
      const paragraph = includedMap.get(ref.id);
      if (paragraph) {
        const herbRef = paragraph.relationships?.field_herb_reference?.data;
        const herbData = herbRef ? includedMap.get(herbRef.id) : null;

        herbIngredients.push({
          id: herbData?.id || ref.id,
          type: herbData?.type || 'node--herb',
          title: herbData?.attributes?.title || paragraph.attributes?.field_herb_name || 'Herb',
          field_quantity: parseFloat(paragraph.attributes?.field_quantity) || 0,
          field_unit: paragraph.attributes?.field_unit || 'g',
          field_percentage: paragraph.attributes?.field_percentage
            ? parseFloat(paragraph.attributes.field_percentage)
            : undefined,
          field_role: paragraph.attributes?.field_role,
          field_function: paragraph.attributes?.field_function,
          field_notes: paragraph.attributes?.field_notes,
        });
      }
    }

    // Process conditions
    const conditions: FormulaEntity['field_conditions'] = [];
    const conditionRefs = data.relationships?.field_conditions?.data || [];
    for (const ref of conditionRefs) {
      const condition = includedMap.get(ref.id);
      conditions.push({
        id: ref.id,
        type: ref.type,
        title: condition?.attributes?.title,
      });
    }

    return {
      id: data.id,
      type: data.type,
      title: data.attributes?.title || '',
      status: data.attributes?.status,
      langcode: data.attributes?.langcode || 'en',
      created: data.attributes?.created,
      changed: data.attributes?.changed,
      path: data.attributes?.path || { alias: '', langcode: 'en' },
      body: data.attributes?.body,
      field_formula_description: data.attributes?.field_formula_description,
      field_preparation_instructions: data.attributes?.field_preparation_instructions,
      field_dosage: data.attributes?.field_dosage,
      field_total_weight: data.attributes?.field_total_weight,
      field_total_weight_unit: data.attributes?.field_total_weight_unit,
      field_use_cases: data.attributes?.field_use_cases,
      field_herb_ingredients: herbIngredients,
      field_conditions: conditions,
    };
  } catch (error) {
    console.error('Failed to fetch formula:', error);
    return null;
  }
}

export default async function FormulaDetailPage({ params }: FormulaDetailProps) {
  const { id } = await params;
  const formula = await getFormula(id);

  if (!formula) {
    notFound();
  }

  const name = formula.title || 'Formula';
  // field_total_weight comes as a string from Drupal, convert to number
  const totalWeight = typeof formula.field_total_weight === 'string'
    ? parseFloat(formula.field_total_weight)
    : (formula.field_total_weight || 0);
  const weightUnit = formula.field_total_weight_unit || 'g';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Formulas', href: '/formulas' },
          { label: name },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-6xl mb-4">🌿</div>
            <h1 className="text-4xl font-bold text-earth-800 mb-2">
              {name}
            </h1>
            {totalWeight > 0 && (
              <p className="text-lg text-sage-600">
                Total Formula Weight: {totalWeight} {weightUnit}
              </p>
            )}
          </div>
        </div>

        {/* Description - sanitized to prevent XSS */}
        {(formula.body?.value || hasTextContent(formula.field_formula_description)) && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-earth-800 mb-3">Description</h3>
            <div className="prose max-w-none">
              {formula.body?.value && (
                <SafeHtml html={formula.body.value} />
              )}
              {hasTextContent(formula.field_formula_description) && !formula.body?.value && (
                <p>{getTextValue(formula.field_formula_description)}</p>
              )}
            </div>
          </div>
        )}

        {/* Use Cases */}
        {formula.field_use_cases && formula.field_use_cases.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-earth-800 mb-3">Use Cases</h3>
            <div className="flex flex-wrap gap-2">
              {formula.field_use_cases.map((useCase, idx) => (
                <span
                  key={idx}
                  className="bg-earth-100 text-earth-700 px-4 py-2 rounded-lg font-medium"
                >
                  {useCase}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conditions */}
        {formula.field_conditions && formula.field_conditions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-earth-800 mb-3">Related Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {formula.field_conditions.map((condition) => (
                <Link
                  key={condition.id}
                  href={`/conditions/${condition.id}`}
                  className="bg-sage-100 hover:bg-sage-200 text-sage-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  {condition.title || 'Condition'}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Herb Ingredients */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-earth-800 mb-4">
          Herb Ingredients
        </h2>

        {!formula.field_herb_ingredients || formula.field_herb_ingredients.length === 0 ? (
          <p className="text-gray-600">No ingredients specified for this formula.</p>
        ) : (
          <>
            {/* Enhanced Ingredient Cards with Role/Function */}
            <div className="mb-6">
              <GroupedIngredientsList
                ingredients={formula.field_herb_ingredients}
                totalWeight={totalWeight}
              />
            </div>

            {/* Summary Table */}
            <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
              <h3 className="font-semibold text-earth-800 mb-3">Formula Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sage-300">
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">Herb</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">Role</th>
                      <th className="text-right py-2 px-2 font-semibold text-gray-700">Quantity</th>
                      <th className="text-right py-2 px-2 font-semibold text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formula.field_herb_ingredients.map((ingredient, idx) => {
                      // Ensure numeric values for calculations
                      const fieldPercentage = typeof ingredient.field_percentage === 'string'
                        ? parseFloat(ingredient.field_percentage)
                        : (ingredient.field_percentage || 0);
                      const fieldQuantity = typeof ingredient.field_quantity === 'string'
                        ? parseFloat(ingredient.field_quantity)
                        : (ingredient.field_quantity || 0);
                      const percentage = fieldPercentage ||
                        (totalWeight > 0 ? (fieldQuantity / totalWeight * 100) : 0);

                      return (
                        <tr key={idx} className="border-b border-sage-200">
                          <td className="py-2 px-2">
                            <Link
                              href={`/herbs/${ingredient.id}`}
                              className="text-earth-700 hover:text-earth-900 hover:underline"
                            >
                              {ingredient.title || 'Herb'}
                            </Link>
                          </td>
                          <td className="py-2 px-2">
                            {ingredient.field_role ? (
                              <HerbRoleBadge role={ingredient.field_role} size="sm" />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right">
                            {ingredient.field_quantity} {ingredient.field_unit}
                          </td>
                          <td className="py-2 px-2 text-right">
                            {percentage > 0 ? `${percentage.toFixed(1)}%` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                    {totalWeight > 0 && (
                      <tr className="font-bold bg-sage-100">
                        <td className="py-2 px-2">Total</td>
                        <td className="py-2 px-2"></td>
                        <td className="py-2 px-2 text-right">{totalWeight} {weightUnit}</td>
                        <td className="py-2 px-2 text-right">100%</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Similar Formulas - Lazy loaded */}
      <Suspense fallback={<SimilarFormulasSkeleton />}>
        <SimilarFormulas formulaId={id} minSimilarity={10} maxResults={5} />
      </Suspense>

      {/* Preparation & Dosage */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-earth-800 mb-4">
          Preparation & Dosage
        </h2>

        <div className="space-y-4">
          {hasTextContent(formula.field_preparation_instructions) ? (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                <span>🔥</span>
                Preparation Instructions
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {getTextValue(formula.field_preparation_instructions)}
              </p>
            </div>
          ) : (
            <p className="text-gray-600">No preparation instructions provided.</p>
          )}

          {hasTextContent(formula.field_dosage) && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                <span>💊</span>
                Dosage
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {getTextValue(formula.field_dosage)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Community Contributions - Lazy loaded */}
      <Suspense fallback={<ContributionsSkeleton />}>
        <ContributionsSection formulaId={id} formulaTitle={name} />
      </Suspense>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Important Notice</h3>
            <p className="text-sm text-gray-700">
              This formula is provided for informational and educational purposes only.
              It is not intended to diagnose, treat, cure, or prevent any disease.
              Always consult with a qualified healthcare practitioner or licensed herbalist
              before using herbal formulas, especially if you are pregnant, nursing, taking
              medications, or have any medical conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link
          href="/formulas"
          className="inline-block text-sage-600 hover:text-sage-800 font-medium"
        >
          ← Back to All Formulas
        </Link>
      </div>
    </div>
  );
}

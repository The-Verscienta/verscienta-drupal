import { drupal } from '@/lib/drupal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ConditionEntity, ModalityEntity, FormulaEntity } from '@/types/drupal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SafeHtml } from '@/components/ui/SafeHtml';
import { getTextValue, hasTextContent } from '@/lib/drupal-helpers';

interface ConditionDetailProps {
  params: Promise<{
    id: string;
  }>;
}

async function getCondition(id: string) {
  try {
    // Note: field_modalities may not exist as entity reference in Drupal yet
    // Remove include param until relationship fields are configured in Drupal
    const condition = await drupal.getResource<ConditionEntity>('node--condition', id);
    return condition;
  } catch (error) {
    console.error('Failed to fetch condition:', error);
    return null;
  }
}

async function getRelatedFormulas(conditionId: string): Promise<FormulaEntity[]> {
  // Formula content type may not exist yet - wrapped in Promise to ensure errors are caught
  return Promise.resolve()
    .then(async () => {
      const formulas = await drupal.getResourceCollection<FormulaEntity[]>('node--formula', {
        params: {
          'filter[status]': 1,
        },
      });

      if (!formulas || !Array.isArray(formulas)) {
        return [];
      }

      return formulas.filter((formula: FormulaEntity) =>
        formula.field_conditions?.some(condition => condition.id === conditionId)
      );
    })
    .catch(() => {
      // Silently return empty array if content type doesn't exist or any error
      return [];
    });
}

export default async function ConditionDetailPage({ params }: ConditionDetailProps) {
  const { id } = await params;
  const condition = await getCondition(id);

  if (!condition) {
    notFound();
  }

  const relatedFormulas = await getRelatedFormulas(id);
  const name = condition.title || 'Condition';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Conditions', href: '/conditions' },
          { label: name },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-6xl mb-4">🏥</div>
            <h1 className="text-4xl font-bold text-earth-800 mb-2">
              {name}
            </h1>
            {condition.field_severity && (
              <span
                className={`inline-block px-3 py-1 rounded-lg font-medium ${
                  condition.field_severity === 'mild'
                    ? 'bg-green-100 text-green-700'
                    : condition.field_severity === 'moderate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                Severity: {condition.field_severity.charAt(0).toUpperCase() + condition.field_severity.slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {condition.body?.value && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-earth-800 mb-3">Overview</h3>
            <div className="prose max-w-none">
              <SafeHtml html={condition.body.value} />
            </div>
          </div>
        )}

        {/* Symptoms */}
        {condition.field_symptoms && condition.field_symptoms.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-earth-800 mb-3">Common Symptoms</h3>
            <ul className="grid md:grid-cols-2 gap-2">
              {condition.field_symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sage-600 mt-1">•</span>
                  <span className="text-gray-700">{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommended Modalities */}
      {condition.field_modalities && condition.field_modalities.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Recommended Holistic Modalities
          </h2>
          <p className="text-gray-600 mb-4">
            These holistic health modalities may be beneficial for managing {name}:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {condition.field_modalities.map((modality: any) => (
              <Link
                key={modality.id}
                href={`/modalities/${modality.id}`}
                className="block border border-sage-200 rounded-lg p-4 hover:shadow-md hover:border-sage-400 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-earth-800 text-lg mb-1">
                      {modality.title || 'Modality'}
                    </h3>
                    {modality.field_excels_at && modality.field_excels_at.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Excels at: {modality.field_excels_at.slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-sage-600 text-sm font-medium">
                    Learn More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Formulas */}
      {relatedFormulas.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Herbal Formulas for {name}
          </h2>
          <p className="text-gray-600 mb-4">
            Traditional herbal formulas that may help with this condition:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {relatedFormulas.map((formula) => (
              <Link
                key={formula.id}
                href={`/formulas/${formula.id}`}
                className="block border border-sage-200 rounded-lg p-4 hover:shadow-md hover:border-sage-400 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-earth-800 text-lg">
                    {formula.title}
                  </h3>
                  <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded">
                    {formula.field_herb_ingredients?.length || 0} herbs
                  </span>
                </div>

                {hasTextContent(formula.field_formula_description) && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {getTextValue(formula.field_formula_description)}
                  </p>
                )}

                <div className="text-sage-600 text-sm font-medium">
                  View Formula →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle Recommendations */}
      <div className="bg-gradient-to-r from-sage-50 to-earth-50 rounded-lg p-8 mb-6 border border-sage-200">
        <h2 className="text-2xl font-bold text-earth-800 mb-4">
          Holistic Management Approach
        </h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-earth-700 mb-2 flex items-center gap-2">
              <span>🧘</span>
              Mind-Body Practices
            </h3>
            <p className="text-sm">
              Consider incorporating stress reduction techniques, meditation, and gentle movement
              practices to support overall well-being.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-earth-700 mb-2 flex items-center gap-2">
              <span>🥗</span>
              Dietary Considerations
            </h3>
            <p className="text-sm">
              A whole-foods, nutrient-dense diet can support the body's natural healing processes.
              Consider consulting with a nutritionist for personalized guidance.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-earth-700 mb-2 flex items-center gap-2">
              <span>💚</span>
              Lifestyle Modifications
            </h3>
            <p className="text-sm">
              Adequate sleep, regular physical activity, and stress management are foundational
              to managing most health conditions holistically.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Important Medical Disclaimer</h3>
            <p className="text-sm text-gray-700">
              This information is provided for educational purposes only and is not intended
              to diagnose, treat, cure, or prevent any disease. It should not replace
              professional medical advice, diagnosis, or treatment. Always consult with
              a qualified healthcare provider before making any changes to your health regimen,
              especially if you have a medical condition or are taking medications.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-earth-700 to-sage-700 text-white p-8 rounded-lg shadow-xl text-center mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Need Professional Guidance?
        </h2>
        <p className="mb-6 opacity-90">
          Connect with qualified holistic health practitioners who can provide personalized care.
        </p>
        <Link
          href="/practitioners"
          className="inline-block bg-white text-earth-800 px-8 py-3 rounded-lg font-semibold hover:bg-earth-50 transition shadow-lg"
        >
          Find a Practitioner
        </Link>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link
          href="/conditions"
          className="inline-block text-sage-600 hover:text-sage-800 font-medium"
        >
          ← Back to All Conditions
        </Link>
      </div>
    </div>
  );
}

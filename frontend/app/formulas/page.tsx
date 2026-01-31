import { drupal } from '@/lib/drupal';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SortDropdown } from '@/components/ui/SortDropdown';
import { ServerPagination, PaginationInfo } from '@/components/ui/ServerPagination';
import type { FormulaEntity } from '@/types/drupal';
import { getTextValue } from '@/lib/drupal-helpers';

// ISR: Revalidate every 5 minutes for fresh data with caching benefits
export const revalidate = 300;

const SORT_OPTIONS = [
  { value: 'title', label: 'Name (A-Z)' },
  { value: '-title', label: 'Name (Z-A)' },
  { value: '-created', label: 'Newest First' },
  { value: 'created', label: 'Oldest First' },
];

const PAGE_SIZE = 12;

export const metadata = {
  title: 'Herbal Formulas Database - Verscienta Health',
  description: 'Explore traditional and modern herbal formulas designed for specific health conditions with detailed ingredient lists and usage guidelines.',
};

// Formula category icons based on use cases
const formulaIcons: Record<string, string> = {
  digestive: '🫁',
  immune: '🛡️',
  stress: '🧘',
  sleep: '😴',
  respiratory: '🌬️',
  energy: '⚡',
  pain: '💊',
  skin: '✨',
  heart: '❤️',
  detox: '🍃',
  default: '🌿',
};

function getFormulaIcon(title: string, useCases?: string[]): string {
  const searchText = [title, ...(useCases || [])].join(' ').toLowerCase();

  for (const [key, icon] of Object.entries(formulaIcons)) {
    if (searchText.includes(key)) {
      return icon;
    }
  }

  // Additional keyword checks
  if (searchText.includes('calm') || searchText.includes('relax') || searchText.includes('anxiety')) {
    return '🧘';
  }
  if (searchText.includes('cold') || searchText.includes('flu') || searchText.includes('cough')) {
    return '🌬️';
  }
  if (searchText.includes('liver') || searchText.includes('cleanse')) {
    return '🍃';
  }

  return formulaIcons.default;
}

interface FormulasResult {
  formulas: FormulaEntity[];
  total: number;
}

async function getFormulas(sort: string = 'title', page: number = 1): Promise<FormulasResult> {
  try {
    const offset = (page - 1) * PAGE_SIZE;

    // Fetch formulas and count in parallel for better performance
    const [formulas, allFormulas] = await Promise.all([
      drupal.getResourceCollection<FormulaEntity[]>('node--formula', {
        params: {
          'sort': sort,
          'page[limit]': PAGE_SIZE,
          'page[offset]': offset,
          'filter[status]': 1,
          // Sparse fieldsets - only fetch fields we display in the list
          'fields[node--formula]': 'id,title,field_formula_description,field_use_cases,field_herb_ingredients,field_total_weight,field_total_weight_unit',
        },
      }),
      drupal.getResourceCollection<FormulaEntity[]>('node--formula', {
        params: {
          'filter[status]': 1,
          'fields[node--formula]': 'id', // Only fetch IDs for count
          'page[limit]': 500,
        },
      }),
    ]);

    return {
      formulas: formulas || [],
      total: allFormulas?.length || 0,
    };
  } catch (error) {
    console.error('Failed to fetch formulas:', error);
    return { formulas: [], total: 0 };
  }
}

interface PageProps {
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function FormulasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort || 'title';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const { formulas, total } = await getFormulas(sort, currentPage);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Count use cases for stats
  const useCaseCounts: Record<string, number> = {};
  formulas.forEach(formula => {
    formula.field_use_cases?.forEach(useCase => {
      useCaseCounts[useCase] = (useCaseCounts[useCase] || 0) + 1;
    });
  });

  // Get top use cases
  const topUseCases = Object.entries(useCaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Formulas' },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-3">
              Herbal Formulas
            </h1>
            <p className="text-xl text-sage-700 max-w-2xl">
              Discover traditional and modern herbal formulas combining multiple herbs for synergistic therapeutic effects.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SortDropdown options={SORT_OPTIONS} defaultValue="title" />
            <PaginationInfo
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
              totalItems={total}
            />
          </div>
        </div>

        {/* Use case highlights */}
        {topUseCases.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Popular uses:</span>
            {topUseCases.map(([useCase, count]) => (
              <span
                key={useCase}
                className="text-xs px-3 py-1 rounded-full bg-earth-100 text-earth-700 font-medium"
              >
                {useCase} ({count})
              </span>
            ))}
          </div>
        )}
      </div>

      {formulas.length === 0 ? (
        <div className="bg-gradient-to-br from-earth-50 to-sage-50 rounded-2xl p-12 text-center border border-earth-200">
          <div className="text-7xl mb-6">🌿</div>
          <h2 className="text-2xl font-bold text-earth-800 mb-3">
            No Formulas Found
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our formula database is being curated. Check back soon for traditional and modern herbal formulas.
          </p>
          <a
            href="https://backend.ddev.site/node/add/formula"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-earth-600 hover:bg-earth-700 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Add Formula
          </a>
        </div>
      ) : (
        <>
          {/* Featured Formulas */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {formulas.slice(0, 2).map((formula) => {
              const icon = getFormulaIcon(formula.title, formula.field_use_cases);
              const ingredientCount = formula.field_herb_ingredients?.length || 0;

              return (
                <Link
                  key={formula.id}
                  href={`/formulas/${formula.id}`}
                  className="group bg-gradient-to-br from-earth-50 to-sage-50 rounded-2xl p-8 border border-earth-200 hover:border-earth-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-4xl">{icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-earth-800 group-hover:text-earth-600 transition-colors">
                          {formula.title}
                        </h2>
                        {ingredientCount > 0 && (
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-sage-100 text-sage-700 border border-sage-200 whitespace-nowrap">
                            {ingredientCount} herbs
                          </span>
                        )}
                      </div>

                      {getTextValue(formula.field_formula_description) && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {getTextValue(formula.field_formula_description)}
                        </p>
                      )}

                      {formula.field_use_cases && formula.field_use_cases.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formula.field_use_cases.slice(0, 4).map((useCase, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white/70 text-earth-700 px-3 py-1 rounded-full"
                            >
                              {useCase}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 text-earth-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    View formula details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* All Formulas Grid */}
          <h2 className="text-2xl font-bold text-earth-800 mb-6">All Formulas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {formulas.slice(2).map((formula) => {
              const icon = getFormulaIcon(formula.title, formula.field_use_cases);
              const ingredientCount = formula.field_herb_ingredients?.length || 0;

              return (
                <Link
                  key={formula.id}
                  href={`/formulas/${formula.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-earth-200 transition-all overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-earth-50 to-sage-50 p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl">{icon}</span>
                      </div>
                      {ingredientCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sage-100 text-sage-700 border border-sage-200">
                          {ingredientCount} herbs
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-earth-800 mb-2 group-hover:text-earth-600 transition-colors">
                      {formula.title}
                    </h3>

                    {getTextValue(formula.field_formula_description) && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {getTextValue(formula.field_formula_description)}
                      </p>
                    )}

                    {formula.field_use_cases && formula.field_use_cases.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Uses:</p>
                        <div className="flex flex-wrap gap-1">
                          {formula.field_use_cases.slice(0, 2).map((useCase, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-earth-100 text-earth-700 px-2 py-0.5 rounded"
                            >
                              {useCase}
                            </span>
                          ))}
                          {formula.field_use_cases.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{formula.field_use_cases.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {formula.field_total_weight && (
                      <p className="text-xs text-gray-500 mb-3">
                        Total: {formula.field_total_weight}{formula.field_total_weight_unit || 'g'}
                      </p>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-earth-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Formula
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* If only 2 or fewer formulas */}
          {formulas.length <= 2 && formulas.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {formulas.map((formula) => {
                const icon = getFormulaIcon(formula.title, formula.field_use_cases);
                const ingredientCount = formula.field_herb_ingredients?.length || 0;

                return (
                  <Link
                    key={formula.id}
                    href={`/formulas/${formula.id}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-earth-200 transition-all p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-earth-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl">{icon}</span>
                      </div>
                      {ingredientCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sage-100 text-sage-700">
                          {ingredientCount} herbs
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-earth-800 mb-2">
                      {formula.title}
                    </h3>
                    {getTextValue(formula.field_formula_description) && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {getTextValue(formula.field_formula_description)}
                      </p>
                    )}
                    <span className="text-earth-600 font-medium text-sm">
                      View Formula →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <ServerPagination
              currentPage={currentPage}
              totalPages={totalPages}
              className="mb-12"
            />
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-earth-600 to-sage-600 rounded-2xl p-8 md:p-12 text-white text-center mb-8">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Explore Individual Herbs
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Learn about the individual herbs that make up these powerful formulas and their unique therapeutic properties.
            </p>
            <Link
              href="/herbs"
              className="inline-block bg-white text-earth-800 px-8 py-3 rounded-xl font-semibold hover:bg-earth-50 transition shadow-lg"
            >
              Browse Herbs Database
            </Link>
          </div>
        </>
      )}

      {/* Educational Section */}
      <div className="bg-gradient-to-r from-sage-50 to-earth-50 rounded-xl p-8 border border-sage-200 mb-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-earth-800 mb-4 text-center">
            Understanding Herbal Formulas
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">👑</span>
                <div>
                  <h3 className="font-semibold text-earth-800">Chief Herbs</h3>
                  <p className="text-sm text-gray-600">Target the primary condition with the main therapeutic action</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🤝</span>
                <div>
                  <h3 className="font-semibold text-earth-800">Deputy Herbs</h3>
                  <p className="text-sm text-gray-600">Support and enhance the effects of the chief herbs</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚖️</span>
                <div>
                  <h3 className="font-semibold text-earth-800">Assistant Herbs</h3>
                  <p className="text-sm text-gray-600">Balance the formula and reduce potential side effects</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🎯</span>
                <div>
                  <h3 className="font-semibold text-earth-800">Envoy Herbs</h3>
                  <p className="text-sm text-gray-600">Guide the formula to specific areas of the body</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Important Notice</h3>
            <p className="text-sm text-yellow-700">
              These formulas are for informational purposes only. Always consult with a qualified
              healthcare practitioner or licensed herbalist before using any herbal formula, especially
              if you are pregnant, nursing, or taking medications.
            </p>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link
          href="/"
          className="text-sage-600 hover:text-sage-800 font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

import { drupal } from '@/lib/drupal';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SortDropdown } from '@/components/ui/SortDropdown';
import { ServerPagination, PaginationInfo } from '@/components/ui/ServerPagination';
import type { ConditionEntity } from '@/types/drupal';

// Use dynamic rendering to avoid build errors when backend is unavailable
export const dynamic = 'force-dynamic';

const SORT_OPTIONS = [
  { value: 'title', label: 'Name (A-Z)' },
  { value: '-title', label: 'Name (Z-A)' },
  { value: '-created', label: 'Newest First' },
  { value: 'created', label: 'Oldest First' },
];

const PAGE_SIZE = 12;

export const metadata = {
  title: 'Health Conditions Database - Verscienta Health',
  description: 'Explore health conditions and discover natural approaches for managing them with holistic modalities and herbal remedies.',
};

// Condition category icons
const conditionIcons: Record<string, string> = {
  digestive: '🫁',
  respiratory: '🌬️',
  cardiovascular: '❤️',
  neurological: '🧠',
  musculoskeletal: '🦴',
  skin: '✋',
  immune: '🛡️',
  hormonal: '⚗️',
  mental: '🧘',
  sleep: '😴',
  pain: '⚡',
  default: '🏥',
};

function getConditionIcon(title: string): string {
  const lowerTitle = title.toLowerCase();
  for (const [key, icon] of Object.entries(conditionIcons)) {
    if (lowerTitle.includes(key)) {
      return icon;
    }
  }
  // Check for common condition keywords
  if (lowerTitle.includes('anxiety') || lowerTitle.includes('depression') || lowerTitle.includes('stress')) {
    return '🧘';
  }
  if (lowerTitle.includes('insomnia') || lowerTitle.includes('sleep')) {
    return '😴';
  }
  if (lowerTitle.includes('arthritis') || lowerTitle.includes('joint')) {
    return '🦴';
  }
  if (lowerTitle.includes('headache') || lowerTitle.includes('migraine')) {
    return '🧠';
  }
  return conditionIcons.default;
}

// Severity colors
const severityColors: Record<string, string> = {
  mild: 'bg-green-100 text-green-700 border-green-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  severe: 'bg-red-100 text-red-700 border-red-200',
};

interface ConditionsResult {
  conditions: ConditionEntity[];
  total: number;
}

async function getConditions(sort: string = 'title', page: number = 1): Promise<ConditionsResult> {
  try {
    const offset = (page - 1) * PAGE_SIZE;
    const conditions = await drupal.getResourceCollection<ConditionEntity[]>('node--condition', {
      params: {
        'sort': sort,
        'page[limit]': PAGE_SIZE,
        'page[offset]': offset,
        'filter[status]': 1,
      },
    });

    const allConditions = await drupal.getResourceCollection<ConditionEntity[]>('node--condition', {
      params: {
        'filter[status]': 1,
        'fields[node--condition]': 'id',
        'page[limit]': 500,
      },
    });

    return {
      conditions: conditions || [],
      total: allConditions?.length || 0,
    };
  } catch (error) {
    console.error('Failed to fetch conditions:', error);
    return { conditions: [], total: 0 };
  }
}

interface PageProps {
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function ConditionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort || 'title';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const { conditions, total } = await getConditions(sort, currentPage);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Group conditions by severity for stats
  const severityCounts: Record<string, number> = {};
  conditions.forEach(condition => {
    if (condition.field_severity) {
      severityCounts[condition.field_severity] = (severityCounts[condition.field_severity] || 0) + 1;
    }
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Conditions' },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-3">
              Health Conditions
            </h1>
            <p className="text-xl text-sage-700 max-w-2xl">
              Explore health conditions and discover natural approaches for managing them with holistic care.
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

        {/* Severity quick stats */}
        {Object.keys(severityCounts).length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">By severity:</span>
            {Object.entries(severityCounts).map(([severity, count]) => (
              <span
                key={severity}
                className={`text-xs px-3 py-1 rounded-full font-medium border ${severityColors[severity.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)} ({count})
              </span>
            ))}
          </div>
        )}
      </div>

      {conditions.length === 0 ? (
        <div className="bg-gradient-to-br from-sage-50 to-earth-50 rounded-2xl p-12 text-center border border-sage-200">
          <div className="text-7xl mb-6">🏥</div>
          <h2 className="text-2xl font-bold text-earth-800 mb-3">
            No Conditions Found
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our conditions database is being populated. Check back soon for comprehensive health information.
          </p>
          <a
            href="https://backend.ddev.site/node/add/condition"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-earth-600 hover:bg-earth-700 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Add Conditions
          </a>
        </div>
      ) : (
        <>
          {/* Featured Section - Top conditions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {conditions.slice(0, 2).map((condition) => {
              const icon = getConditionIcon(condition.title);
              const summary = condition.body?.value?.replace(/<[^>]*>/g, '').slice(0, 200);

              return (
                <Link
                  key={condition.id}
                  href={`/conditions/${condition.id}`}
                  className="group bg-gradient-to-br from-sage-50 to-earth-50 rounded-2xl p-8 border border-sage-200 hover:border-sage-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-4xl">{icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-earth-800 group-hover:text-earth-600 transition-colors">
                          {condition.title}
                        </h2>
                        {condition.field_severity && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${severityColors[condition.field_severity.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {condition.field_severity.charAt(0).toUpperCase() + condition.field_severity.slice(1)}
                          </span>
                        )}
                      </div>
                      {summary && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {summary}...
                        </p>
                      )}
                      {condition.field_symptoms && condition.field_symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {condition.field_symptoms.slice(0, 4).map((symptom, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white/70 text-sage-700 px-3 py-1 rounded-full"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 text-sage-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn about treatments
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* All Conditions Grid */}
          <h2 className="text-2xl font-bold text-earth-800 mb-6">All Conditions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {conditions.slice(2).map((condition) => {
              const icon = getConditionIcon(condition.title);
              const summary = condition.body?.value?.replace(/<[^>]*>/g, '').slice(0, 100);

              return (
                <Link
                  key={condition.id}
                  href={`/conditions/${condition.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-sage-200 transition-all overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-sage-50 to-earth-50 p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl">{icon}</span>
                      </div>
                      {condition.field_severity && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${severityColors[condition.field_severity.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {condition.field_severity.charAt(0).toUpperCase() + condition.field_severity.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-earth-800 mb-2 group-hover:text-earth-600 transition-colors">
                      {condition.title}
                    </h3>

                    {summary && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {summary}...
                      </p>
                    )}

                    {condition.field_symptoms && condition.field_symptoms.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Symptoms:</p>
                        <div className="flex flex-wrap gap-1">
                          {condition.field_symptoms.slice(0, 2).map((symptom, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded"
                            >
                              {symptom}
                            </span>
                          ))}
                          {condition.field_symptoms.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{condition.field_symptoms.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-sage-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details
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

          {/* If only 2 or fewer conditions, show as regular grid */}
          {conditions.length <= 2 && conditions.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {conditions.map((condition) => {
                const icon = getConditionIcon(condition.title);
                const summary = condition.body?.value?.replace(/<[^>]*>/g, '').slice(0, 100);

                return (
                  <Link
                    key={condition.id}
                    href={`/conditions/${condition.id}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-sage-200 transition-all p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl">{icon}</span>
                      </div>
                      {condition.field_severity && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${severityColors[condition.field_severity.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {condition.field_severity.charAt(0).toUpperCase() + condition.field_severity.slice(1)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-earth-800 mb-2">
                      {condition.title}
                    </h3>
                    {summary && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {summary}...
                      </p>
                    )}
                    <span className="text-sage-600 font-medium text-sm">
                      View Details →
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
          <div className="bg-gradient-to-r from-sage-600 to-earth-600 rounded-2xl p-8 md:p-12 text-white text-center mb-8">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Check Your Symptoms
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Use our AI-powered symptom checker to get personalized holistic health recommendations
              based on your symptoms.
            </p>
            <Link
              href="/symptom-checker"
              className="inline-block bg-white text-earth-800 px-8 py-3 rounded-xl font-semibold hover:bg-earth-50 transition shadow-lg"
            >
              Try Symptom Checker
            </Link>
          </div>
        </>
      )}

      {/* Educational Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Medical Disclaimer</h3>
            <p className="text-sm text-yellow-700">
              This information is for educational purposes only and should not replace professional medical advice.
              Always consult with a qualified healthcare provider for diagnosis and treatment of any health condition.
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

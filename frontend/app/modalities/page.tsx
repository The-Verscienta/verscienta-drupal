import { drupal } from '@/lib/drupal';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SortDropdown } from '@/components/ui/SortDropdown';
import { ServerPagination, PaginationInfo } from '@/components/ui/ServerPagination';

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
  title: 'Holistic Health Modalities - Verscienta Health',
  description: 'Discover various holistic health practices and therapeutic modalities that can support your wellness journey.',
};

interface Modality {
  id: string;
  type: string;
  title: string;
  field_excels_at?: string[];
  body?: {
    value: string;
    summary?: string;
    processed?: string;
  };
}

// Modality icons mapping
const modalityIcons: Record<string, string> = {
  acupuncture: '🪡',
  'herbal medicine': '🌿',
  massage: '💆',
  yoga: '🧘',
  meditation: '🧘‍♂️',
  ayurveda: '🕉️',
  naturopathy: '🌱',
  homeopathy: '💧',
  chiropractic: '🦴',
  reiki: '✨',
  aromatherapy: '🌸',
  nutrition: '🥗',
  default: '🧘',
};

function getModalityIcon(title: string): string {
  const lowerTitle = title.toLowerCase();
  for (const [key, icon] of Object.entries(modalityIcons)) {
    if (lowerTitle.includes(key)) {
      return icon;
    }
  }
  return modalityIcons.default;
}

interface ModalitiesResult {
  modalities: Modality[];
  total: number;
}

async function getModalities(sort: string = 'title', page: number = 1): Promise<ModalitiesResult> {
  try {
    const offset = (page - 1) * PAGE_SIZE;
    const modalities = await drupal.getResourceCollection<Modality[]>('node--modality', {
      params: {
        'sort': sort,
        'page[limit]': PAGE_SIZE,
        'page[offset]': offset,
        'filter[status]': 1,
      },
    });

    const allModalities = await drupal.getResourceCollection<Modality[]>('node--modality', {
      params: {
        'filter[status]': 1,
        'fields[node--modality]': 'id',
        'page[limit]': 500,
      },
    });

    return {
      modalities: modalities || [],
      total: allModalities?.length || 0,
    };
  } catch (error) {
    console.error('Failed to fetch modalities:', error);
    return { modalities: [], total: 0 };
  }
}

interface PageProps {
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function ModalitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort || 'title';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const { modalities, total } = await getModalities(sort, currentPage);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Group modalities by what they excel at
  const excellenceCategories: Record<string, number> = {};
  modalities.forEach(modality => {
    modality.field_excels_at?.forEach(item => {
      excellenceCategories[item] = (excellenceCategories[item] || 0) + 1;
    });
  });

  // Get top categories
  const topCategories = Object.entries(excellenceCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Modalities' },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-3">
              Holistic Modalities
            </h1>
            <p className="text-xl text-sage-700 max-w-2xl">
              Explore therapeutic practices and healing modalities for mind, body, and spirit wellness.
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

        {/* Category highlights */}
        {topCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Popular for:</span>
            {topCategories.map(([category, count]) => (
              <span
                key={category}
                className="text-xs px-3 py-1 rounded-full bg-sage-100 text-sage-700 font-medium"
              >
                {category} ({count})
              </span>
            ))}
          </div>
        )}
      </div>

      {modalities.length === 0 ? (
        <div className="bg-gradient-to-br from-sage-50 to-earth-50 rounded-2xl p-12 text-center border border-sage-200">
          <div className="text-7xl mb-6">🧘</div>
          <h2 className="text-2xl font-bold text-earth-800 mb-3">
            No Modalities Found
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our modalities database is being populated. Check back soon for holistic health practices.
          </p>
          <a
            href="https://backend.ddev.site/node/add/modality"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-earth-600 hover:bg-earth-700 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Add Modalities
          </a>
        </div>
      ) : (
        <>
          {/* Featured Section - Highlight top modalities */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {modalities.slice(0, 2).map((modality) => {
              const summary = modality.body?.summary ||
                modality.body?.processed?.replace(/<[^>]*>/g, '').slice(0, 200);
              const icon = getModalityIcon(modality.title);

              return (
                <Link
                  key={modality.id}
                  href={`/modalities/${modality.id}`}
                  className="group bg-gradient-to-br from-sage-50 to-earth-50 rounded-2xl p-8 border border-sage-200 hover:border-sage-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-4xl">{icon}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-earth-800 mb-2 group-hover:text-earth-600 transition-colors">
                        {modality.title}
                      </h2>
                      {summary && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {summary}...
                        </p>
                      )}
                      {modality.field_excels_at && modality.field_excels_at.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {modality.field_excels_at.slice(0, 4).map((item, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white/70 text-sage-700 px-3 py-1 rounded-full"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 text-sage-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore this modality
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* All Modalities Grid */}
          <h2 className="text-2xl font-bold text-earth-800 mb-6">All Modalities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {modalities.slice(2).map((modality) => {
              const summary = modality.body?.summary ||
                modality.body?.processed?.replace(/<[^>]*>/g, '').slice(0, 100);
              const icon = getModalityIcon(modality.title);

              return (
                <Link
                  key={modality.id}
                  href={`/modalities/${modality.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-sage-200 transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">{icon}</span>
                    </div>
                    {modality.field_excels_at && modality.field_excels_at.length > 0 && (
                      <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full">
                        {modality.field_excels_at.length} benefits
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-earth-800 mb-2 group-hover:text-earth-600 transition-colors">
                    {modality.title}
                  </h3>

                  {summary && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {summary}...
                    </p>
                  )}

                  {modality.field_excels_at && modality.field_excels_at.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {modality.field_excels_at.slice(0, 2).map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-sage-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Learn More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* If only 2 or fewer modalities, show the grid for all */}
          {modalities.length <= 2 && modalities.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {modalities.map((modality) => {
                const summary = modality.body?.summary ||
                  modality.body?.processed?.replace(/<[^>]*>/g, '').slice(0, 100);
                const icon = getModalityIcon(modality.title);

                return (
                  <Link
                    key={modality.id}
                    href={`/modalities/${modality.id}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-sage-200 transition-all p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl">{icon}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-earth-800 mb-2">
                      {modality.title}
                    </h3>
                    {summary && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {summary}...
                      </p>
                    )}
                    <span className="text-sage-600 font-medium text-sm">
                      Learn More →
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
              Find the Right Practitioner
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Ready to try a holistic modality? Connect with verified practitioners
              who specialize in these healing arts.
            </p>
            <Link
              href="/practitioners"
              className="inline-block bg-white text-earth-800 px-8 py-3 rounded-xl font-semibold hover:bg-earth-50 transition shadow-lg"
            >
              Browse Practitioners
            </Link>
          </div>
        </>
      )}

      {/* Educational Note */}
      <div className="bg-sage-50 border border-sage-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-sage-800 mb-1">Finding Your Path</h3>
            <p className="text-sm text-sage-700">
              Each modality offers unique benefits and approaches to wellness. Consider trying multiple
              modalities to find what resonates best with your body and health goals.
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

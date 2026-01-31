import { drupal } from '@/lib/drupal';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NewsletterSignup } from '@/components/NewsletterSignup';
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
  title: 'Medicinal Herbs Database - Verscienta Health',
  description: 'Explore our comprehensive collection of medicinal herbs, their therapeutic uses, benefits, and safety information.',
};

interface Herb {
  id: string;
  type: string;
  title?: string;
  attributes?: {
    title: string;
    field_scientific_name?: string;
    field_common_names?: string[];
    body?: {
      value: string;
      summary?: string;
    };
  };
  field_scientific_name?: string;
  field_common_names?: string[];
  field_primary_actions?: string[];
  field_tcm_temperature?: string;
  body?: {
    value: string;
    summary?: string;
    processed?: string;
  };
}

interface HerbsResult {
  herbs: Herb[];
  total: number;
}

async function getHerbs(sort: string = 'title', page: number = 1): Promise<HerbsResult> {
  try {
    const offset = (page - 1) * PAGE_SIZE;
    const herbs = await drupal.getResourceCollection<Herb[]>('node--herb', {
      params: {
        'sort': sort,
        'page[limit]': PAGE_SIZE,
        'page[offset]': offset,
        'filter[status]': 1,
      },
    });

    // Get total count (fetch all IDs only for counting)
    const allHerbs = await drupal.getResourceCollection<Herb[]>('node--herb', {
      params: {
        'filter[status]': 1,
        'fields[node--herb]': 'id',
        'page[limit]': 500,
      },
    });

    return {
      herbs: herbs || [],
      total: allHerbs?.length || 0,
    };
  } catch (error) {
    console.error('Failed to fetch herbs:', error);
    return { herbs: [], total: 0 };
  }
}

// Helper to get herb data (handles both normalized and unnormalized responses)
function getHerbData(herb: Herb) {
  return {
    id: herb.id,
    title: herb.title || herb.attributes?.title || 'Unnamed Herb',
    scientificName: herb.field_scientific_name || herb.attributes?.field_scientific_name,
    commonNames: herb.field_common_names || herb.attributes?.field_common_names || [],
    primaryActions: herb.field_primary_actions || [],
    tcmTemperature: herb.field_tcm_temperature,
    summary: herb.body?.summary || herb.body?.processed?.replace(/<[^>]*>/g, '').slice(0, 150) ||
             herb.attributes?.body?.summary,
  };
}

// Temperature badge colors
const temperatureColors: Record<string, string> = {
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-orange-100 text-orange-700',
  neutral: 'bg-gray-100 text-gray-700',
  cool: 'bg-blue-100 text-blue-700',
  cold: 'bg-indigo-100 text-indigo-700',
};

interface PageProps {
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function HerbsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = params.sort || 'title';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const { herbs, total } = await getHerbs(sort, currentPage);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Count unique characteristics for filter display
  const actionCounts: Record<string, number> = {};
  const temperatureCounts: Record<string, number> = {};

  herbs.forEach(herb => {
    const data = getHerbData(herb);
    data.primaryActions.forEach(action => {
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });
    if (data.tcmTemperature) {
      temperatureCounts[data.tcmTemperature] = (temperatureCounts[data.tcmTemperature] || 0) + 1;
    }
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Herbs' },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-3">
              Medicinal Herbs
            </h1>
            <p className="text-xl text-sage-700 max-w-2xl">
              Discover the healing power of nature with our comprehensive database of medicinal herbs.
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

        {/* Quick filters/stats */}
        {Object.keys(temperatureCounts).length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">TCM Temperature:</span>
            {Object.entries(temperatureCounts).map(([temp, count]) => (
              <span
                key={temp}
                className={`text-xs px-3 py-1 rounded-full font-medium ${temperatureColors[temp.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}
              >
                {temp} ({count})
              </span>
            ))}
          </div>
        )}
      </div>

      {herbs.length === 0 ? (
        <div className="bg-gradient-to-br from-earth-50 to-sage-50 rounded-2xl p-12 text-center border border-earth-200">
          <div className="text-7xl mb-6">🌿</div>
          <h2 className="text-2xl font-bold text-earth-800 mb-3">
            No Herbs Found
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our herb database is being populated. Check back soon or help us by adding herbs through the admin panel.
          </p>
          <a
            href="https://backend.ddev.site/node/add/herb"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-earth-600 hover:bg-earth-700 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Add Herbs
          </a>
        </div>
      ) : (
        <>
          {/* Herbs Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {herbs.map((herb) => {
              const data = getHerbData(herb);

              return (
                <Link
                  key={herb.id}
                  href={`/herbs/${herb.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-earth-200 transition-all overflow-hidden"
                >
                  {/* Card Header with Icon */}
                  <div className="bg-gradient-to-br from-earth-50 to-sage-50 p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-3xl">🌿</span>
                      </div>
                      {data.tcmTemperature && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${temperatureColors[data.tcmTemperature.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                          {data.tcmTemperature}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-earth-800 mb-1 group-hover:text-earth-600 transition-colors">
                      {data.title}
                    </h2>

                    {data.scientificName && (
                      <p className="text-sm italic text-sage-600 mb-3">
                        {data.scientificName}
                      </p>
                    )}

                    {data.commonNames.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {data.commonNames.slice(0, 2).map((name, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded"
                            >
                              {name}
                            </span>
                          ))}
                          {data.commonNames.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{data.commonNames.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {data.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {data.summary}...
                      </p>
                    )}

                    {data.primaryActions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {data.primaryActions.slice(0, 2).map((action, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-earth-100 text-earth-700 px-2 py-0.5 rounded"
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <span className="text-earth-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <ServerPagination
              currentPage={currentPage}
              totalPages={totalPages}
              className="mb-12"
            />
          )}

          {/* Newsletter Signup */}
          <NewsletterSignup variant="card" className="mb-12" />
        </>
      )}

      {/* Educational Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Educational Information</h3>
            <p className="text-sm text-yellow-700">
              The information provided here is for educational purposes only. Always consult with a qualified
              healthcare provider or herbalist before using any herbs, especially if you are pregnant, nursing,
              or taking medications.
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

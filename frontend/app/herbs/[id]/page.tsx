import { drupal } from '@/lib/drupal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { HerbEntity, DrupalTextField } from '@/types/drupal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SafeHtml } from '@/components/ui/SafeHtml';

// Helper to extract text value from Drupal text field
function getTextValue(field: DrupalTextField): string | null {
  if (!field) return null;
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && 'value' in field) return field.value;
  return null;
}

interface HerbDetailProps {
  params: Promise<{
    id: string;
  }>;
}

async function getHerb(id: string): Promise<HerbEntity | null> {
  try {
    const herb = await drupal.getResource<HerbEntity>('node--herb', id);
    return herb;
  } catch (error) {
    console.error('Failed to fetch herb:', error);
    return null;
  }
}

// Decorative botanical SVG border
function BotanicalDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-6 ${className}`}>
      <svg viewBox="0 0 200 24" className="w-48 h-6 text-earth-300" fill="currentColor">
        <path d="M100 12c-8-8-20-10-30-8s-18 8-25 8-15-4-25-4-18 4-20 4v4c2 0 10-4 20-4s18 4 25 4 15-6 25-8 22 0 30 8c8-8 20-10 30-8s18 8 25 8 15-4 25-4 18 4 20 4v-4c-2 0-10 4-20 4s-18-4-25-4-15 6-25 8-22 0-30-8z" opacity="0.6"/>
        <circle cx="100" cy="12" r="4"/>
        <circle cx="85" cy="12" r="2"/>
        <circle cx="115" cy="12" r="2"/>
      </svg>
    </div>
  );
}

// Section component with consistent styling
function Section({
  id,
  title,
  icon,
  variant = 'default',
  children
}: {
  id: string;
  title: string;
  icon: string;
  variant?: 'default' | 'warning' | 'tcm' | 'cultural';
  children: React.ReactNode;
}) {
  const variants = {
    default: 'bg-white border-earth-200',
    warning: 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200',
    tcm: 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-amber-300',
    cultural: 'bg-gradient-to-br from-sage-50 via-earth-50 to-gold-50 border-sage-300',
  };

  const titleColors = {
    default: 'text-earth-800',
    warning: 'text-red-800',
    tcm: 'text-amber-900',
    cultural: 'text-earth-800',
  };

  return (
    <section id={id} className={`relative border rounded-2xl p-8 mb-8 scroll-mt-24 ${variants[variant]}`}>
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-earth-600">
          <path d="M100 0v100H0C55 100 100 55 100 0z" fill="currentColor"/>
        </svg>
      </div>

      <h2 className={`font-serif text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 ${titleColors[variant]}`}>
        <span className="text-3xl">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

// Tag/Badge component
function Tag({
  children,
  variant = 'sage'
}: {
  children: React.ReactNode;
  variant?: 'sage' | 'earth' | 'amber' | 'blue' | 'purple' | 'red' | 'cyan' | 'orange';
}) {
  const variants = {
    sage: 'bg-sage-100 text-sage-800 border-sage-200',
    earth: 'bg-earth-100 text-earth-800 border-earth-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${variants[variant]} transition-all hover:scale-105`}>
      {children}
    </span>
  );
}

export default async function HerbDetailPage({ params }: HerbDetailProps) {
  const { id } = await params;
  const herb = await getHerb(id);

  if (!herb) {
    notFound();
  }

  const name = herb.title || 'Herb';

  // Build table of contents
  const tocItems: { id: string; label: string }[] = [];
  if (herb.body?.value) tocItems.push({ id: 'overview', label: 'Overview' });
  if (herb.field_botanical_description || herb.field_native_region || herb.field_habitat) {
    tocItems.push({ id: 'botanical', label: 'Botanical' });
  }
  if (herb.field_tcm_properties) tocItems.push({ id: 'tcm', label: 'TCM Properties' });
  if (herb.field_therapeutic_uses?.value || herb.field_western_properties) {
    tocItems.push({ id: 'therapeutic', label: 'Therapeutic Uses' });
  }
  if (herb.field_active_constituents?.length) tocItems.push({ id: 'constituents', label: 'Constituents' });
  if (herb.field_recommended_dosage?.length) tocItems.push({ id: 'dosage', label: 'Dosage' });
  if (herb.field_contraindications?.value || herb.field_side_effects?.value || herb.field_drug_interactions?.length) {
    tocItems.push({ id: 'safety', label: 'Safety' });
  }
  if (herb.field_traditional_chinese_uses?.value || herb.field_traditional_american_uses?.value) {
    tocItems.push({ id: 'traditional', label: 'Traditional Uses' });
  }
  if (herb.field_cultural_significance?.value || herb.field_folklore?.value) {
    tocItems.push({ id: 'cultural', label: 'Cultural Context' });
  }
  if (herb.field_preparation_methods?.length) tocItems.push({ id: 'preparation', label: 'Preparation' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-earth-50 via-white to-sage-50">
      {/* Decorative background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-2 8-8 14-16 16 8 2 14 8 16 16 2-8 8-14 16-16-8-2-14-8-16-16z' fill='%23527a5f' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Materia Medica', href: '/herbs' },
            { label: name },
          ]}
          className="mb-8"
        />

        {/* Hero Section */}
        <header className="relative mb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-earth-200 p-8 md:p-12 relative overflow-hidden">
                {/* Decorative botanical illustration placeholder */}
                <div className="absolute -right-12 -top-12 w-64 h-64 opacity-5">
                  <svg viewBox="0 0 200 200" className="w-full h-full text-earth-600">
                    <path d="M100 20c0 40-30 80-30 120s30 40 30 40 30 0 30-40-30-80-30-120z" fill="currentColor"/>
                    <path d="M60 100c30-20 70-20 80 0" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M50 120c40-30 90-30 100 0" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>

                {/* Conservation status badge */}
                {herb.field_conservation_status && (
                  <div className="absolute top-6 right-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                      herb.field_conservation_status === 'endangered'
                        ? 'bg-red-500 text-white'
                        : herb.field_conservation_status === 'vulnerable'
                        ? 'bg-amber-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-pulse" />
                      {herb.field_conservation_status.charAt(0).toUpperCase() + herb.field_conservation_status.slice(1)}
                    </span>
                  </div>
                )}

                <div className="relative">
                  {/* Common name */}
                  <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-earth-900 mb-4 tracking-tight">
                    {name}
                  </h1>

                  {/* Scientific name */}
                  {herb.field_scientific_name && (
                    <p className="text-2xl md:text-3xl text-sage-600 italic mb-6 font-serif">
                      {herb.field_scientific_name}
                    </p>
                  )}

                  {/* Family */}
                  {herb.field_family && (
                    <p className="text-lg text-earth-600 mb-8">
                      <span className="font-medium">Family:</span>{' '}
                      <span className="font-serif italic">{herb.field_family}</span>
                    </p>
                  )}

                  <BotanicalDivider />

                  {/* Quick info grid */}
                  <div className="grid sm:grid-cols-2 gap-6 mt-6">
                    {/* Common Names */}
                    {herb.field_common_names && herb.field_common_names.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-earth-500 uppercase tracking-wider mb-3">
                          Also Known As
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {herb.field_common_names.slice(0, 5).map((nameObj, idx) => (
                            <Tag key={idx} variant="sage">
                              {nameObj.field_name_text}
                              {nameObj.field_language && (
                                <span className="text-sage-500 ml-1 text-xs">({nameObj.field_language})</span>
                              )}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Parts Used */}
                    {herb.field_parts_used && herb.field_parts_used.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-earth-500 uppercase tracking-wider mb-3">
                          Parts Used
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {herb.field_parts_used.map((part, idx) => (
                            <Tag key={idx} variant="earth">{part}</Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Table of Contents */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <nav className="bg-white/80 backdrop-blur-sm rounded-2xl border border-earth-200 p-6 shadow-lg">
                <h3 className="text-sm font-bold text-earth-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h12"/>
                  </svg>
                  Contents
                </h3>
                <ul className="space-y-2">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block py-2 px-3 text-sm text-earth-600 hover:text-earth-900 hover:bg-earth-50 rounded-lg transition-colors font-medium"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        </header>

        {/* Main Content */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <main className="lg:col-span-2 space-y-8">

            {/* Overview */}
            {herb.body?.value && (
              <Section id="overview" title="Overview" icon="📖">
                <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-earth-800 prose-a:text-sage-600">
                  <SafeHtml html={herb.body.value} />
                </div>
              </Section>
            )}

            {/* Botanical Information */}
            {(herb.field_botanical_description || herb.field_native_region || herb.field_habitat) && (
              <Section id="botanical" title="Botanical Information" icon="🌱">
                {getTextValue(herb.field_botanical_description as DrupalTextField) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-earth-700 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                      Description
                    </h3>
                    <div className="prose max-w-none text-earth-700">
                      <SafeHtml html={getTextValue(herb.field_botanical_description as DrupalTextField)!} />
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {herb.field_native_region && herb.field_native_region.length > 0 && (
                    <div className="bg-sage-50/50 rounded-xl p-5 border border-sage-100">
                      <h3 className="text-sm font-bold text-sage-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        Native Regions
                      </h3>
                      <ul className="space-y-1.5">
                        {herb.field_native_region.map((region, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-earth-700">
                            <span className="w-1 h-1 rounded-full bg-sage-400" />
                            {region}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {getTextValue(herb.field_habitat as DrupalTextField) && (
                    <div className="bg-earth-50/50 rounded-xl p-5 border border-earth-100">
                      <h3 className="text-sm font-bold text-earth-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
                        </svg>
                        Habitat
                      </h3>
                      <div className="prose prose-sm max-w-none text-earth-700">
                        <SafeHtml html={getTextValue(herb.field_habitat as DrupalTextField)!} />
                      </div>
                    </div>
                  )}
                </div>

                {getTextValue(herb.field_conservation_notes as DrupalTextField) && (
                  <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-5">
                    <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                      Conservation Notes
                    </h3>
                    <div className="prose prose-sm max-w-none text-amber-900">
                      <SafeHtml html={getTextValue(herb.field_conservation_notes as DrupalTextField)!} />
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* TCM Properties */}
            {herb.field_tcm_properties && (
              <Section id="tcm" title="Traditional Chinese Medicine" icon="☯️" variant="tcm">
                <div className="grid md:grid-cols-2 gap-6">
                  {herb.field_tcm_properties.field_tcm_taste && herb.field_tcm_properties.field_tcm_taste.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3">Taste (味 Wèi)</h3>
                      <div className="flex flex-wrap gap-2">
                        {herb.field_tcm_properties.field_tcm_taste.map((taste, idx) => (
                          <Tag key={idx} variant="amber">{taste}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {herb.field_tcm_properties.field_tcm_temperature && (
                    <div>
                      <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3">Temperature (性 Xìng)</h3>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                        herb.field_tcm_properties.field_tcm_temperature.toLowerCase().includes('cold')
                          ? 'bg-blue-500 text-white'
                          : herb.field_tcm_properties.field_tcm_temperature.toLowerCase().includes('cool')
                          ? 'bg-cyan-400 text-cyan-900'
                          : herb.field_tcm_properties.field_tcm_temperature.toLowerCase().includes('warm')
                          ? 'bg-orange-400 text-orange-900'
                          : herb.field_tcm_properties.field_tcm_temperature.toLowerCase().includes('hot')
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}>
                        {herb.field_tcm_properties.field_tcm_temperature}
                      </span>
                    </div>
                  )}

                  {herb.field_tcm_properties.field_tcm_meridians && herb.field_tcm_properties.field_tcm_meridians.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3">Meridians (經絡 Jīngluò)</h3>
                      <div className="flex flex-wrap gap-2">
                        {herb.field_tcm_properties.field_tcm_meridians.map((meridian, idx) => (
                          <Tag key={idx} variant="purple">{meridian}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {herb.field_tcm_properties.field_tcm_category && (
                    <div>
                      <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3">Category</h3>
                      <Tag variant="orange">{herb.field_tcm_properties.field_tcm_category}</Tag>
                    </div>
                  )}
                </div>

                {getTextValue(herb.field_tcm_properties.field_tcm_functions as DrupalTextField) && (
                  <div className="mt-6 pt-6 border-t border-amber-200">
                    <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3">Functions & Indications</h3>
                    <div className="prose max-w-none text-amber-900">
                      <SafeHtml html={getTextValue(herb.field_tcm_properties.field_tcm_functions as DrupalTextField)!} />
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Therapeutic Uses */}
            {(herb.field_therapeutic_uses?.value || herb.field_western_properties) && (
              <Section id="therapeutic" title="Therapeutic Uses" icon="💊">
                {herb.field_therapeutic_uses?.value && (
                  <div className="mb-6 prose prose-lg max-w-none">
                    <SafeHtml html={herb.field_therapeutic_uses.value} />
                  </div>
                )}

                {herb.field_western_properties && herb.field_western_properties.length > 0 && (
                  <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
                      Western Herbal Properties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {herb.field_western_properties.map((prop, idx) => (
                        <Tag key={idx} variant="blue">{prop}</Tag>
                      ))}
                    </div>
                  </div>
                )}

                {herb.field_pharmacological_effects?.value && (
                  <div className="mt-6 pt-6 border-t border-earth-200">
                    <h3 className="text-lg font-semibold text-earth-700 mb-3">Pharmacological Effects</h3>
                    <div className="prose max-w-none">
                      <SafeHtml html={herb.field_pharmacological_effects.value} />
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Active Constituents */}
            {herb.field_active_constituents && herb.field_active_constituents.length > 0 && (
              <Section id="constituents" title="Active Constituents" icon="🔬">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-earth-200">
                        <th className="text-left py-3 px-4 font-bold text-earth-800 text-sm uppercase tracking-wider">Compound</th>
                        <th className="text-left py-3 px-4 font-bold text-earth-800 text-sm uppercase tracking-wider">Class</th>
                        <th className="text-right py-3 px-4 font-bold text-earth-800 text-sm uppercase tracking-wider">%</th>
                        <th className="text-left py-3 px-4 font-bold text-earth-800 text-sm uppercase tracking-wider">Effects</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-earth-100">
                      {herb.field_active_constituents.map((constituent, idx) => (
                        <tr key={idx} className="hover:bg-earth-50/50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-earth-900">{constituent.field_compound_name}</td>
                          <td className="py-3 px-4 text-earth-600">{constituent.field_compound_class || '—'}</td>
                          <td className="py-3 px-4 text-right font-mono text-earth-600">
                            {constituent.field_compound_percentage ? `${constituent.field_compound_percentage}%` : '—'}
                          </td>
                          <td className="py-3 px-4 text-earth-600 text-sm">{constituent.field_compound_effects || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Dosage */}
            {herb.field_recommended_dosage && herb.field_recommended_dosage.length > 0 && (
              <Section id="dosage" title="Recommended Dosage" icon="⚖️">
                <div className="grid gap-4">
                  {herb.field_recommended_dosage.map((dosage, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-sage-50 to-earth-50 rounded-xl p-5 border border-sage-200 hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-earth-800">{dosage.field_dosage_form}</span>
                        {dosage.field_dosage_population && (
                          <span className="text-xs font-semibold bg-sage-200 text-sage-800 px-2 py-1 rounded-full">
                            {dosage.field_dosage_population}
                          </span>
                        )}
                      </div>
                      <p className="text-earth-700 text-lg">
                        <span className="font-semibold">{dosage.field_dosage_amount}</span>
                        {dosage.field_dosage_frequency && (
                          <span className="text-earth-500"> — {dosage.field_dosage_frequency}</span>
                        )}
                      </p>
                      {dosage.field_dosage_notes && (
                        <p className="text-sm text-earth-500 mt-2 italic">{dosage.field_dosage_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Safety Information */}
            {(herb.field_contraindications?.value ||
              herb.field_side_effects?.value ||
              herb.field_drug_interactions ||
              herb.field_toxicity_info ||
              herb.field_safety_warnings) && (
              <Section id="safety" title="Safety Information" icon="⚠️" variant="warning">
                {herb.field_contraindications?.value && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      Contraindications
                    </h3>
                    <div className="prose max-w-none text-red-900">
                      <SafeHtml html={herb.field_contraindications.value} />
                    </div>
                  </div>
                )}

                {herb.field_side_effects?.value && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-orange-800 mb-3">Possible Side Effects</h3>
                    <div className="prose max-w-none text-orange-900">
                      <SafeHtml html={herb.field_side_effects.value} />
                    </div>
                  </div>
                )}

                {herb.field_drug_interactions && herb.field_drug_interactions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-red-800 mb-3">Drug Interactions</h3>
                    <div className="space-y-3">
                      {herb.field_drug_interactions.map((interaction, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                          <p className="font-bold text-red-900">{interaction.field_drug_name}</p>
                          <p className="text-sm font-semibold text-red-600 mt-1">
                            Interaction: {interaction.field_interaction_type}
                          </p>
                          <p className="text-sm text-red-800 mt-2">{interaction.field_interaction_description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {herb.field_toxicity_info && (
                  <div className="mb-6 bg-red-100 rounded-xl p-5 border border-red-300">
                    <h3 className="text-lg font-bold text-red-900 mb-3">Toxicity Information</h3>
                    <dl className="space-y-2">
                      {herb.field_toxicity_info.field_toxicity_level && (
                        <div className="flex gap-2">
                          <dt className="font-semibold text-red-800">Level:</dt>
                          <dd className="text-red-900">{herb.field_toxicity_info.field_toxicity_level}</dd>
                        </div>
                      )}
                      {herb.field_toxicity_info.field_toxic_compounds && (
                        <div className="flex gap-2">
                          <dt className="font-semibold text-red-800">Compounds:</dt>
                          <dd className="text-red-900">{herb.field_toxicity_info.field_toxic_compounds}</dd>
                        </div>
                      )}
                      {herb.field_toxicity_info.field_toxic_symptoms && (
                        <div className="flex gap-2">
                          <dt className="font-semibold text-red-800">Symptoms:</dt>
                          <dd className="text-red-900">{herb.field_toxicity_info.field_toxic_symptoms}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {herb.field_safety_warnings && herb.field_safety_warnings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-red-800 mb-3">Safety Warnings</h3>
                    <div className="space-y-3">
                      {herb.field_safety_warnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg p-4 border-l-4 ${
                            warning.field_warning_severity === 'severe'
                              ? 'bg-red-100 border-red-600'
                              : warning.field_warning_severity === 'moderate'
                              ? 'bg-orange-100 border-orange-500'
                              : 'bg-yellow-100 border-yellow-500'
                          }`}
                        >
                          <p className="font-bold">{warning.field_warning_type}</p>
                          <p className="text-sm mt-1">{warning.field_warning_description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Traditional Uses */}
            {(herb.field_traditional_chinese_uses?.value ||
              herb.field_traditional_american_uses?.value ||
              herb.field_native_american_uses?.value) && (
              <Section id="traditional" title="Traditional Uses" icon="📜">
                <div className="space-y-6">
                  {herb.field_traditional_chinese_uses?.value && (
                    <div className="bg-red-50/30 rounded-xl p-6 border border-red-100">
                      <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-3">
                        <span className="text-2xl">🇨🇳</span> Traditional Chinese Uses
                      </h3>
                      <div className="prose max-w-none text-red-900">
                        <SafeHtml html={herb.field_traditional_chinese_uses.value} />
                      </div>
                    </div>
                  )}

                  {herb.field_traditional_american_uses?.value && (
                    <div className="bg-blue-50/30 rounded-xl p-6 border border-blue-100">
                      <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-3">
                        <span className="text-2xl">🇺🇸</span> Traditional American Uses
                      </h3>
                      <div className="prose max-w-none text-blue-900">
                        <SafeHtml html={herb.field_traditional_american_uses.value} />
                      </div>
                    </div>
                  )}

                  {herb.field_native_american_uses?.value && (
                    <div className="bg-amber-50/30 rounded-xl p-6 border border-amber-100">
                      <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-3">
                        <span className="text-2xl">🪶</span> Native American Uses
                      </h3>
                      <div className="prose max-w-none text-amber-900">
                        <SafeHtml html={herb.field_native_american_uses.value} />
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Cultural Context */}
            {(herb.field_cultural_significance?.value ||
              herb.field_folklore?.value ||
              herb.field_ethnobotanical_notes?.value) && (
              <Section id="cultural" title="Cultural & Historical Context" icon="🏛️" variant="cultural">
                {herb.field_cultural_significance?.value && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-earth-700 mb-3">Cultural Significance</h3>
                    <div className="prose max-w-none">
                      <SafeHtml html={herb.field_cultural_significance.value} />
                    </div>
                  </div>
                )}

                {herb.field_folklore?.value && (
                  <div className="mb-6 bg-gold-50/50 rounded-xl p-6 border border-gold-200">
                    <h3 className="text-lg font-semibold text-gold-800 mb-3 flex items-center gap-2">
                      <span>✨</span> Folklore & Legends
                    </h3>
                    <div className="prose max-w-none text-gold-900 italic">
                      <SafeHtml html={herb.field_folklore.value} />
                    </div>
                  </div>
                )}

                {herb.field_ethnobotanical_notes?.value && (
                  <div>
                    <h3 className="text-lg font-semibold text-earth-700 mb-3">Ethnobotanical Notes</h3>
                    <div className="prose max-w-none">
                      <SafeHtml html={herb.field_ethnobotanical_notes.value} />
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Preparation Methods */}
            {herb.field_preparation_methods && herb.field_preparation_methods.length > 0 && (
              <Section id="preparation" title="Preparation Methods" icon="🫖">
                <div className="grid md:grid-cols-2 gap-4">
                  {herb.field_preparation_methods.map((method, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-sage-50 to-earth-50 rounded-xl p-5 border border-sage-200 hover:shadow-lg transition-all hover:-translate-y-1">
                      <h3 className="font-bold text-earth-800 text-lg mb-2">{method.field_method_type}</h3>
                      <p className="text-earth-700 text-sm leading-relaxed">{method.field_method_instructions}</p>
                      {method.field_method_time && (
                        <p className="text-sage-600 text-sm mt-3 font-medium flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                          {method.field_method_time}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Storage & Sourcing */}
            {(herb.field_storage_requirements || herb.field_sourcing_info) && (
              <Section id="storage" title="Storage & Sourcing" icon="📦">
                <div className="grid md:grid-cols-2 gap-6">
                  {herb.field_storage_requirements && (
                    <div className="bg-earth-50/50 rounded-xl p-5 border border-earth-100">
                      <h3 className="text-sm font-bold text-earth-700 uppercase tracking-wider mb-4">Storage Requirements</h3>
                      <dl className="space-y-3">
                        {herb.field_storage_requirements.field_storage_conditions && (
                          <div>
                            <dt className="text-xs font-semibold text-earth-500 uppercase">Conditions</dt>
                            <dd className="text-earth-800">{herb.field_storage_requirements.field_storage_conditions}</dd>
                          </div>
                        )}
                        {herb.field_storage_requirements.field_shelf_life && (
                          <div>
                            <dt className="text-xs font-semibold text-earth-500 uppercase">Shelf Life</dt>
                            <dd className="text-earth-800">{herb.field_storage_requirements.field_shelf_life}</dd>
                          </div>
                        )}
                        {herb.field_storage_requirements.field_storage_temperature && (
                          <div>
                            <dt className="text-xs font-semibold text-earth-500 uppercase">Temperature</dt>
                            <dd className="text-earth-800">{herb.field_storage_requirements.field_storage_temperature}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                  {herb.field_sourcing_info && (
                    <div className="bg-sage-50/50 rounded-xl p-5 border border-sage-100">
                      <h3 className="text-sm font-bold text-sage-700 uppercase tracking-wider mb-4">Sourcing Information</h3>
                      <dl className="space-y-3">
                        {herb.field_sourcing_info.field_sourcing_type && (
                          <div>
                            <dt className="text-xs font-semibold text-sage-500 uppercase">Type</dt>
                            <dd className="text-sage-800">{herb.field_sourcing_info.field_sourcing_type}</dd>
                          </div>
                        )}
                        {herb.field_sourcing_info.field_organic_available !== undefined && (
                          <div>
                            <dt className="text-xs font-semibold text-sage-500 uppercase">Organic Available</dt>
                            <dd className="text-sage-800">{herb.field_sourcing_info.field_organic_available ? 'Yes' : 'No'}</dd>
                          </div>
                        )}
                        {herb.field_sourcing_info.field_sustainable_harvest && (
                          <div>
                            <dt className="text-xs font-semibold text-sage-500 uppercase">Sustainability</dt>
                            <dd className="text-sage-800">{herb.field_sourcing_info.field_sustainable_harvest}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Related Content */}
            {((herb.field_conditions_treated && herb.field_conditions_treated.length > 0) ||
              (herb.field_related_species && herb.field_related_species.length > 0) ||
              (herb.field_substitute_herbs && herb.field_substitute_herbs.length > 0)) && (
              <Section id="related" title="Related Information" icon="🔗">
                {herb.field_conditions_treated && herb.field_conditions_treated.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-earth-600 uppercase tracking-wider mb-3">Conditions Treated</h3>
                    <div className="flex flex-wrap gap-2">
                      {herb.field_conditions_treated.map((condition) => (
                        <Link
                          key={condition.id}
                          href={`/conditions/${condition.id}`}
                          className="inline-flex items-center gap-2 bg-sage-100 hover:bg-sage-200 text-sage-800 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 hover:shadow-md"
                        >
                          {condition.title || 'View Condition'}
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {herb.field_related_species && herb.field_related_species.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-earth-600 uppercase tracking-wider mb-3">Related Species</h3>
                    <div className="flex flex-wrap gap-2">
                      {herb.field_related_species.map((species) => (
                        <Link
                          key={species.id}
                          href={`/herbs/${species.id}`}
                          className="inline-flex items-center gap-2 bg-earth-100 hover:bg-earth-200 text-earth-800 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 hover:shadow-md"
                        >
                          {species.title || 'View Herb'}
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {herb.field_substitute_herbs && herb.field_substitute_herbs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-earth-600 uppercase tracking-wider mb-3">Substitute Herbs</h3>
                    <div className="flex flex-wrap gap-2">
                      {herb.field_substitute_herbs.map((substitute) => (
                        <Link
                          key={substitute.id}
                          href={`/herbs/${substitute.id}`}
                          className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 hover:shadow-md"
                        >
                          {substitute.title || 'View Herb'}
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            <BotanicalDivider />

            {/* Disclaimer */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-8 shadow-sm">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-lg mb-2">Important Disclaimer</h3>
                  <p className="text-amber-800 leading-relaxed">
                    This information is provided for educational and informational purposes only.
                    It is not intended to diagnose, treat, cure, or prevent any disease. Always
                    consult with a qualified healthcare provider or licensed herbalist before using
                    any herbal remedy, especially if you are pregnant, nursing, taking medications,
                    or have any medical conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <div className="text-center py-8">
              <Link
                href="/herbs"
                className="inline-flex items-center gap-3 text-earth-600 hover:text-earth-800 font-semibold text-lg transition-colors group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Materia Medica
              </Link>
            </div>
          </main>

          {/* Right column spacer for layout balance */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
}

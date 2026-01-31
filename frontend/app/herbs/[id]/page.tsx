import { drupal } from '@/lib/drupal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { HerbEntity } from '@/types/drupal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SafeHtml } from '@/components/ui/SafeHtml';

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

export default async function HerbDetailPage({ params }: HerbDetailProps) {
  const { id } = await params;
  const herb = await getHerb(id);

  if (!herb) {
    notFound();
  }

  const name = herb.title || 'Herb';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Herbs', href: '/herbs' },
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
            {herb.field_scientific_name && (
              <p className="text-xl text-sage-600 italic mb-2">
                {herb.field_scientific_name}
              </p>
            )}
            {herb.field_family && (
              <p className="text-gray-600">
                Family: <span className="font-medium">{herb.field_family}</span>
              </p>
            )}
          </div>
          {herb.field_conservation_status && (
            <span
              className={`px-3 py-1 rounded-lg font-medium text-sm ${
                herb.field_conservation_status === 'endangered'
                  ? 'bg-red-100 text-red-700'
                  : herb.field_conservation_status === 'vulnerable'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {herb.field_conservation_status.charAt(0).toUpperCase() +
                herb.field_conservation_status.slice(1)}
            </span>
          )}
        </div>

        {/* Description */}
        {herb.body?.value && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-earth-800 mb-3">Overview</h3>
            <div className="prose max-w-none">
              <SafeHtml html={herb.body.value} />
            </div>
          </div>
        )}

        {/* Common Names */}
        {herb.field_common_names && herb.field_common_names.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-earth-800 mb-3">Common Names</h3>
            <div className="flex flex-wrap gap-2">
              {herb.field_common_names.map((nameObj, idx) => (
                <span
                  key={idx}
                  className="bg-sage-100 text-sage-700 px-3 py-1 rounded-lg text-sm"
                >
                  {nameObj.field_name_text}
                  {nameObj.field_language && (
                    <span className="text-sage-500 ml-1">({nameObj.field_language})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Parts Used */}
        {herb.field_parts_used && herb.field_parts_used.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-earth-800 mb-3">Parts Used</h3>
            <div className="flex flex-wrap gap-2">
              {herb.field_parts_used.map((part, idx) => (
                <span
                  key={idx}
                  className="bg-earth-100 text-earth-700 px-3 py-1 rounded-lg text-sm"
                >
                  {part}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botanical Information */}
      {(herb.field_botanical_description ||
        herb.field_native_region ||
        herb.field_habitat) && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Botanical Information
          </h2>

          {herb.field_botanical_description && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-earth-700 mb-2">Description</h3>
              <p className="text-gray-700">{herb.field_botanical_description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {herb.field_native_region && herb.field_native_region.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-earth-700 mb-2">Native Regions</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {herb.field_native_region.map((region, idx) => (
                    <li key={idx}>{region}</li>
                  ))}
                </ul>
              </div>
            )}

            {herb.field_habitat && (
              <div>
                <h3 className="text-lg font-semibold text-earth-700 mb-2">Habitat</h3>
                <p className="text-gray-700">{herb.field_habitat}</p>
              </div>
            )}
          </div>

          {herb.field_conservation_notes && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Conservation Notes
              </h3>
              <p className="text-yellow-700 text-sm">{herb.field_conservation_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* TCM Properties */}
      {herb.field_tcm_properties && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Traditional Chinese Medicine Properties
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {herb.field_tcm_properties.field_tcm_taste &&
              herb.field_tcm_properties.field_tcm_taste.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-earth-700 mb-2">Taste</h3>
                  <div className="flex flex-wrap gap-2">
                    {herb.field_tcm_properties.field_tcm_taste.map((taste, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-sm"
                      >
                        {taste}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {herb.field_tcm_properties.field_tcm_temperature && (
              <div>
                <h3 className="text-lg font-semibold text-earth-700 mb-2">Temperature</h3>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    herb.field_tcm_properties.field_tcm_temperature.toLowerCase().includes('cold')
                      ? 'bg-blue-100 text-blue-700'
                      : herb.field_tcm_properties.field_tcm_temperature.toLowerCase().includes('cool')
                      ? 'bg-cyan-100 text-cyan-700'
                      : herb.field_tcm_properties.field_tcm_temperature.toLowerCase().includes('warm')
                      ? 'bg-orange-100 text-orange-700'
                      : herb.field_tcm_properties.field_tcm_temperature.toLowerCase().includes('hot')
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {herb.field_tcm_properties.field_tcm_temperature}
                </span>
              </div>
            )}

            {herb.field_tcm_properties.field_tcm_meridians &&
              herb.field_tcm_properties.field_tcm_meridians.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-earth-700 mb-2">Meridians</h3>
                  <div className="flex flex-wrap gap-2">
                    {herb.field_tcm_properties.field_tcm_meridians.map((meridian, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm"
                      >
                        {meridian}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {herb.field_tcm_properties.field_tcm_category && (
              <div>
                <h3 className="text-lg font-semibold text-earth-700 mb-2">Category</h3>
                <span className="bg-sage-100 text-sage-700 px-3 py-1 rounded-lg text-sm">
                  {herb.field_tcm_properties.field_tcm_category}
                </span>
              </div>
            )}
          </div>

          {herb.field_tcm_properties.field_tcm_functions && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-earth-700 mb-2">TCM Functions</h3>
              <p className="text-gray-700">{herb.field_tcm_properties.field_tcm_functions}</p>
            </div>
          )}
        </div>
      )}

      {/* Therapeutic Uses & Western Properties */}
      {(herb.field_therapeutic_uses || herb.field_western_properties) && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Therapeutic Uses
          </h2>

          {herb.field_therapeutic_uses && (
            <div className="mb-4">
              <div className="prose max-w-none">
                <SafeHtml html={herb.field_therapeutic_uses} />
              </div>
            </div>
          )}

          {herb.field_western_properties && herb.field_western_properties.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2">
                Western Herbal Properties
              </h3>
              <div className="flex flex-wrap gap-2">
                {herb.field_western_properties.map((prop, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm"
                  >
                    {prop}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Constituents */}
      {herb.field_active_constituents && herb.field_active_constituents.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Active Constituents
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Compound</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Class</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">%</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Effects</th>
                </tr>
              </thead>
              <tbody>
                {herb.field_active_constituents.map((constituent, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-2 px-2 font-medium">{constituent.field_compound_name}</td>
                    <td className="py-2 px-2 text-gray-600">
                      {constituent.field_compound_class || '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">
                      {constituent.field_compound_percentage
                        ? `${constituent.field_compound_percentage}%`
                        : '-'}
                    </td>
                    <td className="py-2 px-2 text-gray-600">
                      {constituent.field_compound_effects || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pharmacological Effects */}
      {herb.field_pharmacological_effects && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Pharmacological Effects
          </h2>
          <div className="prose max-w-none">
            <SafeHtml html={herb.field_pharmacological_effects} />
          </div>
        </div>
      )}

      {/* Dosage Information */}
      {herb.field_recommended_dosage && herb.field_recommended_dosage.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Recommended Dosage
          </h2>
          <div className="space-y-4">
            {herb.field_recommended_dosage.map((dosage, idx) => (
              <div key={idx} className="bg-sage-50 rounded-lg p-4 border border-sage-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-earth-800">
                    {dosage.field_dosage_form}
                  </span>
                  {dosage.field_dosage_population && (
                    <span className="text-xs bg-sage-200 text-sage-700 px-2 py-1 rounded">
                      {dosage.field_dosage_population}
                    </span>
                  )}
                </div>
                <p className="text-gray-700">
                  <span className="font-medium">{dosage.field_dosage_amount}</span>
                  {dosage.field_dosage_frequency && (
                    <span className="text-gray-600"> - {dosage.field_dosage_frequency}</span>
                  )}
                </p>
                {dosage.field_dosage_notes && (
                  <p className="text-sm text-gray-500 mt-2">{dosage.field_dosage_notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Information */}
      {(herb.field_contraindications ||
        herb.field_side_effects ||
        herb.field_drug_interactions ||
        herb.field_toxicity_info ||
        herb.field_safety_warnings) && (
        <div className="bg-red-50 rounded-lg shadow-lg p-8 mb-6 border border-red-200">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Safety Information
          </h2>

          {herb.field_contraindications && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Contraindications</h3>
              <div className="prose max-w-none text-gray-700">
                <SafeHtml html={herb.field_contraindications} />
              </div>
            </div>
          )}

          {herb.field_side_effects && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Side Effects</h3>
              <div className="prose max-w-none text-gray-700">
                <SafeHtml html={herb.field_side_effects} />
              </div>
            </div>
          )}

          {herb.field_drug_interactions && herb.field_drug_interactions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Drug Interactions</h3>
              <div className="space-y-2">
                {herb.field_drug_interactions.map((interaction, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="font-medium text-gray-800">{interaction.field_drug_name}</p>
                    <p className="text-sm text-red-600">
                      Type: {interaction.field_interaction_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      {interaction.field_interaction_description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {herb.field_toxicity_info && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Toxicity Information</h3>
              <div className="bg-white rounded-lg p-3 border border-red-200">
                {herb.field_toxicity_info.field_toxicity_level && (
                  <p className="mb-1">
                    <span className="font-medium">Level:</span>{' '}
                    {herb.field_toxicity_info.field_toxicity_level}
                  </p>
                )}
                {herb.field_toxicity_info.field_toxic_compounds && (
                  <p className="mb-1">
                    <span className="font-medium">Compounds:</span>{' '}
                    {herb.field_toxicity_info.field_toxic_compounds}
                  </p>
                )}
                {herb.field_toxicity_info.field_toxic_symptoms && (
                  <p>
                    <span className="font-medium">Symptoms:</span>{' '}
                    {herb.field_toxicity_info.field_toxic_symptoms}
                  </p>
                )}
              </div>
            </div>
          )}

          {herb.field_safety_warnings && herb.field_safety_warnings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">Safety Warnings</h3>
              <div className="space-y-2">
                {herb.field_safety_warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 border ${
                      warning.field_warning_severity === 'severe'
                        ? 'bg-red-100 border-red-300'
                        : warning.field_warning_severity === 'moderate'
                        ? 'bg-orange-100 border-orange-300'
                        : 'bg-yellow-100 border-yellow-300'
                    }`}
                  >
                    <p className="font-medium">{warning.field_warning_type}</p>
                    <p className="text-sm">{warning.field_warning_description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Traditional Uses */}
      {(herb.field_traditional_chinese_uses ||
        herb.field_traditional_american_uses ||
        herb.field_native_american_uses) && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Traditional Uses
          </h2>

          <div className="space-y-4">
            {herb.field_traditional_chinese_uses && (
              <div>
                <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                  <span>🇨🇳</span> Traditional Chinese Uses
                </h3>
                <div className="prose max-w-none text-gray-700">
                  <SafeHtml html={herb.field_traditional_chinese_uses} />
                </div>
              </div>
            )}

            {herb.field_traditional_american_uses && (
              <div>
                <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                  <span>🇺🇸</span> Traditional American Uses
                </h3>
                <div className="prose max-w-none text-gray-700">
                  <SafeHtml html={herb.field_traditional_american_uses} />
                </div>
              </div>
            )}

            {herb.field_native_american_uses && (
              <div>
                <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                  <span>🪶</span> Native American Uses
                </h3>
                <div className="prose max-w-none text-gray-700">
                  <SafeHtml html={herb.field_native_american_uses} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cultural Significance */}
      {(herb.field_cultural_significance ||
        herb.field_folklore ||
        herb.field_ethnobotanical_notes) && (
        <div className="bg-gradient-to-r from-sage-50 to-earth-50 rounded-lg p-8 mb-6 border border-sage-200">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Cultural & Historical Context
          </h2>

          {herb.field_cultural_significance && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-earth-700 mb-2">Cultural Significance</h3>
              <div className="prose max-w-none text-gray-700">
                <SafeHtml html={herb.field_cultural_significance} />
              </div>
            </div>
          )}

          {herb.field_folklore && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-earth-700 mb-2">Folklore & Legends</h3>
              <div className="prose max-w-none text-gray-700">
                <SafeHtml html={herb.field_folklore} />
              </div>
            </div>
          )}

          {herb.field_ethnobotanical_notes && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2">Ethnobotanical Notes</h3>
              <div className="prose max-w-none text-gray-700">
                <SafeHtml html={herb.field_ethnobotanical_notes} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preparation Methods */}
      {herb.field_preparation_methods && herb.field_preparation_methods.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Preparation Methods
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {herb.field_preparation_methods.map((method, idx) => (
              <div key={idx} className="bg-sage-50 rounded-lg p-4 border border-sage-200">
                <h3 className="font-semibold text-earth-800 mb-2">
                  {method.field_method_type}
                </h3>
                <p className="text-gray-700 text-sm">{method.field_method_instructions}</p>
                {method.field_method_time && (
                  <p className="text-sage-600 text-sm mt-2">
                    Time: {method.field_method_time}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storage & Sourcing */}
      {(herb.field_storage_requirements || herb.field_sourcing_info) && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Storage & Sourcing
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {herb.field_storage_requirements && (
              <div>
                <h3 className="text-lg font-semibold text-earth-700 mb-2">Storage Requirements</h3>
                <ul className="space-y-2 text-gray-700">
                  {herb.field_storage_requirements.field_storage_conditions && (
                    <li>
                      <span className="font-medium">Conditions:</span>{' '}
                      {herb.field_storage_requirements.field_storage_conditions}
                    </li>
                  )}
                  {herb.field_storage_requirements.field_shelf_life && (
                    <li>
                      <span className="font-medium">Shelf Life:</span>{' '}
                      {herb.field_storage_requirements.field_shelf_life}
                    </li>
                  )}
                  {herb.field_storage_requirements.field_storage_temperature && (
                    <li>
                      <span className="font-medium">Temperature:</span>{' '}
                      {herb.field_storage_requirements.field_storage_temperature}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {herb.field_sourcing_info && (
              <div>
                <h3 className="text-lg font-semibold text-earth-700 mb-2">Sourcing Information</h3>
                <ul className="space-y-2 text-gray-700">
                  {herb.field_sourcing_info.field_sourcing_type && (
                    <li>
                      <span className="font-medium">Type:</span>{' '}
                      {herb.field_sourcing_info.field_sourcing_type}
                    </li>
                  )}
                  {herb.field_sourcing_info.field_organic_available !== undefined && (
                    <li>
                      <span className="font-medium">Organic Available:</span>{' '}
                      {herb.field_sourcing_info.field_organic_available ? 'Yes' : 'No'}
                    </li>
                  )}
                  {herb.field_sourcing_info.field_sustainable_harvest && (
                    <li>
                      <span className="font-medium">Sustainability:</span>{' '}
                      {herb.field_sourcing_info.field_sustainable_harvest}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Related Content */}
      {((herb.field_conditions_treated && herb.field_conditions_treated.length > 0) ||
        (herb.field_related_species && herb.field_related_species.length > 0) ||
        (herb.field_substitute_herbs && herb.field_substitute_herbs.length > 0)) && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Related Information
          </h2>

          {herb.field_conditions_treated && herb.field_conditions_treated.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-earth-700 mb-2">Conditions Treated</h3>
              <div className="flex flex-wrap gap-2">
                {herb.field_conditions_treated.map((condition) => (
                  <Link
                    key={condition.id}
                    href={`/conditions/${condition.id}`}
                    className="bg-sage-100 hover:bg-sage-200 text-sage-700 px-3 py-1 rounded-lg text-sm transition"
                  >
                    {condition.title || 'View Condition'}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {herb.field_related_species && herb.field_related_species.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-earth-700 mb-2">Related Species</h3>
              <div className="flex flex-wrap gap-2">
                {herb.field_related_species.map((species) => (
                  <Link
                    key={species.id}
                    href={`/herbs/${species.id}`}
                    className="bg-earth-100 hover:bg-earth-200 text-earth-700 px-3 py-1 rounded-lg text-sm transition"
                  >
                    {species.title || 'View Herb'}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {herb.field_substitute_herbs && herb.field_substitute_herbs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2">Substitute Herbs</h3>
              <div className="flex flex-wrap gap-2">
                {herb.field_substitute_herbs.map((substitute) => (
                  <Link
                    key={substitute.id}
                    href={`/herbs/${substitute.id}`}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1 rounded-lg text-sm transition"
                  >
                    {substitute.title || 'View Herb'}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Important Disclaimer</h3>
            <p className="text-sm text-gray-700">
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
      <div className="text-center">
        <Link
          href="/herbs"
          className="inline-block text-sage-600 hover:text-sage-800 font-medium"
        >
          ← Back to All Herbs
        </Link>
      </div>
    </div>
  );
}

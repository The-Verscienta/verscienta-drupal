import { drupal } from '@/lib/drupal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SafeHtml } from '@/components/ui/SafeHtml';
import { ModalityEntity } from '@/types';

interface ModalityDetailProps {
  params: Promise<{
    id: string;
  }>;
}

async function getModality(id: string): Promise<ModalityEntity | null> {
  try {
    console.log('Fetching modality with ID:', id);
    // Note: field_conditions doesn't exist as an entity reference in Drupal yet
    // When added, include it here: 'include': 'field_conditions'
    const modality = await drupal.getResource<ModalityEntity>('node--modality', id);
    return modality;
  } catch (error) {
    console.error('Failed to fetch modality:', error);
    return null;
  }
}

export default async function ModalityDetailPage({ params }: ModalityDetailProps) {
  const { id } = await params;
  const modality = await getModality(id);

  if (!modality) {
    notFound();
  }

  const title = modality.title || 'Modality';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Modalities', href: '/modalities' },
          { label: title },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-5xl mb-4">🧘</div>
            <h1 className="text-4xl font-bold text-earth-800 mb-2">
              {modality.title}
            </h1>
          </div>
        </div>

        {/* Description */}
        {modality.body?.value && (
          <div className="prose max-w-none mb-6">
            <SafeHtml html={modality.body.value} />
          </div>
        )}

        {/* Excels At */}
        {modality.field_excels_at && modality.field_excels_at.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-earth-800 mb-3">This Modality Excels At:</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {modality.field_excels_at.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center bg-sage-50 p-3 rounded-lg"
                >
                  <span className="text-sage-600 mr-2">✓</span>
                  <span className="text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Benefits */}
      {modality.field_benefits && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Benefits
          </h2>
          <div className="prose max-w-none">
            {typeof modality.field_benefits === 'string' ? (
              <p>{modality.field_benefits}</p>
            ) : (
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(modality.field_benefits, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Related Conditions */}
      {modality.field_conditions && modality.field_conditions.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            May Help With These Conditions
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {modality.field_conditions.map((condition: any) => (
              <Link
                key={condition.id}
                href={`/conditions/${condition.id}`}
                className="flex items-center bg-earth-50 p-3 rounded-lg hover:bg-earth-100 transition"
              >
                <span className="text-earth-600 mr-2">🩺</span>
                <span className="text-gray-800">{condition.title || 'View Condition'}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Find Practitioners */}
      <div className="bg-gradient-to-r from-earth-700 to-sage-700 text-white p-8 rounded-lg shadow-xl text-center mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Find {modality.title} Practitioners
        </h2>
        <p className="mb-6 opacity-90">
          Connect with qualified practitioners who specialize in this modality.
        </p>
        <Link
          href={`/practitioners?modality=${modality.id}`}
          className="inline-block bg-white text-earth-800 px-8 py-3 rounded-lg font-semibold hover:bg-earth-50 transition shadow-lg"
        >
          Find Practitioners
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> This information is for educational purposes only.
          Always consult with a qualified healthcare provider before starting any new
          treatment or therapy.
        </p>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link
          href="/modalities"
          className="inline-block text-sage-600 hover:text-sage-800 font-medium"
        >
          ← Back to All Modalities
        </Link>
      </div>
    </div>
  );
}

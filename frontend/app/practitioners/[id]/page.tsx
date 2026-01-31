import { drupal } from '@/lib/drupal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { PractitionerEntity } from '@/types/drupal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SafeHtml } from '@/components/ui/SafeHtml';

interface PractitionerDetailProps {
  params: Promise<{
    id: string;
  }>;
}

async function getPractitioner(id: string): Promise<PractitionerEntity | null> {
  try {
    const practitioner = await drupal.getResource<PractitionerEntity>(
      'node--practitioner',
      id
    );
    return practitioner;
  } catch (error) {
    console.error('Failed to fetch practitioner:', error);
    return null;
  }
}

export default async function PractitionerDetailPage({ params }: PractitionerDetailProps) {
  const { id } = await params;
  const practitioner = await getPractitioner(id);

  if (!practitioner) {
    notFound();
  }

  const name = practitioner.field_name || practitioner.title || 'Practitioner';
  const fullAddress = [
    practitioner.field_address,
    practitioner.field_city,
    practitioner.field_state,
    practitioner.field_zip || practitioner.field_zip_code,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Practitioners', href: '/practitioners' },
          { label: name },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h1 className="text-4xl font-bold text-earth-800 mb-2">{name}</h1>
            {practitioner.field_credentials && (
              <p className="text-lg text-sage-600">{practitioner.field_credentials}</p>
            )}
          </div>
          <div className="text-right">
            {practitioner.field_accepting_new_patients ||
            practitioner.field_accepting_patients ? (
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg font-medium">
                Accepting New Patients
              </span>
            ) : (
              <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-lg font-medium">
                Not Accepting Patients
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {practitioner.field_bio && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-earth-800 mb-3">About</h3>
            <div className="prose max-w-none">
              <SafeHtml html={practitioner.field_bio} />
            </div>
          </div>
        )}

        {/* Practice Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {practitioner.field_practice_type && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2">Practice Type</h3>
              <span className="bg-sage-100 text-sage-700 px-3 py-1 rounded-lg text-sm capitalize">
                {practitioner.field_practice_type}
              </span>
            </div>
          )}

          {practitioner.field_years_experience !== undefined && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2">Experience</h3>
              <p className="text-gray-700">
                {practitioner.field_years_experience} years of experience
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-earth-800 mb-4">Contact Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {fullAddress && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                <span>📍</span> Address
              </h3>
              <p className="text-gray-700">{fullAddress}</p>
            </div>
          )}

          {practitioner.field_phone && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                <span>📞</span> Phone
              </h3>
              <a
                href={`tel:${practitioner.field_phone}`}
                className="text-sage-600 hover:text-sage-800"
              >
                {practitioner.field_phone}
              </a>
            </div>
          )}

          {practitioner.field_email && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                <span>✉️</span> Email
              </h3>
              <a
                href={`mailto:${practitioner.field_email}`}
                className="text-sage-600 hover:text-sage-800"
              >
                {practitioner.field_email}
              </a>
            </div>
          )}

          {practitioner.field_website && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                <span>🌐</span> Website
              </h3>
              <a
                href={practitioner.field_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-600 hover:text-sage-800"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Modalities */}
      {practitioner.field_modalities && practitioner.field_modalities.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Specializations & Modalities
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {practitioner.field_modalities.map((modality) => (
              <Link
                key={modality.id}
                href={`/modalities/${modality.id}`}
                className="flex items-center bg-sage-50 p-4 rounded-lg hover:bg-sage-100 transition border border-sage-200"
              >
                <span className="text-sage-600 mr-3 text-2xl">🧘</span>
                <span className="text-gray-800 font-medium">
                  {modality.title || 'View Modality'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Map placeholder */}
      {practitioner.field_latitude && practitioner.field_longitude && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">Location</h2>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <p className="text-gray-500">
              Map location: {practitioner.field_latitude}, {practitioner.field_longitude}
            </p>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-earth-700 to-sage-700 text-white p-8 rounded-lg shadow-xl text-center mb-6">
        <h2 className="text-2xl font-bold mb-4">Ready to Schedule?</h2>
        <p className="mb-6 opacity-90">
          Contact {name} to schedule a consultation and begin your wellness journey.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {practitioner.field_phone && (
            <a
              href={`tel:${practitioner.field_phone}`}
              className="inline-block bg-white text-earth-800 px-8 py-3 rounded-lg font-semibold hover:bg-earth-50 transition shadow-lg"
            >
              Call Now
            </a>
          )}
          {practitioner.field_email && (
            <a
              href={`mailto:${practitioner.field_email}`}
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Send Email
            </a>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Practitioner listings are provided for informational purposes.
          Please verify credentials and conduct your own research before scheduling appointments.
          This platform does not endorse specific practitioners.
        </p>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link
          href="/practitioners"
          className="inline-block text-sage-600 hover:text-sage-800 font-medium"
        >
          ← Back to All Practitioners
        </Link>
      </div>
    </div>
  );
}

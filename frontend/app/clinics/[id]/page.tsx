import { drupal } from '@/lib/drupal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import type { ClinicEntity } from '@/types/drupal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SafeHtml } from '@/components/ui/SafeHtml';
import { ClinicMap } from '@/components/clinic/ClinicMap';

interface ClinicDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ClinicDetailProps): Promise<Metadata> {
  const { id } = await params;
  const clinic = await getClinic(id);

  if (!clinic) {
    return { title: 'Clinic Not Found - Verscienta Health' };
  }

  const name = clinic.title || 'Clinic';
  const location = [clinic.field_city, clinic.field_state].filter(Boolean).join(', ');
  const description = location
    ? `${name} in ${location} — holistic health clinic offering natural healing modalities. View services, practitioners, hours, and reviews.`
    : `${name} — holistic health clinic offering natural healing modalities. View services, practitioners, hours, and reviews.`;

  return {
    title: `${name} - Holistic Health Clinic - Verscienta Health`,
    description,
  };
}

async function getClinic(id: string): Promise<ClinicEntity | null> {
  try {
    const clinic = await drupal.getResource<ClinicEntity>(
      'node--clinic',
      id,
      {
        params: {
          'include': 'field_images,field_practitioners,field_practitioners.field_images,field_modalities',
        },
      }
    );
    return clinic;
  } catch (error) {
    console.error('Failed to fetch clinic:', error);
    return null;
  }
}

// Insurance label mapping
const insuranceLabels: Record<string, string> = {
  aetna: 'Aetna',
  blue_cross: 'Blue Cross Blue Shield',
  cigna: 'Cigna',
  humana: 'Humana',
  kaiser: 'Kaiser Permanente',
  medicare: 'Medicare',
  medicaid: 'Medicaid',
  united: 'UnitedHealthcare',
  tricare: 'TRICARE',
  other: 'Other',
  self_pay: 'Self-Pay / Cash',
};

export default async function ClinicDetailPage({ params }: ClinicDetailProps) {
  const { id } = await params;
  const clinic = await getClinic(id);

  if (!clinic) {
    notFound();
  }

  const name = clinic.title || 'Clinic';
  const fullAddress = [
    clinic.field_address,
    clinic.field_city,
    clinic.field_state,
    clinic.field_zip,
  ]
    .filter(Boolean)
    .join(', ');

  const mapMarkers = clinic.field_latitude && clinic.field_longitude
    ? [{
        id: clinic.id,
        title: name,
        lat: clinic.field_latitude,
        lng: clinic.field_longitude,
        address: fullAddress || undefined,
      }]
    : [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Clinics', href: '/clinics' },
          { label: name },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {/* Hero image */}
        {clinic.field_images?.[0] && (clinic.field_images[0].uri?.url || clinic.field_images[0].url) && (
          <div className="relative w-full h-56 md:h-72">
            <Image
              src={clinic.field_images[0].uri?.url || clinic.field_images[0].url!}
              alt={clinic.field_images[0].meta?.alt || name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              {!(clinic.field_images?.[0] && (clinic.field_images[0].uri?.url || clinic.field_images[0].url)) && (
                <div className="text-6xl mb-4">🏥</div>
              )}
              <h1 className="text-4xl font-bold text-earth-800 mb-2">{name}</h1>
              {fullAddress && (
                <p className="text-lg text-sage-600">{fullAddress}</p>
              )}
            </div>
            <div className="text-right">
              {clinic.field_accepting_new_patients ? (
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

          {/* Body / Description */}
          {clinic.body && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-earth-800 mb-3">About</h3>
              <div className="prose max-w-none">
                <SafeHtml html={clinic.body.processed || clinic.body.value} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      {clinic.field_images && clinic.field_images.length > 1 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {clinic.field_images.slice(1).map((image, idx) => {
              const imgUrl = image.uri?.url || image.url;
              if (!imgUrl) return null;
              return (
                <div key={image.id || idx} className="relative aspect-square rounded-xl overflow-hidden border border-earth-200 shadow-sm">
                  <Image
                    src={imgUrl}
                    alt={image.meta?.alt || `${name} photo ${idx + 2}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 896px) 33vw, 250px"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

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

          {clinic.field_phone && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                <span>📞</span> Phone
              </h3>
              <a
                href={`tel:${clinic.field_phone}`}
                className="text-sage-600 hover:text-sage-800"
              >
                {clinic.field_phone}
              </a>
            </div>
          )}

          {clinic.field_email && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                <span>✉️</span> Email
              </h3>
              <a
                href={`mailto:${clinic.field_email}`}
                className="text-sage-600 hover:text-sage-800"
              >
                {clinic.field_email}
              </a>
            </div>
          )}

          {clinic.field_website && (
            <div>
              <h3 className="text-lg font-semibold text-earth-700 mb-2 flex items-center gap-2">
                <span>🌐</span> Website
              </h3>
              <a
                href={clinic.field_website}
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

      {/* Operating Hours */}
      {clinic.field_hours && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4 flex items-center gap-2">
            <span>🕐</span> Operating Hours
          </h2>
          <div className="prose max-w-none text-gray-700">
            <SafeHtml html={clinic.field_hours} />
          </div>
        </div>
      )}

      {/* Insurance Accepted */}
      {clinic.field_insurance_accepted && clinic.field_insurance_accepted.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">Insurance Accepted</h2>
          <div className="flex flex-wrap gap-2">
            {clinic.field_insurance_accepted.map((insurance) => (
              <span
                key={insurance}
                className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-200"
              >
                {insuranceLabels[insurance] || insurance}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      {mapMarkers.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">Location</h2>
          <ClinicMap
            clinics={mapMarkers}
            singleClinic
            zoom={15}
            className="h-[300px] rounded-lg overflow-hidden"
          />
        </div>
      )}

      {/* Modalities */}
      {clinic.field_modalities && clinic.field_modalities.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">
            Modalities & Services
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {clinic.field_modalities.map((modality) => (
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

      {/* Practitioners */}
      {clinic.field_practitioners && clinic.field_practitioners.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">Our Practitioners</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {clinic.field_practitioners.map((practitioner) => {
              const practImg = practitioner.field_images?.[0];
              const practImgUrl = practImg?.uri?.url || practImg?.url;

              return (
                <Link
                  key={practitioner.id}
                  href={`/practitioners/${practitioner.id}`}
                  className="group flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-sage-300 hover:shadow-md transition-all"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-sage-100 flex-shrink-0 flex items-center justify-center">
                    {practImgUrl ? (
                      <Image
                        src={practImgUrl}
                        alt={practImg?.meta?.alt || practitioner.title || 'Practitioner'}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <span className="text-2xl">👨‍⚕️</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-earth-800 group-hover:text-earth-600 transition-colors truncate">
                      {practitioner.title || practitioner.field_name || 'Practitioner'}
                    </h3>
                    {practitioner.field_credentials && (
                      <p className="text-sm text-sage-600 truncate">{practitioner.field_credentials}</p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-sage-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Google Reviews Link */}
      {clinic.field_google_place_id && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-earth-800 mb-4">Reviews</h2>
          <a
            href={`https://search.google.com/local/reviews?placeid=${clinic.field_google_place_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white border-2 border-earth-200 hover:border-sage-400 px-6 py-3 rounded-xl font-semibold text-earth-700 hover:text-sage-700 transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
            </svg>
            Read Google Reviews
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-earth-700 to-sage-700 text-white p-8 rounded-lg shadow-xl text-center mb-6">
        <h2 className="text-2xl font-bold mb-4">Ready to Visit?</h2>
        <p className="mb-6 opacity-90">
          Contact {name} to schedule an appointment and begin your wellness journey.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {clinic.field_phone && (
            <a
              href={`tel:${clinic.field_phone}`}
              className="inline-block bg-white text-earth-800 px-8 py-3 rounded-lg font-semibold hover:bg-earth-50 transition shadow-lg"
            >
              Call Now
            </a>
          )}
          {clinic.field_email && (
            <a
              href={`mailto:${clinic.field_email}`}
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
          <strong>Note:</strong> Clinic listings are provided for informational purposes.
          Please verify credentials and conduct your own research before scheduling appointments.
          This platform does not endorse specific clinics or practitioners.
        </p>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link
          href="/clinics"
          className="inline-block text-sage-600 hover:text-sage-800 font-medium"
        >
          ← Back to All Clinics
        </Link>
      </div>
    </div>
  );
}

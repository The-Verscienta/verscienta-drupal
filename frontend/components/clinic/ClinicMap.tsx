'use client';

import dynamic from 'next/dynamic';

const ClinicMapInner = dynamic(
  () => import('./ClinicMapInner').then((mod) => mod.ClinicMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center animate-pulse">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
);

interface ClinicMarker {
  id: string;
  title: string;
  lat: number;
  lng: number;
  address?: string;
}

interface ClinicMapProps {
  clinics: ClinicMarker[];
  center?: [number, number];
  zoom?: number;
  singleClinic?: boolean;
  className?: string;
}

export function ClinicMap({ clinics, center, zoom, singleClinic, className }: ClinicMapProps) {
  return (
    <div className={className || 'h-[400px]'}>
      <ClinicMapInner
        clinics={clinics}
        center={center}
        zoom={zoom}
        singleClinic={singleClinic}
      />
    </div>
  );
}

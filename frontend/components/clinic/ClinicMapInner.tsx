'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#426650"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  className: '',
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
});

interface ClinicMarker {
  id: string;
  title: string;
  lat: number;
  lng: number;
  address?: string;
}

interface ClinicMapInnerProps {
  clinics: ClinicMarker[];
  center?: [number, number];
  zoom?: number;
  singleClinic?: boolean;
}

export function ClinicMapInner({ clinics, center, zoom, singleClinic }: ClinicMapInnerProps) {
  const validClinics = clinics.filter((c) => c.lat && c.lng);

  if (validClinics.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg h-full flex items-center justify-center">
        <p className="text-gray-500">No clinic locations available to display on map.</p>
      </div>
    );
  }

  const defaultCenter: [number, number] = center || (
    validClinics.length === 1
      ? [validClinics[0].lat, validClinics[0].lng]
      : [
          validClinics.reduce((sum, c) => sum + c.lat, 0) / validClinics.length,
          validClinics.reduce((sum, c) => sum + c.lng, 0) / validClinics.length,
        ]
  );

  const defaultZoom = zoom || (singleClinic ? 15 : validClinics.length === 1 ? 13 : 4);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      scrollWheelZoom={!singleClinic}
      className="h-full w-full rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validClinics.map((clinic) => (
        <Marker key={clinic.id} position={[clinic.lat, clinic.lng]} icon={markerIcon}>
          <Popup>
            <div className="text-sm">
              <strong className="block mb-1">{clinic.title}</strong>
              {clinic.address && <span className="text-gray-600">{clinic.address}</span>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

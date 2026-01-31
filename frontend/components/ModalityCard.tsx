'use client';
import { useEffect, useState } from 'react';
import { drupal } from '@/lib/drupal';

interface ModalityCardProps {
  modalityId: string;
  showDetails?: boolean;
  className?: string;
}

export function ModalityCard({ 
  modalityId, 
  showDetails = false,
  className = ''
}: ModalityCardProps) {
  const [modality, setModality] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModality() {
      try {
        setLoading(true);
        const data = await drupal.getResource('node--modality', modalityId);
        setModality(data);
      } catch (err) {
        setError('Failed to load modality');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (modalityId) {
      fetchModality();
    }
  }, [modalityId]);

  if (loading) {
    return <div className={`modality-card ${className}`}>Loading...</div>;
  }

  if (error || !modality) {
    return <div className={`modality-card ${className}`}>Error loading modality</div>;
  }

  return (
    <div className={`modality-card ${className}`}>
      <h3 className="text-xl font-bold">{modality.title}</h3>
      
      {modality.field_benefits && (
        <p className="mt-2 text-gray-700">{modality.field_benefits}</p>
      )}
      
      {showDetails && modality.field_excels_at && (
        <div className="mt-4">
          <h4 className="font-semibold">Excels At:</h4>
          <ul className="list-disc list-inside">
            {Array.isArray(modality.field_excels_at) ? 
              modality.field_excels_at.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              )) : 
              <li>{modality.field_excels_at}</li>
            }
          </ul>
        </div>
      )}
    </div>
  );
}

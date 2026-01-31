'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/grok/symptom-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-earth-800 mb-4">
          AI-Powered Symptom Checker
        </h1>
        <p className="text-xl text-sage-700">
          Describe your symptoms and get personalized holistic health recommendations
          powered by Grok AI.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> This tool is for informational purposes only and
          does not replace professional medical advice. Always consult with a qualified
          healthcare provider for medical concerns.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="symptoms" className="block text-lg font-medium text-gray-700 mb-2">
              Describe Your Symptoms
            </label>
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-earth-600 focus:border-transparent"
              placeholder="Example: I've been experiencing headaches, fatigue, and trouble sleeping for the past week..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Be as detailed as possible for better recommendations.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full bg-earth-600 hover:bg-earth-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
        </form>
      </div>

      {results && (
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-earth-800">
            Analysis Results
          </h2>

          <div className="prose max-w-none">
            <div className="bg-sage-50 border border-sage-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-earth-800 mb-3">
                AI Recommendations
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {results.analysis || 'No analysis available'}
              </p>
            </div>
          </div>

          {results.recommendations && (
            <div>
              <h3 className="text-xl font-semibold text-earth-800 mb-4">
                Suggested Modalities & Herbs
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {results.recommendations.modalities?.map((modality: string, idx: number) => (
                  <div key={idx} className="bg-earth-50 p-4 rounded-lg">
                    <span className="text-earth-700 font-medium">🧘 {modality}</span>
                  </div>
                ))}
                {results.recommendations.herbs?.map((herb: string, idx: number) => (
                  <div key={idx} className="bg-sage-50 p-4 rounded-lg">
                    <span className="text-sage-700 font-medium">🌿 {herb}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

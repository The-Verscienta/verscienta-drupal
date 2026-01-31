import Link from 'next/link';
import { HeroSearch } from '@/components/HeroSearch';

export default function Home() {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="hero-section -mt-8 md:-mt-12">
        <div className="hero-content">
          <h1 className="hero-title">
            Bridge Ancient Wisdom with Modern Science
          </h1>
          <p className="hero-subtitle">
            Your comprehensive guide to holistic health modalities, traditional herbal remedies,
            and personalized wellness recommendations powered by AI.
          </p>

          {/* Search Bar */}
          <div className="mb-8 animate-scale-in">
            <HeroSearch />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/symptom-checker" className="btn-primary text-center">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Try Symptom Checker
              </span>
            </Link>
            <Link href="/practitioners" className="btn-outline text-center">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Find Practitioners
              </span>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-10">
          <div className="yin-yang-symbol"></div>
        </div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <div className="yin-yang-symbol"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="section-header text-center">
            <h2 className="section-title justify-center">
              <svg className="w-8 h-8 text-earth-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Comprehensive Health Resources
            </h2>
            <p className="section-description mx-auto">
              Explore our extensive database covering traditional Chinese medicine,
              Western herbalism, and various holistic healing modalities.
            </p>
          </div>

          <div className="grid-3">
            <div className="card-feature hover-lift hover-glow">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="text-2xl font-serif font-bold text-earth-800 mb-3">
                Medicinal Herbs
              </h3>
              <p className="text-gray-600 mb-4">
                Comprehensive botanical information covering TCM properties, active constituents,
                therapeutic uses, dosages, and safety guidelines for hundreds of medicinal herbs.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-primary">TCM Properties</span>
                <span className="badge-primary">Active Compounds</span>
                <span className="badge-primary">Safety Data</span>
              </div>
              <Link href="/herbs" className="text-earth-600 hover:text-earth-800 font-semibold inline-flex items-center gap-2 group">
                Browse Herbs
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="card-feature hover-lift hover-glow">
              <div className="text-5xl mb-4">☯️</div>
              <h3 className="text-2xl font-serif font-bold text-earth-800 mb-3">
                Healing Modalities
              </h3>
              <p className="text-gray-600 mb-4">
                Explore diverse holistic health practices from acupuncture and yoga to Reiki and
                Ayurveda, with detailed information on benefits, techniques, and applications.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-primary">Acupuncture</span>
                <span className="badge-primary">Yoga</span>
                <span className="badge-primary">Ayurveda</span>
              </div>
              <Link href="/modalities" className="text-earth-600 hover:text-earth-800 font-semibold inline-flex items-center gap-2 group">
                View Modalities
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="card-feature hover-lift hover-glow">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-serif font-bold text-earth-800 mb-3">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600 mb-4">
                Get personalized wellness recommendations based on your symptoms using advanced AI
                technology that considers your unique health profile and preferences.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-primary">Smart Analysis</span>
                <span className="badge-primary">Personalized</span>
                <span className="badge-primary">Evidence-Based</span>
              </div>
              <Link href="/symptom-checker" className="text-earth-600 hover:text-earth-800 font-semibold inline-flex items-center gap-2 group">
                Start Analysis
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TCM Special Section */}
      <section className="section-spacing bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50">
        <div className="container-custom">
          <div className="section-header text-center">
            <h2 className="section-title justify-center">
              <span className="text-3xl">☯️</span>
              Traditional Chinese Medicine
            </h2>
            <p className="section-description mx-auto">
              Honoring thousands of years of healing wisdom with modern scientific understanding.
            </p>
          </div>

          <div className="grid-2">
            <div className="card-elevated">
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🏮</span>
                TCM Herb Database
              </h3>
              <p className="text-gray-600 mb-4">
                Complete information on traditional Chinese herbs including taste properties,
                temperature qualities, meridian affinities, and classical formulas.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-tcm-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Five Tastes & Temperatures
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-tcm-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Meridian Channel Associations
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-tcm-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Classical Formula Combinations
                </li>
              </ul>
            </div>

            <div className="card-elevated">
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔬</span>
                Modern Scientific Research
              </h3>
              <p className="text-gray-600 mb-4">
                Bridging traditional knowledge with contemporary pharmacological research and
                clinical studies to validate efficacy and safety.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active Constituent Analysis
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Clinical Trial Data
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-earth-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Safety & Interaction Studies
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="section-header text-center">
            <h2 className="section-title justify-center">
              <svg className="w-8 h-8 text-earth-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              How It Works
            </h2>
            <p className="section-description mx-auto">
              Four simple steps to personalized wellness recommendations.
            </p>
          </div>

          <div className="grid-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-earth-600 to-sage-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-earth">
                1
              </div>
              <h4 className="text-lg font-serif font-semibold text-earth-800 mb-2">
                Enter Symptoms
              </h4>
              <p className="text-gray-600">
                Describe your health concerns or browse our comprehensive database
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-earth-600 to-sage-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-earth">
                2
              </div>
              <h4 className="text-lg font-serif font-semibold text-earth-800 mb-2">
                AI Analysis
              </h4>
              <p className="text-gray-600">
                Our AI analyzes your input and asks relevant follow-up questions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-earth-600 to-sage-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-earth">
                3
              </div>
              <h4 className="text-lg font-serif font-semibold text-earth-800 mb-2">
                Get Recommendations
              </h4>
              <p className="text-gray-600">
                Receive personalized modality and herb recommendations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-earth-600 to-sage-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-earth">
                4
              </div>
              <h4 className="text-lg font-serif font-semibold text-earth-800 mb-2">
                Find Practitioners
              </h4>
              <p className="text-gray-600">
                Connect with qualified practitioners in your area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-spacing bg-gradient-earth">
        <div className="container-custom">
          <div className="grid-4 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Medicinal Herbs</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Health Modalities</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-2">200+</div>
              <div className="text-gray-600 font-medium">Classical Formulas</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-2">1000+</div>
              <div className="text-gray-600 font-medium">Practitioners</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="card-elevated text-center bg-gradient-to-br from-earth-700 via-sage-700 to-earth-800 text-white p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Discover holistic approaches to health and wellness tailored to your unique needs,
              backed by both ancient wisdom and modern science.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/symptom-checker"
                className="bg-white text-earth-800 px-8 py-4 rounded-lg font-semibold hover:bg-earth-50 transition shadow-lg inline-flex items-center justify-center gap-2 group"
              >
                Get Started Now
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/practitioners"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition inline-flex items-center justify-center gap-2"
              >
                Find a Practitioner
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

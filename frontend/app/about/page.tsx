import Link from 'next/link';

export const metadata = {
  title: 'About Us - Verscienta Health',
  description: 'Learn about Verscienta Health and our mission to bridge ancient healing wisdom with modern science.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-4">
          About Verscienta Health
        </h1>
        <p className="text-xl text-sage-700 max-w-2xl mx-auto">
          Bridging ancient healing wisdom with modern scientific understanding
          to empower your wellness journey.
        </p>
      </div>

      {/* Mission Section */}
      <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🎯</span>
          <h2 className="text-2xl font-serif font-bold text-earth-800">Our Mission</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          At Verscienta Health, we believe that true wellness comes from understanding
          both traditional healing practices and modern medical science. Our mission is
          to create a comprehensive, accessible resource that helps individuals make
          informed decisions about their health using the best of both worlds.
        </p>
        <p className="text-gray-700 leading-relaxed">
          We are dedicated to preserving and sharing the knowledge of Traditional Chinese
          Medicine, Western herbalism, and various holistic healing modalities while
          maintaining rigorous standards for accuracy and safety.
        </p>
      </section>

      {/* What We Offer */}
      <section className="bg-gradient-to-br from-earth-50 to-sage-50 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">✨</span>
          <h2 className="text-2xl font-serif font-bold text-earth-800">What We Offer</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl mb-3">🌿</div>
            <h3 className="font-semibold text-earth-800 mb-2">Comprehensive Herb Database</h3>
            <p className="text-gray-600 text-sm">
              Detailed information on hundreds of medicinal herbs, including TCM properties,
              active constituents, dosages, and safety guidelines.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl mb-3">☯️</div>
            <h3 className="font-semibold text-earth-800 mb-2">Healing Modalities</h3>
            <p className="text-gray-600 text-sm">
              Explore diverse holistic practices from acupuncture and yoga to energy
              healing and Ayurveda.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl mb-3">🤖</div>
            <h3 className="font-semibold text-earth-800 mb-2">AI-Powered Insights</h3>
            <p className="text-gray-600 text-sm">
              Our symptom checker uses advanced AI to provide personalized wellness
              recommendations based on your unique needs.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl mb-3">👨‍⚕️</div>
            <h3 className="font-semibold text-earth-800 mb-2">Practitioner Directory</h3>
            <p className="text-gray-600 text-sm">
              Connect with qualified holistic health practitioners in your area
              who can provide personalized guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">💚</span>
          <h2 className="text-2xl font-serif font-bold text-earth-800">Our Values</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-earth-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-earth-600 font-bold">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-earth-800">Accuracy & Integrity</h3>
              <p className="text-gray-600 text-sm">
                We rigorously verify all information and clearly distinguish between
                traditional use and scientific evidence.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-earth-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-earth-600 font-bold">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-earth-800">Respect for Tradition</h3>
              <p className="text-gray-600 text-sm">
                We honor the wisdom of traditional healing systems while presenting
                them in accessible, practical ways.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-earth-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-earth-600 font-bold">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-earth-800">Safety First</h3>
              <p className="text-gray-600 text-sm">
                We emphasize safety information, contraindications, and always
                recommend consulting healthcare professionals.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-earth-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-earth-600 font-bold">4</span>
            </div>
            <div>
              <h3 className="font-semibold text-earth-800">Accessibility</h3>
              <p className="text-gray-600 text-sm">
                We strive to make holistic health information accessible to everyone,
                regardless of background or experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">Important Notice</h3>
            <p className="text-yellow-700 text-sm">
              The information provided on Verscienta Health is for educational purposes only
              and is not intended to replace professional medical advice, diagnosis, or treatment.
              Always consult with a qualified healthcare provider before making any health decisions
              or starting any new treatment regimen.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-earth-700 to-sage-700 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-serif font-bold mb-4">
          Start Your Wellness Journey Today
        </h2>
        <p className="mb-6 opacity-90">
          Explore our comprehensive database and discover holistic approaches to health.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/herbs"
            className="bg-white text-earth-800 px-6 py-3 rounded-lg font-semibold hover:bg-earth-50 transition"
          >
            Explore Herbs
          </Link>
          <Link
            href="/symptom-checker"
            className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
          >
            Try Symptom Checker
          </Link>
        </div>
      </section>
    </div>
  );
}

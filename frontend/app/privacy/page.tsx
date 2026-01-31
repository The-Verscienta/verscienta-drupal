import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Verscienta Health',
  description: 'Privacy Policy for Verscienta Health - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-earth-800 mb-4">
          Privacy Policy
        </h1>
        <p className="text-sage-700">
          Last updated: January 2025
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <div className="prose prose-earth max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Verscienta Health ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website and use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">Information We Collect</h2>

            <h3 className="text-lg font-semibold text-earth-700 mt-4 mb-2">Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may collect personal information that you voluntarily provide when you:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Create an account or register on our platform</li>
              <li>Use our symptom checker or other interactive features</li>
              <li>Contact us through our contact form</li>
              <li>Subscribe to our newsletter</li>
              <li>Submit reviews or feedback</li>
            </ul>

            <h3 className="text-lg font-semibold text-earth-700 mt-4 mb-2">Automatically Collected Information</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              When you visit our website, we may automatically collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and approximate location</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website or source</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Personalize your experience on our platform</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send you updates, newsletters, and promotional materials (with consent)</li>
              <li>Improve our website and services</li>
              <li>Analyze usage patterns and trends</li>
              <li>Protect against fraudulent or unauthorized activity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform (hosting, analytics, email services)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience.
              You can control cookie preferences through your browser settings. Essential
              cookies are required for basic website functionality, while analytics and
              preference cookies help us improve our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. However, no method of transmission over the Internet is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not directed to individuals under the age of 18. We do not
              knowingly collect personal information from children. If you believe we have
              collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last
              updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-earth-800 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please
              contact us at:
            </p>
            <div className="bg-earth-50 rounded-lg p-4 mt-4">
              <p className="text-earth-800">
                <strong>Verscienta Health</strong><br />
                Email: <a href="mailto:privacy@verscienta.health" className="text-earth-600 hover:text-earth-800">privacy@verscienta.health</a>
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center mt-8">
        <Link href="/" className="text-sage-600 hover:text-sage-800 font-medium">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

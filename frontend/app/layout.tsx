import type { Metadata } from 'next';
import { Inter, Crimson_Pro, JetBrains_Mono, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chinese',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Verscienta Health - Holistic Health Database',
  description: 'Comprehensive holistic health database covering modalities, herbs, and guided symptom diagnosis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonPro.variable} ${jetbrainsMono.variable} ${notoSerifSC.variable}`}>
      <body className="font-sans">
        <ToastProvider position="bottom-right">
          <div className="min-h-screen bg-gradient-to-b from-earth-50 to-sage-50">
            <Header />

          <main className="container-custom py-8 md:py-12">
            {children}
          </main>

          <footer className="bg-gradient-to-b from-earth-800 to-earth-900 text-white mt-16">
            <div className="container mx-auto px-4 py-12">
              {/* Main Footer Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {/* Brand */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🌿</span>
                    <span className="text-xl font-bold">Verscienta Health</span>
                  </div>
                  <p className="text-earth-300 text-sm leading-relaxed">
                    Bridging ancient wisdom with modern science for holistic wellness and natural healing.
                  </p>
                </div>

                {/* Explore */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-earth-400 mb-4">Explore</h3>
                  <ul className="space-y-3">
                    <li><a href="/herbs" className="text-earth-200 hover:text-white transition-colors text-sm">Medicinal Herbs</a></li>
                    <li><a href="/modalities" className="text-earth-200 hover:text-white transition-colors text-sm">Healing Modalities</a></li>
                    <li><a href="/formulas" className="text-earth-200 hover:text-white transition-colors text-sm">Herbal Formulas</a></li>
                    <li><a href="/conditions" className="text-earth-200 hover:text-white transition-colors text-sm">Health Conditions</a></li>
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-earth-400 mb-4">Resources</h3>
                  <ul className="space-y-3">
                    <li><a href="/symptom-checker" className="text-earth-200 hover:text-white transition-colors text-sm">Symptom Checker</a></li>
                    <li><a href="/practitioners" className="text-earth-200 hover:text-white transition-colors text-sm">Find Practitioners</a></li>
                    <li><a href="/search" className="text-earth-200 hover:text-white transition-colors text-sm">Search Database</a></li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-earth-400 mb-4">Legal</h3>
                  <ul className="space-y-3">
                    <li><a href="/about" className="text-earth-200 hover:text-white transition-colors text-sm">About Us</a></li>
                    <li><a href="/privacy" className="text-earth-200 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                    <li><a href="/terms" className="text-earth-200 hover:text-white transition-colors text-sm">Terms of Use</a></li>
                    <li><a href="/contact" className="text-earth-200 hover:text-white transition-colors text-sm">Contact</a></li>
                  </ul>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-earth-700/50 rounded-lg p-4 mb-8">
                <p className="text-earth-300 text-xs leading-relaxed text-center">
                  <strong className="text-earth-200">Medical Disclaimer:</strong> Information provided is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any disease. Always consult with qualified healthcare professionals before making health decisions.
                </p>
              </div>

              {/* Bottom Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-earth-700">
                <p className="text-earth-400 text-sm">&copy; 2025 Verscienta Health. All rights reserved.</p>
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                  <span className="text-earth-500 text-xs">Built with ancient wisdom & modern technology</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
        </ToastProvider>
      </body>
    </html>
  );
}
# Verscienta Health - Holistic Health Database Platform

A comprehensive platform bridging ancient herbal wisdom with modern science. Features a Next.js frontend, Drupal headless CMS backend, AI-powered symptom analysis, and extensive databases of medicinal herbs, healing modalities, and practitioners.

---

## 🌿 Project Overview

Verscienta Health provides:
- **500+ Medicinal Herbs** with TCM properties, active constituents, dosages, and safety data
- **50+ Healing Modalities** from acupuncture to Ayurveda
- **Classical Formulas** with ingredient breakdowns
- **Practitioner Directory** with location-based search
- **AI Symptom Checker** powered by Grok
- **Comprehensive Safety Information** including contraindications and drug interactions

---

## 🏗️ Architecture

### Frontend
- **Framework:** Next.js 15.3.4 (App Router)
- **Styling:** Tailwind CSS 4.1.0 with custom design system
- **Language:** TypeScript
- **Fonts:** Inter, Crimson Pro, JetBrains Mono, Noto Serif SC
- **Features:** Server-side rendering, static generation, API routes

### Backend
- **CMS:** Drupal 11.x (Headless)
- **API:** JSON:API
- **Environment:** DDEV (Docker-based)
- **Database:** MySQL
- **Modules:** Paragraphs, Field Group, JSON:API Extras

### AI Integration
- **Provider:** Grok (X.AI)
- **Use Cases:** Symptom analysis, health recommendations

### Additional Services
- **Search:** Algolia (planned)
- **CAPTCHA:** Cloudflare Turnstile
- **Auth:** Drupal OAuth 2.0

---

## 📁 Project Structure

```
verscienta-drupal/
├── frontend/                    # Next.js application
│   ├── app/                     # App Router pages
│   │   ├── herbs/              # Herb database pages
│   │   ├── modalities/         # Modality pages
│   │   ├── conditions/         # Condition pages
│   │   ├── practitioners/      # Practitioner finder
│   │   ├── formulas/           # Formula pages
│   │   ├── symptom-checker/   # AI symptom analysis
│   │   ├── profile/            # User profile
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Layout components
│   │   └── auth/               # Authentication components
│   ├── lib/                    # Utilities
│   ├── types/                  # TypeScript definitions
│   └── public/                 # Static assets
│
├── backend/                    # Drupal backend
│   ├── web/                    # Drupal web root
│   ├── config/                 # Configuration
│   ├── scripts/                # Setup scripts ⭐
│   └── composer.json           # PHP dependencies
│
├── .ddev/                      # DDEV configuration
│
└── Documentation Files:
    ├── DESIGN-SYSTEM.md                    # Design specification
    ├── DESIGN-IMPLEMENTATION-COMPLETE.md   # Implementation status
    ├── DRUPAL-SETUP-INSTRUCTIONS.md        # Drupal setup guide ⭐
    ├── DEVELOPMENT-SETUP-GUIDE.md          # Development workflow
    ├── DRUPAL-COMPREHENSIVE-HERB-SETUP.md  # Herb database spec
    └── TURNSTILE-SETUP.md                  # CAPTCHA setup
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker Desktop
- DDEV installed
- Composer

### 1. Clone Repository

```bash
cd /home/pf1/verscienta-drupal
```

### 2. Start Drupal Backend

```bash
# Start DDEV
ddev start

# Install Drupal (if not already installed)
ddev drush site:install standard \
  --site-name="Verscienta Health Backend" \
  --account-name=admin \
  --account-pass=admin \
  --db-url=mysql://db:db@db/db \
  -y

# Run setup script (from project root, NOT inside ddev ssh)
chmod +x setup-drupal.sh
./setup-drupal.sh
```

This will:
- ✅ Install all Drupal modules
- ✅ Create all content types (Herb, Modality, Condition, etc.)
- ✅ Configure JSON:API endpoints
- ✅ Set up CORS
- ✅ Configure permissions

**See [DRUPAL-SETUP-INSTRUCTIONS.md](DRUPAL-SETUP-INSTRUCTIONS.md) for detailed instructions.**

### 3. Start Frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 4. Access Admin Panel

- **URL:** `https://backend.ddev.site/admin`
- **Username:** `admin`
- **Password:** `admin`

---

## 📚 Documentation

### Setup Guides
- **[DRUPAL-SETUP-INSTRUCTIONS.md](DRUPAL-SETUP-INSTRUCTIONS.md)** ⭐ START HERE - Complete Drupal setup
- **[DEVELOPMENT-SETUP-GUIDE.md](DEVELOPMENT-SETUP-GUIDE.md)** - Development workflow
- **[TURNSTILE-SETUP.md](TURNSTILE-SETUP.md)** - CAPTCHA configuration

### Design & Architecture
- **[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)** - Complete design specification
- **[DESIGN-IMPLEMENTATION-COMPLETE.md](DESIGN-IMPLEMENTATION-COMPLETE.md)** - Implementation status
- **[DRUPAL-COMPREHENSIVE-HERB-SETUP.md](DRUPAL-COMPREHENSIVE-HERB-SETUP.md)** - Herb database schema

---

## 🎨 Design System

### Color Palette

**Earth Tones (Primary)**
- Primary: `#5d7a5d` (earth-600)
- Light: `#f5f8f5` (earth-50)
- Dark: `#1a2e1a` (earth-950)

**Sage (Secondary)**
- Primary: `#527a5f` (sage-600)
- Light: `#f3f9f4` (sage-50)

**TCM Red (Accent)**
- Primary: `#c1272d` (tcm-600)

**Gold (Premium)**
- Primary: `#d4a574` (gold-600)

### Typography

- **Sans:** Inter (body text)
- **Serif:** Crimson Pro (headings)
- **Mono:** JetBrains Mono (code)
- **Chinese:** Noto Serif SC (TCM content)

### Component Classes

```tsx
// Cards
<div className="card-standard">Standard card</div>
<div className="card-feature">Feature card with gradient</div>
<div className="card-elevated">Elevated card</div>

// Buttons
<button className="btn-primary">Primary Action</button>
<button className="btn-outline">Outline Button</button>

// Badges
<span className="badge-primary">Primary Badge</span>
<span className="badge-warning">Warning</span>

// TCM-specific
<div className="tcm-section">TCM content</div>
<div className="yin-yang-symbol"></div>
```

---

## 🗄️ Content Types

### Herb (50+ fields)
Comprehensive botanical information including:
- Scientific classification
- TCM properties (taste, temperature, meridians)
- Active constituents
- Therapeutic uses & dosages
- Safety information (contraindications, drug interactions)
- Cultural significance

**JSON:API:** `/jsonapi/node/herb`

### Modality
Healing practices and modalities:
- Description & history
- Techniques & benefits
- Conditions treated

**JSON:API:** `/jsonapi/node/modality`

### Condition
Health conditions:
- Symptoms & severity
- Treatment approaches (Western & holistic)
- Lifestyle recommendations

**JSON:API:** `/jsonapi/node/condition`

### Practitioner
Healthcare practitioners:
- Location & contact info
- Modalities practiced
- Certifications & experience
- Accepting new patients status

**JSON:API:** `/jsonapi/node/practitioner`

### Formula
Herbal formulas:
- Ingredient list with quantities
- Preparation instructions
- Traditional names (English, Pinyin, Chinese)
- Use cases

**JSON:API:** `/jsonapi/node/formula`

---

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Development

```bash
ddev ssh             # SSH into DDEV container
drush cr             # Clear cache
drush status         # Check Drupal status
drush uli            # Generate admin login link
```

### Database Management

```bash
ddev export-db --file=backup.sql.gz    # Export database
ddev import-db --file=backup.sql.gz    # Import database
```

---

## 🧪 Testing

### Test JSON:API Endpoints

```bash
# Herbs
curl -k https://backend.ddev.site/jsonapi/node/herb

# Modalities
curl -k https://backend.ddev.site/jsonapi/node/modality

# Practitioners (with filters)
curl -k "https://backend.ddev.site/jsonapi/node/practitioner?filter[field_accepting_new_patients]=true"
```

### Test Frontend

Visit the following pages:
- Homepage: `http://localhost:3000`
- Herbs: `http://localhost:3000/herbs`
- Modalities: `http://localhost:3000/modalities`
- Symptom Checker: `http://localhost:3000/symptom-checker`
- Practitioner Finder: `http://localhost:3000/practitioners`

---

## 📝 Creating Content

### Via Drupal UI

1. Go to `https://backend.ddev.site/admin/content`
2. Click **Add content**
3. Select content type
4. Fill in the form
5. Click **Save**

### Content Types Quick Links

- Add Herb: `/node/add/herb`
- Add Modality: `/node/add/modality`
- Add Condition: `/node/add/condition`
- Add Practitioner: `/node/add/practitioner`
- Add Formula: `/node/add/formula`

---

## 🔐 Authentication

### User Registration

POST to `/api/auth/register`:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "turnstileToken": "xxx"
}
```

### User Login

POST to `/api/auth/login`:
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

Returns access token for authenticated requests.

---

## 🌐 Environment Variables

### Frontend (.env.local)

```env
# Drupal Backend
NEXT_PUBLIC_DRUPAL_BASE_URL=https://backend.ddev.site

# OAuth (optional)
DRUPAL_CLIENT_ID=verscienta-nextjs-client
DRUPAL_CLIENT_SECRET=your-secret-here

# Grok AI
XAI_API_KEY=your-xai-api-key

# Turnstile CAPTCHA
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# Algolia Search (optional)
NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your-search-key
```

---

## 🚨 Troubleshooting

### "fetch failed" Error

**Problem:** Frontend can't connect to Drupal

**Solution:**
1. Ensure DDEV is running: `ddev status`
2. Check CORS configuration in `web/sites/default/services.yml`
3. Clear Drupal cache: `ddev ssh` then `drush cr`

See [DEVELOPMENT-SETUP-GUIDE.md](DEVELOPMENT-SETUP-GUIDE.md) for full troubleshooting.

### CORS Errors

**Problem:** Cross-origin requests blocked

**Solution:**
```bash
ddev ssh
cat > web/sites/default/services.yml << 'EOF'
parameters:
  cors.config:
    enabled: true
    allowedOrigins:
      - 'http://localhost:3000'
EOF
drush cr
```

### Module Installation Errors

**Problem:** Drush can't install modules

**Solution:**
```bash
ddev composer require drupal/paragraphs drupal/field_group
ddev ssh
drush en paragraphs field_group -y
drush cr
```

---

## 📊 Current Status

### ✅ Completed

- [x] Next.js frontend with App Router
- [x] World-class design system
- [x] Complete TypeScript type definitions
- [x] All content type schemas
- [x] Automated Drupal setup scripts
- [x] JSON:API configuration
- [x] CORS setup
- [x] Authentication system (OAuth)
- [x] Cloudflare Turnstile CAPTCHA
- [x] Zod validation schemas
- [x] UI component library (9 components)
- [x] Herb detail page (900+ lines)
- [x] Formula builder
- [x] Practitioner finder
- [x] Symptom checker (AI-powered)
- [x] User profile management

### 🔄 In Progress

- [ ] Sample content creation
- [ ] Algolia search integration
- [ ] Image optimization (WebP)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Accessibility audit (WCAG 2.1)

### 📅 Planned

- [ ] Mobile app (React Native)
- [ ] Advanced filtering & search
- [ ] User reviews & ratings
- [ ] Practitioner booking system
- [ ] E-commerce (herb sales)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Progressive Web App (PWA)

---

## 🤝 Contributing

This is a private project. For questions or contributions, contact the project maintainer.

---

## 📄 License

Proprietary - All rights reserved

---

## 👥 Credits

**Design & Development:**
- Design System: Earth tones, natural aesthetics
- TCM Integration: Traditional Chinese Medicine elements
- AI Integration: Grok by X.AI

**Technology Stack:**
- Next.js (Vercel)
- Drupal (Drupal Association)
- Tailwind CSS (Tailwind Labs)
- DDEV (DDEV Foundation)

---

## 📞 Support

For setup assistance, see:
1. [DRUPAL-SETUP-INSTRUCTIONS.md](DRUPAL-SETUP-INSTRUCTIONS.md)
2. [DEVELOPMENT-SETUP-GUIDE.md](DEVELOPMENT-SETUP-GUIDE.md)
3. [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)

---

**Last Updated:** 2025-10-03
**Version:** 1.0.0
**Status:** Development

---

Built with ❤️ for holistic health practitioners and seekers worldwide.

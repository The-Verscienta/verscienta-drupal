#!/bin/bash

################################################################################
# Verscienta Health - Taxonomies Setup Script
#
# This script creates all taxonomies (vocabularies) needed for the platform:
# - Herb Family
# - Modality Category
# - TCM Categories
# - Herb Tags
# - Body Systems
# - Therapeutic Actions
#
# Usage:
#   ddev ssh
#   cd /var/www/html
#   chmod +x scripts/setup-taxonomies.sh
#   ./scripts/setup-taxonomies.sh
#
################################################################################

# Note: Not using 'set -e' so script continues even if some items already exist

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================================="
echo "Verscienta Health - Taxonomies Setup"
echo "=========================================================="
echo ""

# Check if we're in Drupal root
if [ ! -f "web/index.php" ]; then
    echo "Error: Not in Drupal root directory"
    echo "Please run: cd /var/www/html"
    exit 1
fi

################################################################################
# HERB FAMILY VOCABULARY
################################################################################

echo -e "${BLUE}Creating Herb Family vocabulary...${NC}"

drush php:eval "
  \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->load('herb_family');
  if (!\$vocab) {
    \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->create([
      'vid' => 'herb_family',
      'name' => 'Herb Family',
      'description' => 'Botanical families of medicinal herbs',
    ]);
    \$vocab->save();
    echo 'Herb Family vocabulary created\n';
  } else {
    echo 'Herb Family vocabulary already exists\n';
  }
"

# Add common herb families as terms
drush php:eval "
  \$families = [
    'Asteraceae' => 'Daisy/Composite family (e.g., Echinacea, Chamomile, Calendula)',
    'Lamiaceae' => 'Mint family (e.g., Lavender, Rosemary, Sage, Thyme)',
    'Apiaceae' => 'Carrot/Parsley family (e.g., Angelica, Fennel, Dill)',
    'Fabaceae' => 'Legume family (e.g., Astragalus, Licorice)',
    'Rosaceae' => 'Rose family (e.g., Hawthorn, Rose hips)',
    'Zingiberaceae' => 'Ginger family (e.g., Ginger, Turmeric, Cardamom)',
    'Solanaceae' => 'Nightshade family (e.g., Ashwagandha)',
    'Ranunculaceae' => 'Buttercup family (e.g., Goldenseal, Black Cohosh)',
    'Lauraceae' => 'Laurel family (e.g., Cinnamon)',
    'Berberidaceae' => 'Barberry family (e.g., Oregon Grape)',
    'Scrophulariaceae' => 'Figwort family (e.g., Mullein, Eyebright)',
    'Caprifoliaceae' => 'Honeysuckle family (e.g., Elderberry, Valerian)',
    'Papaveraceae' => 'Poppy family (e.g., California Poppy)',
    'Malvaceae' => 'Mallow family (e.g., Marshmallow)',
    'Urticaceae' => 'Nettle family (e.g., Stinging Nettle)',
    'Plantaginaceae' => 'Plantain family (e.g., Plantain)',
    'Brassicaceae' => 'Mustard family (e.g., Horseradish)',
    'Araliaceae' => 'Ginseng family (e.g., Ginseng, Eleuthero)',
    'Verbenaceae' => 'Verbena family (e.g., Lemon Verbena)',
    'Boraginaceae' => 'Borage family (e.g., Comfrey, Borage)',
  ];

  \$storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');

  foreach (\$families as \$name => \$description) {
    \$existing = \$storage->loadByProperties(['vid' => 'herb_family', 'name' => \$name]);
    if (empty(\$existing)) {
      \$term = \$storage->create([
        'vid' => 'herb_family',
        'name' => \$name,
        'description' => ['value' => \$description, 'format' => 'basic_html'],
      ]);
      \$term->save();
    }
  }
  echo 'Herb families added\n';
"

echo -e "${GREEN}✓ Herb Family vocabulary created with terms${NC}"
echo ""

################################################################################
# MODALITY CATEGORY VOCABULARY
################################################################################

echo -e "${BLUE}Creating Modality Category vocabulary...${NC}"

drush php:eval "
  \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->load('modality_category');
  if (!\$vocab) {
    \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->create([
      'vid' => 'modality_category',
      'name' => 'Modality Category',
      'description' => 'Categories of holistic health modalities',
    ]);
    \$vocab->save();
    echo 'Modality Category vocabulary created\n';
  } else {
    echo 'Modality Category vocabulary already exists\n';
  }
"

# Add modality categories
drush php:eval "
  \$categories = [
    'Traditional Chinese Medicine' => 'TCM practices including acupuncture, herbal medicine, qi gong',
    'Ayurveda' => 'Traditional Indian medicine system',
    'Western Herbalism' => 'Western traditions of herbal medicine',
    'Mind-Body Practices' => 'Yoga, meditation, breathwork, tai chi',
    'Manual Therapies' => 'Massage, chiropractic, osteopathy, reflexology',
    'Energy Healing' => 'Reiki, therapeutic touch, pranic healing',
    'Naturopathy' => 'Naturopathic medicine and approaches',
    'Homeopathy' => 'Homeopathic treatments',
    'Nutrition & Diet' => 'Nutritional therapy, dietary approaches',
    'Hydrotherapy' => 'Water-based treatments',
    'Movement Therapy' => 'Dance therapy, Feldenkrais, Alexander technique',
    'Sound Therapy' => 'Sound healing, music therapy',
    'Aromatherapy' => 'Essential oil therapies',
    'Flower Essences' => 'Bach flowers and other flower essences',
  ];

  \$storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');

  foreach (\$categories as \$name => \$description) {
    \$existing = \$storage->loadByProperties(['vid' => 'modality_category', 'name' => \$name]);
    if (empty(\$existing)) {
      \$term = \$storage->create([
        'vid' => 'modality_category',
        'name' => \$name,
        'description' => ['value' => \$description, 'format' => 'basic_html'],
      ]);
      \$term->save();
    }
  }
  echo 'Modality categories added\n';
"

echo -e "${GREEN}✓ Modality Category vocabulary created with terms${NC}"
echo ""

################################################################################
# TCM CATEGORIES VOCABULARY
################################################################################

echo -e "${BLUE}Creating TCM Categories vocabulary...${NC}"

drush php:eval "
  \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->load('tcm_categories');
  if (!\$vocab) {
    \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->create([
      'vid' => 'tcm_categories',
      'name' => 'TCM Categories',
      'description' => 'Traditional Chinese Medicine herb categories',
    ]);
    \$vocab->save();
    echo 'TCM Categories vocabulary created\n';
  } else {
    echo 'TCM Categories vocabulary already exists\n';
  }
"

# Add TCM categories
drush php:eval "
  \$categories = [
    'Release the Exterior - Warm Acrid' => 'Ma Huang, Gui Zhi type herbs',
    'Release the Exterior - Cool Acrid' => 'Bo He, Sang Ye type herbs',
    'Clear Heat - Drain Fire' => 'Shi Gao, Zhi Mu type herbs',
    'Clear Heat - Cool Blood' => 'Sheng Di, Mu Dan Pi type herbs',
    'Clear Heat - Dry Dampness' => 'Huang Qin, Huang Lian type herbs',
    'Clear Heat - Resolve Toxins' => 'Jin Yin Hua, Lian Qiao type herbs',
    'Clear Heat - Deficiency' => 'Qing Hao, Di Gu Pi type herbs',
    'Drain Downward - Purgatives' => 'Da Huang, Mang Xiao type herbs',
    'Drain Downward - Moist Laxatives' => 'Huo Ma Ren type herbs',
    'Drain Dampness' => 'Fu Ling, Ze Xie type herbs',
    'Dispel Wind-Dampness' => 'Du Huo, Qiang Huo type herbs',
    'Transform Phlegm - Warm' => 'Ban Xia, Tian Nan Xing type herbs',
    'Transform Phlegm - Cool' => 'Bei Mu, Gua Lou type herbs',
    'Relieve Cough and Wheeze' => 'Xing Ren, Su Zi type herbs',
    'Aromatic Transform Dampness' => 'Cang Zhu, Huo Xiang type herbs',
    'Relieve Food Stagnation' => 'Shan Zha, Mai Ya type herbs',
    'Regulate Qi' => 'Chen Pi, Zhi Ke type herbs',
    'Stop Bleeding' => 'San Qi, Ai Ye type herbs',
    'Invigorate Blood' => 'Chuan Xiong, Dan Shen type herbs',
    'Warm Interior' => 'Fu Zi, Gan Jiang type herbs',
    'Tonify Qi' => 'Ren Shen, Huang Qi type herbs',
    'Tonify Blood' => 'Dang Gui, Shu Di Huang type herbs',
    'Tonify Yin' => 'Mai Men Dong, Gou Qi Zi type herbs',
    'Tonify Yang' => 'Lu Rong, Du Zhong type herbs',
    'Astringent' => 'Wu Wei Zi, Shan Zhu Yu type herbs',
    'Calm Spirit - Anchor' => 'Long Gu, Mu Li type herbs',
    'Calm Spirit - Nourish Heart' => 'Suan Zao Ren, Bai Zi Ren type herbs',
    'Aromatic Open Orifices' => 'She Xiang, Bing Pian type herbs',
    'Extinguish Wind' => 'Ling Yang Jiao, Gou Teng type herbs',
    'Expel Parasites' => 'Bing Lang, Ku Lian Pi type herbs',
    'External Application' => 'Herbs for topical use',
  ];

  \$storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');

  foreach (\$categories as \$name => \$description) {
    \$existing = \$storage->loadByProperties(['vid' => 'tcm_categories', 'name' => \$name]);
    if (empty(\$existing)) {
      \$term = \$storage->create([
        'vid' => 'tcm_categories',
        'name' => \$name,
        'description' => ['value' => \$description, 'format' => 'basic_html'],
      ]);
      \$term->save();
    }
  }
  echo 'TCM categories added\n';
"

echo -e "${GREEN}✓ TCM Categories vocabulary created with terms${NC}"
echo ""

################################################################################
# HERB TAGS VOCABULARY
################################################################################

echo -e "${BLUE}Creating Herb Tags vocabulary...${NC}"

drush php:eval "
  \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->load('herb_tags');
  if (!\$vocab) {
    \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->create([
      'vid' => 'herb_tags',
      'name' => 'Herb Tags',
      'description' => 'General tags for herbs',
    ]);
    \$vocab->save();
    echo 'Herb Tags vocabulary created\n';
  } else {
    echo 'Herb Tags vocabulary already exists\n';
  }
"

# Add common herb tags
drush php:eval "
  \$tags = [
    'Adaptogen',
    'Nervine',
    'Sedative',
    'Stimulant',
    'Tonic',
    'Antimicrobial',
    'Antiviral',
    'Antibacterial',
    'Antifungal',
    'Anti-inflammatory',
    'Antioxidant',
    'Analgesic',
    'Digestive',
    'Carminative',
    'Bitter',
    'Demulcent',
    'Expectorant',
    'Diuretic',
    'Emmenagogue',
    'Galactagogue',
    'Hepatoprotective',
    'Immune Support',
    'Cardiotonic',
    'Hypotensive',
    'Vulnerary',
    'Astringent',
    'Alterative',
    'Circulatory',
    'Respiratory',
    'Nervine Relaxant',
    'Nervine Stimulant',
    'Nootropic',
    'Aphrodisiac',
    'Pregnancy Safe',
    'Pregnancy Caution',
    'Children Safe',
    'Endangered',
    'Sustainably Sourced',
    'Organic Available',
    'Wild Crafted',
  ];

  \$storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');

  foreach (\$tags as \$name) {
    \$existing = \$storage->loadByProperties(['vid' => 'herb_tags', 'name' => \$name]);
    if (empty(\$existing)) {
      \$term = \$storage->create([
        'vid' => 'herb_tags',
        'name' => \$name,
      ]);
      \$term->save();
    }
  }
  echo 'Herb tags added\n';
"

echo -e "${GREEN}✓ Herb Tags vocabulary created with terms${NC}"
echo ""

################################################################################
# BODY SYSTEMS VOCABULARY
################################################################################

echo -e "${BLUE}Creating Body Systems vocabulary...${NC}"

drush php:eval "
  \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->load('body_systems');
  if (!\$vocab) {
    \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->create([
      'vid' => 'body_systems',
      'name' => 'Body Systems',
      'description' => 'Human body systems for categorizing conditions and herbs',
    ]);
    \$vocab->save();
    echo 'Body Systems vocabulary created\n';
  } else {
    echo 'Body Systems vocabulary already exists\n';
  }
"

# Add body systems
drush php:eval "
  \$systems = [
    'Cardiovascular System' => 'Heart and blood vessels',
    'Respiratory System' => 'Lungs and airways',
    'Digestive System' => 'Stomach, intestines, liver, gallbladder, pancreas',
    'Nervous System' => 'Brain, spinal cord, nerves',
    'Musculoskeletal System' => 'Bones, muscles, joints, tendons',
    'Integumentary System' => 'Skin, hair, nails',
    'Immune System' => 'Immune defense mechanisms',
    'Endocrine System' => 'Hormones and glands',
    'Reproductive System' => 'Reproductive organs',
    'Urinary System' => 'Kidneys, bladder, urinary tract',
    'Lymphatic System' => 'Lymph nodes and vessels',
    'Sensory System' => 'Eyes, ears, nose, touch, taste',
    'Mental/Emotional' => 'Mental health, mood, cognition',
  ];

  \$storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');

  foreach (\$systems as \$name => \$description) {
    \$existing = \$storage->loadByProperties(['vid' => 'body_systems', 'name' => \$name]);
    if (empty(\$existing)) {
      \$term = \$storage->create([
        'vid' => 'body_systems',
        'name' => \$name,
        'description' => ['value' => \$description, 'format' => 'basic_html'],
      ]);
      \$term->save();
    }
  }
  echo 'Body systems added\n';
"

echo -e "${GREEN}✓ Body Systems vocabulary created with terms${NC}"
echo ""

################################################################################
# THERAPEUTIC ACTIONS VOCABULARY
################################################################################

echo -e "${BLUE}Creating Therapeutic Actions vocabulary...${NC}"

drush php:eval "
  \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->load('therapeutic_actions');
  if (!\$vocab) {
    \$vocab = \Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->create([
      'vid' => 'therapeutic_actions',
      'name' => 'Therapeutic Actions',
      'description' => 'Actions and effects of herbs and modalities',
    ]);
    \$vocab->save();
    echo 'Therapeutic Actions vocabulary created\n';
  } else {
    echo 'Therapeutic Actions vocabulary already exists\n';
  }
"

# Add therapeutic actions
drush php:eval "
  \$actions = [
    'Adaptogenic' => 'Helps body adapt to stress',
    'Alterative' => 'Gradually restores proper body function',
    'Analgesic' => 'Pain relieving',
    'Anthelmintic' => 'Expels parasites',
    'Anti-inflammatory' => 'Reduces inflammation',
    'Antimicrobial' => 'Kills or inhibits microorganisms',
    'Antispasmodic' => 'Relieves muscle spasms',
    'Anxiolytic' => 'Reduces anxiety',
    'Astringent' => 'Contracts and tightens tissues',
    'Bitter' => 'Stimulates digestive secretions',
    'Carminative' => 'Relieves gas and bloating',
    'Cholagogue' => 'Promotes bile flow',
    'Demulcent' => 'Soothes irritated tissues',
    'Diaphoretic' => 'Promotes sweating',
    'Diuretic' => 'Increases urine output',
    'Emmenagogue' => 'Promotes menstruation',
    'Expectorant' => 'Promotes expulsion of mucus',
    'Galactagogue' => 'Promotes milk production',
    'Hepatoprotective' => 'Protects liver function',
    'Hypotensive' => 'Lowers blood pressure',
    'Immunomodulating' => 'Modulates immune function',
    'Laxative' => 'Promotes bowel movements',
    'Nervine' => 'Affects nervous system',
    'Nootropic' => 'Enhances cognitive function',
    'Sedative' => 'Calms and relaxes',
    'Tonic' => 'Strengthens and invigorates',
    'Vulnerary' => 'Promotes wound healing',
  ];

  \$storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');

  foreach (\$actions as \$name => \$description) {
    \$existing = \$storage->loadByProperties(['vid' => 'therapeutic_actions', 'name' => \$name]);
    if (empty(\$existing)) {
      \$term = \$storage->create([
        'vid' => 'therapeutic_actions',
        'name' => \$name,
        'description' => ['value' => \$description, 'format' => 'basic_html'],
      ]);
      \$term->save();
    }
  }
  echo 'Therapeutic actions added\n';
"

echo -e "${GREEN}✓ Therapeutic Actions vocabulary created with terms${NC}"
echo ""

################################################################################
# CLEAR CACHE
################################################################################

echo -e "${BLUE}Clearing cache...${NC}"
drush cr
echo -e "${GREEN}✓ Cache cleared${NC}"
echo ""

echo "=========================================================="
echo -e "${GREEN}SUCCESS! All taxonomies created!${NC}"
echo "=========================================================="
echo ""
echo "Created vocabularies:"
echo "  - Herb Family (/admin/structure/taxonomy/manage/herb_family)"
echo "  - Modality Category (/admin/structure/taxonomy/manage/modality_category)"
echo "  - TCM Categories (/admin/structure/taxonomy/manage/tcm_categories)"
echo "  - Herb Tags (/admin/structure/taxonomy/manage/herb_tags)"
echo "  - Body Systems (/admin/structure/taxonomy/manage/body_systems)"
echo "  - Therapeutic Actions (/admin/structure/taxonomy/manage/therapeutic_actions)"
echo ""
echo "JSON:API endpoints:"
echo "  - /jsonapi/taxonomy_term/herb_family"
echo "  - /jsonapi/taxonomy_term/modality_category"
echo "  - /jsonapi/taxonomy_term/tcm_categories"
echo "  - /jsonapi/taxonomy_term/herb_tags"
echo "  - /jsonapi/taxonomy_term/body_systems"
echo "  - /jsonapi/taxonomy_term/therapeutic_actions"
echo ""

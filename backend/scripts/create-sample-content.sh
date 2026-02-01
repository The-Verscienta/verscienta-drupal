#!/bin/bash

# ============================================================================
# Verscienta Health - Sample Content Creation
# ============================================================================
# This script creates sample content for testing and development.
# Run this AFTER running all field setup scripts.
#
# Usage: ddev exec bash /var/www/html/scripts/create-sample-content.sh
# ============================================================================

# Note: Not using 'set -e' so script continues even if some content already exists

echo "=============================================="
echo "Creating Sample Content for Verscienta Health"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "=============================================="
echo "1. Creating Sample HERBS"
echo "=============================================="

# Herb 1: Astragalus
echo -e "${BLUE}Creating: Astragalus (Huang Qi)${NC}"
drush content:create node herb --title="Astragalus" --body="$(cat <<'BODY'
Astragalus membranaceus, commonly known as Huang Qi in Traditional Chinese Medicine, is one of the most important tonic herbs in the Chinese pharmacopoeia. It has been used for over 2000 years to strengthen the body's vital energy (Qi) and support immune function.

The root is harvested from plants that are at least four years old and is traditionally sliced and dried for use in decoctions, powders, and extracts.
BODY
)" 2>/dev/null || echo "  Herb may already exist or error occurred"

# Herb 2: Ginkgo
echo -e "${BLUE}Creating: Ginkgo Biloba${NC}"
drush content:create node herb --title="Ginkgo Biloba" --body="$(cat <<'BODY'
Ginkgo biloba is one of the oldest living tree species, often called a "living fossil." The fan-shaped leaves have been used in Traditional Chinese Medicine for thousands of years and are now one of the most researched herbs worldwide.

Modern research has focused on its effects on circulation, cognitive function, and its potent antioxidant properties. The standardized extract (EGb 761) is one of the most studied herbal preparations.
BODY
)" 2>/dev/null || echo "  Herb may already exist or error occurred"

# Herb 3: Ashwagandha
echo -e "${BLUE}Creating: Ashwagandha${NC}"
drush content:create node herb --title="Ashwagandha" --body="$(cat <<'BODY'
Ashwagandha (Withania somnifera), also known as Indian Ginseng or Winter Cherry, is one of the most important herbs in Ayurveda, the traditional medicine system of India. It is classified as a Rasayana (rejuvenating tonic) and is known for its adaptogenic properties.

The name "ashwagandha" comes from Sanskrit and means "smell of the horse," referring both to its unique smell and its reputation for imparting the strength and vitality of a horse.
BODY
)" 2>/dev/null || echo "  Herb may already exist or error occurred"

# Herb 4: Turmeric
echo -e "${BLUE}Creating: Turmeric${NC}"
drush content:create node herb --title="Turmeric" --body="$(cat <<'BODY'
Turmeric (Curcuma longa) is a flowering plant of the ginger family. The rhizomes are used both as a culinary spice and in traditional medicine. The primary active compound, curcumin, has been extensively studied for its anti-inflammatory and antioxidant properties.

In Ayurveda, turmeric is considered a "tridoshic" herb, meaning it can help balance all three doshas (Vata, Pitta, and Kapha) when used appropriately.
BODY
)" 2>/dev/null || echo "  Herb may already exist or error occurred"

# Herb 5: Elderberry
echo -e "${BLUE}Creating: Elderberry${NC}"
drush content:create node herb --title="Elderberry" --body="$(cat <<'BODY'
Elderberry (Sambucus nigra) has been used for centuries in European folk medicine. The dark purple berries are rich in anthocyanins and have been traditionally used to support immune function, particularly during cold and flu season.

Both the flowers and berries are used medicinally. Elder flower tea is traditionally used for fever and respiratory conditions, while the berry is prized for its immune-supporting properties.
BODY
)" 2>/dev/null || echo "  Herb may already exist or error occurred"

# Herb 6: Reishi
echo -e "${BLUE}Creating: Reishi Mushroom${NC}"
drush content:create node herb --title="Reishi Mushroom" --body="$(cat <<'BODY'
Reishi (Ganoderma lucidum), known as Ling Zhi in Chinese, is revered as the "Mushroom of Immortality" in Traditional Chinese Medicine. It has been used for over 2000 years to promote longevity, support immune function, and calm the spirit.

Modern research has focused on its polysaccharides and triterpenes, which appear to have immunomodulating and adaptogenic effects.
BODY
)" 2>/dev/null || echo "  Herb may already exist or error occurred"

# Herb 7: Echinacea
echo -e "${BLUE}Creating: Echinacea${NC}"
drush content:create node herb --title="Echinacea" --body="$(cat <<'BODY'
Echinacea (Echinacea purpurea, E. angustifolia) was extensively used by Native American tribes for various conditions. Today it is one of the most popular herbs in Western herbalism, primarily used to support immune function.

There are nine species of Echinacea, but E. purpurea, E. angustifolia, and E. pallida are the most commonly used medicinally. The root, leaves, and flowers all contain active compounds.
BODY
)" 2>/dev/null || echo "  Herb may already exist or error occurred"

# Herb 8: Valerian
echo -e "${BLUE}Creating: Valerian${NC}"
drush content:create node herb --title="Valerian" --body="$(cat <<'BODY'
Valerian (Valeriana officinalis) has been used since ancient Greek and Roman times for sleep support and nervous system calming. The root has a distinctive, strong odor due to its volatile oil content.

It is one of the most researched herbs for sleep support and is widely used in Europe, where it is often available by prescription for sleep difficulties.
BODY
)" 2>/dev/null || echo "  Herb may already exist or error occurred"

# Herb 9: Milk Thistle
echo -e "${BLUE}Creating: Milk Thistle${NC}"
drush content:create node herb --title="Milk Thistle" --body="$(cat <<'BODY'
Milk Thistle (Silybum marianum) is native to the Mediterranean region and has been used for over 2000 years for liver support. The active compound complex, silymarin, is concentrated in the seeds.

It is one of the most well-researched herbs for liver protection and support, with silymarin demonstrating antioxidant, anti-inflammatory, and hepatoprotective properties in numerous studies.
BODY
)" 2>/dev/null || echo "  Herb may already exist or error occurred"

# Herb 10: Chamomile
echo -e "${BLUE}Creating: Chamomile${NC}"
drush content:create node herb --title="Chamomile" --body="$(cat <<'BODY'
Chamomile (Matricaria chamomilla or Chamaemelum nobile) is one of the oldest and most widely used medicinal plants. The delicate, daisy-like flowers have been used for thousands of years for relaxation, digestive support, and skin care.

German chamomile (Matricaria chamomilla) is more commonly used medicinally, while Roman chamomile (Chamaemelum nobile) is often preferred for aromatherapy.
BODY
)" 2>/dev/null || echo "  Herb may already exist or error occurred"

echo ""
echo "=============================================="
echo "2. Creating Sample MODALITIES"
echo "=============================================="

# Modality 1: Traditional Chinese Medicine
echo -e "${BLUE}Creating: Traditional Chinese Medicine${NC}"
drush content:create node modality --title="Traditional Chinese Medicine" --body="$(cat <<'BODY'
Traditional Chinese Medicine (TCM) is a comprehensive medical system that has evolved over more than 3,000 years. It includes various practices such as acupuncture, herbal medicine, tai chi, qigong, dietary therapy, and tui na (therapeutic massage).

TCM is based on the concept of Qi (vital energy) flowing through meridians in the body, and the balance of Yin and Yang. Practitioners assess patterns of disharmony and use various modalities to restore balance and support the body's natural healing abilities.
BODY
)" 2>/dev/null || echo "  Modality may already exist or error occurred"

# Modality 2: Ayurveda
echo -e "${BLUE}Creating: Ayurveda${NC}"
drush content:create node modality --title="Ayurveda" --body="$(cat <<'BODY'
Ayurveda, meaning "science of life" in Sanskrit, is one of the world's oldest holistic healing systems, originating in India over 5,000 years ago. It emphasizes the interconnection of body, mind, and spirit.

The system is based on the concept of three doshas (Vata, Pitta, Kapha) which govern physiological and psychological functions. Treatment approaches include herbal medicine, dietary recommendations, yoga, meditation, massage (abhyanga), and cleansing procedures (panchakarma).
BODY
)" 2>/dev/null || echo "  Modality may already exist or error occurred"

# Modality 3: Acupuncture
echo -e "${BLUE}Creating: Acupuncture${NC}"
drush content:create node modality --title="Acupuncture" --body="$(cat <<'BODY'
Acupuncture is a key component of Traditional Chinese Medicine involving the insertion of thin needles into specific points on the body. These acupoints are located along meridians, or channels, through which Qi (vital energy) flows.

Modern research suggests acupuncture may work by stimulating the nervous system, promoting blood flow, and triggering the release of natural pain-relieving chemicals. It is widely used for pain management, stress reduction, and various health conditions.
BODY
)" 2>/dev/null || echo "  Modality may already exist or error occurred"

# Modality 4: Naturopathy
echo -e "${BLUE}Creating: Naturopathy${NC}"
drush content:create node modality --title="Naturopathy" --body="$(cat <<'BODY'
Naturopathy is a system of medicine that emphasizes prevention, treatment, and optimal health through the use of therapeutic methods and substances that encourage the body's inherent self-healing process.

Naturopathic physicians are trained in both conventional medical sciences and natural therapies including clinical nutrition, botanical medicine, homeopathy, hydrotherapy, physical medicine, and counseling. The six principles of naturopathic medicine guide all treatment decisions.
BODY
)" 2>/dev/null || echo "  Modality may already exist or error occurred"

# Modality 5: Herbalism
echo -e "${BLUE}Creating: Western Herbalism${NC}"
drush content:create node modality --title="Western Herbalism" --body="$(cat <<'BODY'
Western Herbalism, also known as phytotherapy, is the practice of using plants and plant extracts for therapeutic purposes. This tradition draws from European, Native American, and contemporary scientific approaches to botanical medicine.

Unlike TCM or Ayurveda, Western herbalism often focuses on the specific pharmacological actions of herbs and their active constituents. Practitioners may use whole herbs, standardized extracts, tinctures, teas, or capsules depending on the therapeutic goal.
BODY
)" 2>/dev/null || echo "  Modality may already exist or error occurred"

# Modality 6: Homeopathy
echo -e "${BLUE}Creating: Homeopathy${NC}"
drush content:create node modality --title="Homeopathy" --body="$(cat <<'BODY'
Homeopathy is a medical system developed in the late 18th century by German physician Samuel Hahnemann. It is based on the principle of "like cures like" - that a substance causing symptoms in a healthy person can treat similar symptoms in a sick person when given in highly diluted form.

Homeopathic remedies are prepared through a process of serial dilution and succussion (vigorous shaking). Practitioners conduct detailed interviews to match the patient's complete symptom picture to the most appropriate remedy.
BODY
)" 2>/dev/null || echo "  Modality may already exist or error occurred"

echo ""
echo "=============================================="
echo "3. Creating Sample CONDITIONS"
echo "=============================================="

# Condition 1: Insomnia
echo -e "${BLUE}Creating: Insomnia${NC}"
drush content:create node condition --title="Insomnia" --body="$(cat <<'BODY'
Insomnia is a common sleep disorder characterized by difficulty falling asleep, staying asleep, or both. It can be acute (short-term) or chronic (lasting a month or longer). Insomnia can affect daytime functioning, mood, and overall quality of life.

From a holistic perspective, insomnia often reflects imbalances in the body's natural rhythms. TCM may view it as a disturbance of Shen (spirit) or deficiency of Blood or Yin. Ayurveda often associates sleep difficulties with Vata imbalance.
BODY
)" 2>/dev/null || echo "  Condition may already exist or error occurred"

# Condition 2: Anxiety
echo -e "${BLUE}Creating: Anxiety${NC}"
drush content:create node condition --title="Anxiety" --body="$(cat <<'BODY'
Anxiety is characterized by persistent worry, nervousness, or unease about events with uncertain outcomes. While occasional anxiety is normal, persistent anxiety can interfere with daily life and may manifest with physical symptoms like rapid heartbeat, sweating, and digestive issues.

Holistic approaches to anxiety often address the mind-body connection, using practices like meditation, breathwork, and adaptogenic herbs alongside lifestyle modifications.
BODY
)" 2>/dev/null || echo "  Condition may already exist or error occurred"

# Condition 3: Digestive Issues
echo -e "${BLUE}Creating: Digestive Disorders${NC}"
drush content:create node condition --title="Digestive Disorders" --body="$(cat <<'BODY'
Digestive disorders encompass a wide range of conditions affecting the gastrointestinal tract, including irritable bowel syndrome (IBS), acid reflux, bloating, and inflammatory bowel conditions. These can significantly impact quality of life and nutrient absorption.

Both TCM and Ayurveda place great emphasis on digestive health as the foundation of overall wellness. In TCM, the Spleen and Stomach are considered the "source of Post-Heaven Qi," while Ayurveda considers Agni (digestive fire) essential to health.
BODY
)" 2>/dev/null || echo "  Condition may already exist or error occurred"

# Condition 4: Stress
echo -e "${BLUE}Creating: Chronic Stress${NC}"
drush content:create node condition --title="Chronic Stress" --body="$(cat <<'BODY'
Chronic stress occurs when stress response systems are constantly activated over extended periods. This can lead to various health issues including cardiovascular problems, weakened immune function, digestive issues, and mental health challenges.

Adaptogenic herbs, mind-body practices, and lifestyle modifications are key components of holistic stress management. These approaches aim to support the body's resilience and promote relaxation.
BODY
)" 2>/dev/null || echo "  Condition may already exist or error occurred"

# Condition 5: Immune Weakness
echo -e "${BLUE}Creating: Immune System Weakness${NC}"
drush content:create node condition --title="Immune System Weakness" --body="$(cat <<'BODY'
A weakened immune system can result from various factors including chronic stress, poor nutrition, lack of sleep, sedentary lifestyle, or underlying health conditions. Symptoms may include frequent infections, slow wound healing, and persistent fatigue.

Traditional medicine systems have long recognized the importance of strengthening the body's defensive Qi (TCM) or Ojas (Ayurveda). Immune-modulating herbs, proper nutrition, and lifestyle practices form the foundation of holistic immune support.
BODY
)" 2>/dev/null || echo "  Condition may already exist or error occurred"

# Condition 6: Joint Pain
echo -e "${BLUE}Creating: Joint Pain and Arthritis${NC}"
drush content:create node condition --title="Joint Pain and Arthritis" --body="$(cat <<'BODY'
Joint pain can result from various conditions including osteoarthritis, rheumatoid arthritis, or general inflammation. It can significantly impact mobility and quality of life. Symptoms include pain, stiffness, swelling, and reduced range of motion.

Holistic approaches often combine anti-inflammatory herbs, dietary modifications (reducing inflammatory foods), gentle exercise, and therapies like acupuncture or massage to address both symptoms and underlying causes.
BODY
)" 2>/dev/null || echo "  Condition may already exist or error occurred"

echo ""
echo "=============================================="
echo "4. Creating Sample PRACTITIONERS"
echo "=============================================="

# Practitioner 1
echo -e "${BLUE}Creating: Dr. Sarah Chen, LAc, DAOM${NC}"
drush content:create node practitioner --title="Dr. Sarah Chen, LAc, DAOM" --body="$(cat <<'BODY'
Dr. Sarah Chen is a Doctor of Acupuncture and Oriental Medicine with over 15 years of experience in Traditional Chinese Medicine. She specializes in women's health, fertility support, and stress-related conditions.

Dr. Chen received her training at the Pacific College of Health and Science and completed advanced studies in Beijing. She integrates acupuncture, Chinese herbal medicine, and dietary therapy in her holistic approach to patient care.
BODY
)" 2>/dev/null || echo "  Practitioner may already exist or error occurred"

# Practitioner 2
echo -e "${BLUE}Creating: Dr. Michael Torres, ND${NC}"
drush content:create node practitioner --title="Dr. Michael Torres, ND" --body="$(cat <<'BODY'
Dr. Michael Torres is a licensed Naturopathic Doctor with a focus on digestive health and integrative oncology support. He believes in addressing the root cause of health issues rather than just managing symptoms.

After graduating from Bastyr University, Dr. Torres completed additional training in functional medicine and clinical nutrition. He works with patients to develop personalized wellness plans incorporating botanical medicine, nutrition, and lifestyle counseling.
BODY
)" 2>/dev/null || echo "  Practitioner may already exist or error occurred"

# Practitioner 3
echo -e "${BLUE}Creating: Dr. Priya Sharma, BAMS, AD${NC}"
drush content:create node practitioner --title="Dr. Priya Sharma, BAMS, AD" --body="$(cat <<'BODY'
Dr. Priya Sharma is an Ayurvedic practitioner trained in India at Gujarat Ayurved University. She has over 12 years of experience helping patients achieve balance through the ancient wisdom of Ayurveda.

Dr. Sharma offers personalized consultations including pulse diagnosis, constitutional assessment, dietary recommendations, herbal protocols, and panchakarma therapies. She specializes in digestive disorders, skin conditions, and stress management.
BODY
)" 2>/dev/null || echo "  Practitioner may already exist or error occurred"

# Practitioner 4
echo -e "${BLUE}Creating: Lisa Martinez, RH, AHG${NC}"
drush content:create node practitioner --title="Lisa Martinez, RH, AHG" --body="$(cat <<'BODY'
Lisa Martinez is a Registered Herbalist and member of the American Herbalists Guild with over 20 years of experience in clinical herbalism. She specializes in women's health, stress management, and supporting the body through life transitions.

Lisa completed her training at the Rocky Mountain Center for Botanical Studies and has studied with renowned herbalists worldwide. She creates custom herbal formulations and teaches workshops on herbal medicine.
BODY
)" 2>/dev/null || echo "  Practitioner may already exist or error occurred"

echo ""
echo "=============================================="
echo "5. Creating Sample FORMULAS"
echo "=============================================="

# Formula 1: Si Jun Zi Tang
echo -e "${BLUE}Creating: Si Jun Zi Tang (Four Gentlemen Decoction)${NC}"
drush content:create node formula --title="Si Jun Zi Tang (Four Gentlemen Decoction)" --body="$(cat <<'BODY'
Si Jun Zi Tang, or Four Gentlemen Decoction, is one of the most fundamental formulas in Traditional Chinese Medicine for tonifying Qi. It serves as the foundation for many other Qi-tonifying formulas.

The formula consists of four herbs that work synergistically: Ren Shen (Ginseng) as the chief herb to strongly tonify Qi, Bai Zhu (White Atractylodes) to strengthen the Spleen and dry dampness, Fu Ling (Poria) to leach dampness and support the Spleen, and Zhi Gan Cao (Honey-fried Licorice) to harmonize the formula and strengthen the middle burner.

Primary Indications: Spleen Qi deficiency with symptoms such as fatigue, poor appetite, loose stools, weak limbs, and pale complexion.
BODY
)" 2>/dev/null || echo "  Formula may already exist or error occurred"

# Formula 2: Liu Wei Di Huang Wan
echo -e "${BLUE}Creating: Liu Wei Di Huang Wan (Six Ingredient Pill with Rehmannia)${NC}"
drush content:create node formula --title="Liu Wei Di Huang Wan" --body="$(cat <<'BODY'
Liu Wei Di Huang Wan, or Six Ingredient Pill with Rehmannia, is a classical formula for nourishing Kidney Yin. First recorded in the Song Dynasty, it remains one of the most commonly used formulas for Yin deficiency patterns.

The formula elegantly balances three tonifying herbs with three draining herbs: Shu Di Huang (Prepared Rehmannia) strongly nourishes Kidney Yin, Shan Zhu Yu (Cornus) nourishes the Liver, and Shan Yao (Dioscorea) tonifies the Spleen. The draining herbs - Ze Xie, Fu Ling, and Mu Dan Pi - prevent stagnation while clearing deficiency heat.

Primary Indications: Kidney and Liver Yin deficiency with symptoms such as soreness in the lower back and knees, dizziness, tinnitus, night sweats, and afternoon fever.
BODY
)" 2>/dev/null || echo "  Formula may already exist or error occurred"

# Formula 3: Xiao Yao San
echo -e "${BLUE}Creating: Xiao Yao San (Free and Easy Wanderer)${NC}"
drush content:create node formula --title="Xiao Yao San (Free and Easy Wanderer)" --body="$(cat <<'BODY'
Xiao Yao San, known as Free and Easy Wanderer or Rambling Powder, is perhaps the most famous formula for treating Liver Qi stagnation with underlying Blood and Spleen deficiency. It is widely used for stress-related conditions and emotional imbalances.

The formula addresses the classic pattern where emotional stress causes the Liver Qi to stagnate, which then affects the Spleen's function. Chai Hu and Bo He spread Liver Qi, while Dang Gui and Bai Shao nourish the Blood. Bai Zhu and Fu Ling strengthen the Spleen, and Gan Cao harmonizes.

Primary Indications: Liver Qi stagnation with symptoms such as irritability, mood swings, chest and hypochondriac distention, irregular menstruation, and digestive complaints that worsen with stress.
BODY
)" 2>/dev/null || echo "  Formula may already exist or error occurred"

# Formula 4: Triphala
echo -e "${BLUE}Creating: Triphala${NC}"
drush content:create node formula --title="Triphala" --body="$(cat <<'BODY'
Triphala, meaning "three fruits" in Sanskrit, is one of the most revered formulas in Ayurvedic medicine. This balanced combination of three fruits has been used for thousands of years as a gentle yet effective digestive and rejuvenating tonic.

The three fruits are: Amalaki (Emblica officinalis), which is high in vitamin C and nourishes all tissues; Bibhitaki (Terminalia bellirica), which is particularly beneficial for the respiratory system; and Haritaki (Terminalia chebula), known as the "king of medicines" in Tibet.

Together, these three fruits are considered tridoshic, meaning they help balance all three doshas (Vata, Pitta, and Kapha). Triphala is traditionally used to support healthy digestion, regular elimination, and overall rejuvenation.
BODY
)" 2>/dev/null || echo "  Formula may already exist or error occurred"

echo ""
echo "=============================================="
echo "Clearing Drupal Caches"
echo "=============================================="
drush cr

echo ""
echo -e "${GREEN}=============================================="
echo "Sample Content Creation Complete!"
echo "==============================================${NC}"
echo ""
echo "Created sample content:"
echo "  - 10 Herbs (Astragalus, Ginkgo, Ashwagandha, Turmeric, Elderberry,"
echo "             Reishi, Echinacea, Valerian, Milk Thistle, Chamomile)"
echo "  - 6 Modalities (TCM, Ayurveda, Acupuncture, Naturopathy,"
echo "                  Western Herbalism, Homeopathy)"
echo "  - 6 Conditions (Insomnia, Anxiety, Digestive Disorders,"
echo "                  Chronic Stress, Immune Weakness, Joint Pain)"
echo "  - 4 Practitioners (Dr. Chen, Dr. Torres, Dr. Sharma, Lisa Martinez)"
echo "  - 4 Formulas (Si Jun Zi Tang, Liu Wei Di Huang Wan,"
echo "                Xiao Yao San, Triphala)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review content in Drupal admin: /admin/content"
echo "  2. Add entity references to link content together"
echo "  3. Add taxonomy terms to content"
echo "  4. Upload images for herbs and practitioners"
echo "  5. Test JSON:API endpoints"
echo ""

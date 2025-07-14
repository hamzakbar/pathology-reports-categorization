import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fetch from "node-fetch";
import FormData from "form-data";

const openai = new OpenAI();


const guidanceMarkdown = `
BL-2
NCCN Guidelines Version 1.2025
Non–Muscle-Invasive Bladder Cancer (NMIBC)

Risk Stratification of NMIBC
Initial TURBT shows NMIBC
├── Visually complete resection
│   ├── Low-grade NMIBC ───────────────────────────────► Management per NMIBC Risk Group (BL-3)
│   └── High-grade NMIBC
│       ├── Carcinoma in situ (CIS) or Ta[^j] ────────► Management per NMIBC Risk Group (BL-3)
│       └── T1 or consider for select Ta[^j] ─────────► Repeat TURBT[^k]
│           ├── Residual NMIBC or no residual cancer ─► Management per NMIBC Risk Group (BL-3)
│           └── MIBC ─────────────────────────────────► BL-1
└── Visually incomplete resection **or** High-volume tumour[^i]
    └── Repeat TURBT[^k]
        ├── Residual NMIBC or no residual cancer ─────► Management per NMIBC Risk Group (BL-3)
        └── MIBC ─────────────────────────────────────► BL-1


AUA Risk Stratification for Non–Muscle-Invasive Bladder Cancer*
Low Risk
Intermediate Risk
High Risk
• Papillary urothelial neoplasm of low malignant potential • Low-grade urothelial carcinoma and ▸ Ta and ▸ ≤ 3 cm and ▸ Solitary
• Low-grade urothelial carcinoma and ▸ T1 or ▸ > 3 cm or ▸ Multifocal or ▸ Recurrence ≤ 1 year• High-grade urothelial carcinoma and ▸ Ta and ▸ ≤ 3 cm and ▸ Solitary
• High-grade urothelial carcinoma and ▸ CIS or ▸ T1 or ▸ > 3 cm or ▸ Multifocal• Very high-risk features (any): ▸ BCG-unresponsive1 ▸ Certain histopathologic subtypes2 ▸ Lymphovascular invasion ▸ Prostatic urethral invasion


*Adapted with permission from Chang SS, Boorjian SA, Chou R, et al. Diagnosis and treatment of non-muscle invasive bladder cancer: AUA/SUO guideline. J Urol 2016;196:1021-1029.
 Within each of these risk strata an individual patient may have more or fewer concerning features that can influence care.

Footnotes

Note: All recommendations are category 2A unless otherwise indicated.
Footnotes
Kamat AM, et al. J Clin Oncol 2016;34:1935-1944. ↩


See aggressive subtype histologies listed in Bladder Cancer: Non-Urothelial and Urothelial with Subtype Histology (BL-D). ↩


—----------------------------------------------------------------------------------------------------------------------------

BL-3
NCCN Guidelines Version 1.2025
Management per NMIBC Risk Group (BL-3)

AUA RISK GROUP (link from BL-2)          INITIAL MANAGEMENT                                   FOLLOW-UP
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
LOW  ──────────────────────────────────►  Surveillance°  ───────────────────────────────────► • Cytology positive
                                                                                           │   • Imaging negative
                                                                                           │   • Cystoscopy negative
                                                                                           │                └──► **BL-4**
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
INTERMEDIATE  ─────────────────────────►  Intravesical therapyᵖ,ᑫ (preferred)
                                          or Surveillance  ────────────────────────────────►  **Follow-up (BL-E)**
                                                                                             If prior BCG, maintenance BCGᵖ (preferred)
                                                                                             ├─ Cystoscopy negative → continue routine FU
                                                                                             └─ Cystoscopy positive → **Reclassify AUA Risk Group and manage accordingly**
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
HIGH
  ├─ **BCG-naïve**
  │     ├─ *Very-high-risk features*ⁿ ──►  Cystectomy (preferred)  or  BCGᵖ  ──┐
  │     └─ *No very-high-risk features* ─►  BCGᵖ (category 1, preferred)        │
  │                                        or Cystectomy  ──────────────────────┘──────────►  **Follow-up (BL-E)** (as above)
  │
  └─ **BCG-unresponsive / BCG-intolerant** ─►
        • Cystectomyʳ (preferred)
        • Intravesical chemotherapyᵖ
        • Pembrolizumab (select patients)ˢ
        • Nadofaragene firadenovec-vncg (select patients)ᵗ
        • Nogapendekin alfa inbakicept-pmln + BCGᵘ (select patients) ─────────►  **Follow-up (BL-E)** (as above)


Footnotes
° Should consider single peri-operative instillation of intravesical chemotherapy at time of TURBT.
 ⁿ Very-high-risk features: lymphovascular invasion, prostatic urethral involvement of tumour, subtype histology (e.g., micropapillary, plasmacytoid, sarcomatoid).
 ᵖ See Principles of Instillation Therapy (BL-F).
 ᑫ Options for intravesical therapy for intermediate-risk disease include BCG and chemotherapy; BCG availability should inform decision-making.
 ʳ If not a cystectomy candidate and recurrence is high-grade cTa or cT1, consider concurrent chemoradiotherapy (category 2B for cTa, category 2A for cT1) or a clinical trial. See Principles of Systemic Therapy (BL-G 5 of 7).
 ˢ Pembrolizumab may be considered for BCG-unresponsive, high-risk NMIBC with CIS (with or without papillary) tumours (category 2A) or with high-grade papillary Ta/T1 only tumours without CIS (category 2B) in patients ineligible for or declining cystectomy.
 ᵗ Nadofaragene firadenovec-vncg may be considered for BCG-unresponsive, high-risk NMIBC with CIS (with or without papillary) (category 2A) or with high-grade papillary Ta/T1 only tumours without CIS (category 2B).
 ᵘ Nogapendekin alfa inbakicept-pmln in combination with BCG may be considered for BCG-unresponsive, high-risk NMIBC with CIS (with or without papillary) tumours.
Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------



ST-3

NCCN Guidelines Version 1.2025
Bladder Cancer

Table 5. American Joint Committee on Cancer (AJCC)
TNM Staging System for Urethral Carcinoma (8th ed., 2017)
Male Penile Urethra and Female Urethra – Primary Tumor (T)
Code
Definition
TX
Primary tumor cannot be assessed
T0
No evidence of primary tumor
Ta
Non-invasive papillary carcinoma
CIS (Tis)
Carcinoma in situ
T1
Tumor invades subepithelial connective tissue
T2
Tumor invades any of the following: corpus spongiosum, periurethral muscle
T3
Tumor invades any of the following: corpus cavernosum, anterior vagina
T4
Tumor invades other adjacent organs (e.g., invasion of the bladder wall)

Prostatic Urethra – Primary Tumor (T)
Code
Definition
TX
Primary tumor cannot be assessed
T0
No evidence of primary tumor
Ta
Non-invasive papillary carcinoma
CIS (Tis)
Carcinoma in situ involving the prostatic urethra or periurethral or prostatic ducts without stromal invasion
T1
Tumor invades urethral subepithelial connective tissue immediately underlying the urothelium
T2
Tumor invades the prostatic stroma surrounding ducts either by direct extension from the urothelial surface or by invasion from prostatic ducts
T3
Tumor invades the periprostatic fat
T4
Tumor invades other adjacent organs (e.g., extraprostatic invasion of the bladder wall, rectal wall)

Regional Lymph Nodes (N)
Code
Definition
NX
Regional lymph nodes cannot be assessed
N0
No regional lymph-node metastasis
N1
Single regional lymph-node metastasis in the inguinal region or true pelvis (perivesical, obturator, internal [hypogastric] or external iliac) or presacral lymph node
N2
Multiple regional lymph-node metastases in the inguinal region or true pelvis (perivesical, obturator, internal [hypogastric] and external iliac) or presacral lymph node

Distant Metastasis (M)
Code
Definition
M0
No distant metastasis
M1
Distant metastasis

Histologic Grade (G)
Grade is reported by the grade value.
Urothelial histology:


LG – Low grade


HG – High grade


Squamous cell carcinoma / Adenocarcinoma:


Code
Definition
GX
Grade cannot be assessed
G1
Well differentiated
G2
Moderately differentiated
G3
Poorly differentiated


Table 6. AJCC Prognostic Groups
Stage
T
N
M
0is
CIS (Tis)
N0
M0
0a
Ta
N0
M0
I
T1
N0
M0
II
T2
N0
M0
III
T3
N0
M0


T2
N1
M0


T3
N1
M0
IV
T4
N0
M0


T4
N1
M0


Any T
N2
M0


Any T
Any N
M1


Used with permission of the American College of Surgeons, Chicago, Illinois.
 The original source for this information is the AJCC Cancer Staging Manual, Eighth Edition (2017), published by Springer International Publishing.
Version 1.2025, ©2025 National Comprehensive Cancer Network® (NCCN). This illustration may not be reproduced in any form without the express written permission of NCCN.
—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Management of Positive Urine Cytology (BL-4)

RECURRENT OR PERSISTENT
DISEASE FOLLOW-UP RESULTS
• Cytology positive
• Imaging negative
• Cystoscopy negative
              │
              ▼
        EVALUATION
        Consider:
        ▸ Repeat cytology within 3 months
        ▸ Selected mapping biopsies, including
          transurethral biopsy of prostateᵈ
        ▸ Cytology of upper tract
        ▸ Ureteroscopy
        ▸ Enhanced cystoscopyᵛ (if available)
        ▸ Non-urinary tract source (eg, vagina,
          cervix, rectum) and referral to
          gynecology or other specialist, as
          appropriate
              │
              ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ **Bladder, prostate, and upper-tract negative**              │
 │        └──► Follow-up at 3 mo, then at longer intervalsʷ     │
 │             • If prior BCG, maintenance BCGᵖ (optional)      │
 └──────────────────────────────────────────────────────────────┘
              │
              ├──► **Bladder positive**  ─► Reclassify AUA Risk
              │                            Group & manage (BL-3)
              │
              ├──► **Prostate positive** ─► Urothelial Carcinoma
              │                            of the Prostate (UCP-1)
              │
              └──► **Upper-tract positive** ─► Upper GU Tract
                                           Tumors (UTT-1)


Footnotes
ᵈ See Principles of Surgical Management (BL-B).
 ᵖ See Principles of Instillation Therapy (BL-F).
 ᵛ If enhanced cystoscopy is not readily available, proceed to cystoscopy with bladder biopsies with or without ureteroscopy.
 ʷ See Follow-up (BL-E).
Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Muscle-Invasive Bladder Cancer — Clinical Stage II (cT2 N0) (BL-5)

CLINICAL STAGINGᵍ               ADDITIONAL WORKUPᶜ
Stage II (cT2 N0) ───────────►  • Abdomen/pelvis CT or MRIˣ (if not previously done)
                                • Chest imaging (CT chest)
                                • Bone scan or MRIˣ if clinical
                                  suspicion or symptoms of bone mets
                                • Estimate GFR to assess cisplatin
                                  eligibilityʸ
                                │
                                ▼
──────────────────────────────────────────────────────────────────────────────
PRIMARY TREATMENT
    1. Neoadjuvant cisplatin-based combination chemotherapyᶻ *or*
       perioperative/sandwich immunotherapy + neoadjuvant
       cisplatin-based chemotherapyᶻ → **Radical cystectomy**ᵈ (cat 1)
    ── or ──
    2. Same systemic therapyᶻ as above → **Partial cystectomy**ᵈ
       (high-risk solitary lesion, suitable location, *no* CIS)
    ── or ──
    3. **Cystectomy alone** for cisplatin-ineligible pts
    ── or ──
    4. **Bladder preservation** with concurrent
       chemoradiotherapyᵃᵃ,ᵇᵇ,ᶜᶜ (cat 1) **and** maximal TURBT
    ── or ──
    5. If not a candidate for cystectomy/definitive CRT →
       **Definitive RT**ᵇᵇ
                                │
                                ▼
                ┌──────────────────────────────────┐
                │  Reassess tumour status 2–3 moᵇᵇ │
                └──────────────┬───────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │                                             │
     **Tumour**                                   **No tumour**
        │                                             │
        ▼                                             ▼
SUBSEQUENT TREATMENT                          SUBSEQUENT TREATMENT
  • If CIS, Ta, or T1 → TURBT ±                • **Surveillance**
    intravesical therapyᵖ                      • Systemic therapyᵈᵈ *or* RT
  • If persistent T2 → consider                  alone (if no prior RT)ᵇᵇ
    cystectomy or partial cystectomyᵈ          • TURBT ± intravesical
    (highly selected)                            therapyᵖ
  • *OR* Treat as metastatic disease           • Best supportive care
    → **BL-10**                                  (See NCCN Guidelines for
  ────────────────────────► Follow-up (BL-E)      Palliative Care)
                                │
                                ▼
                            Follow-up (BL-E)

──────────────────────────────────────────────────────────────────────────────
Separately, any patient who receives neoadjuvant therapy and radical
(or partial) cystectomy should proceed to **Adjuvant Treatment (BL-6)**.


Footnotes
ˣ CT or MRI selection based on local resources and patient factors.
 ʸ Glomerular filtration rate (GFR) determines cisplatin eligibility.
 ᶻ See Principles of Combination Chemotherapy for regimen details.
 ᵈ Surgical details and selection criteria are in the Footnotes on BL-6.
 ᵃᵃ, ᵇᵇ, ᶜᶜ Concurrent chemoradiotherapy protocols are described in Principles of Bladder Preservation with Chemoradiotherapy. Superscript ᵇᵇ also denotes “reassess 2–3 months after treatment completion.”
 ᵖ See Principles of Instillation Therapy (BL-F).
 ᵈᵈ Systemic therapy options are outlined in Principles of Systemic Therapy (BL-G).
 ᵍ Clinical staging definitions appear in Table 6 of this guideline.
 ᶜ Additional-workup footnotes (imaging, renal function, etc.) are expanded on BL-6.
For full explanations of all superscripts (d, x, y, z, aa, bb, cc, dd, p) see “Footnotes on BL-6.”

Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Muscle-Invasive Bladder Cancer — Adjuvant Treatment (BL-6)

Following
cystectomy  ─────────────────────────────────────────────────────────────────►
    • If gemcitabine + cisplatin + durvalumab were given pre-operatively,
      durvalumab should be continued post-operatively.

    • Based on pathologic risk:
      ▸ If NO cisplatin neoadjuvant therapy was given and pathology is
        pT3, pT4a, or pN+:
          ◊ Discuss adjuvant cisplatin-based chemotherapy (preferred)ᶻ
          ◊ OR consider adjuvant nivolumabᵇᵉ or pembrolizumabᶻ,ᵉᵉ

      ▸ If cisplatin neoadjuvant chemotherapy WAS given and pathology is
        ypT2–ypT4a or ypN+:
          ◊ Consider nivolumabᵇᵉ or pembrolizumabᶻ,ᵉᵉ

      ▸ Consider adjuvant RT in selected patients
        (pT3-4, positive nodes/margins at surgery)ᵇᵇ (category 2B)

                                      │
                                      └──► **Follow-up (BL-E)**


Footnotes
ᶜ Principles of Imaging for Bladder/Urothelial Cancer (BL-A).
 ᵈ Principles of Surgical Management (BL-B).
 ʰ The modifier “c” refers to clinical staging (bimanual EUA, TUR/biopsy, imaging).
 The modifier “p” refers to pathologic staging based on cystectomy & node dissection.
 ᴾ Principles of Instillation Therapy (BL-F).
 ˣ Consider FDG-PET/CT scan (skull-base → mid-thigh) (category 2B).
 ʸ For borderline GFR, timed urine collection may better assess cisplatin eligibility.
 ᶻ Principles of Systemic Therapy (BL-G 1 of 7).
 ᵃᵃ Principles of Systemic Therapy (BL-G 5 of 7).
 ᵇᵇ Principles of Radiation Management of Invasive Disease (BL-H).
 ᶜᶜ Optimal candidates for bladder-preservation chemoradiotherapy lack moderate/
 severe hydronephrosis, extensive / multifocal CIS, are < 6 cm, and allow a
 visually complete or maximally debulking TURBT. See BL-H.
 ᵈᵈ Principles of Systemic Therapy (BL-G 2 of 7).
 ᵉᵉ Appropriate for patients who value delaying recurrence despite no proven
 survival benefit and who accept the risk of side-effects.

Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------


NCCN Guidelines Version 1.2025
Muscle-Invasive Bladder Cancer — Clinical Stage IIIA (BL-7)
cT3 N0 · cT4a N0 · cT1 – cT4a N1

CLINICAL STAGINGʰ                ADDITIONAL WORKUPᶜ
Stage IIIA ───────────────────►  • Abdomen / pelvis CT or MRIˣ (if not previously done)
(cT3 N0;                           • Chest imaging (CT chest)
 cT4a N0;                          • Bone scan or MRIˣ if clinical suspicion or symptoms of bone mets
 cT1–cT4a N1)                      • Estimate GFR to assess cisplatin eligibilityʸ
                                   │
                                   ▼
──────────────────────────────────────────────────────────────────────────────────────────
PRIMARY TREATMENT
 1  Neoadjuvant cisplatin-based combination chemotherapyᶻ *or*
    perioperative / sandwich immunotherapy + neoadjuvant
    cisplatin-based combination chemotherapyᶻ → **Radical cystectomy**ᵈ,ᶠᶠ  (category 1)

 ── or ──

 2  Same systemic therapyᶻ as above → **Partial cystectomy**ᵈ
    (high-risk solitary lesion, suitable location, *no* CIS)

 ── or ──

 3  **Cystectomy alone** for patients not eligible to receive cisplatin-based chemotherapyᶠᶠ

 ── or ──

 4  **Bladder preservation** with concurrent chemoradiotherapyᵃᵃ,ᵇᵇ,ᶜᶜ  (category 1) **and** maximal TURBT

 ── or ──

 5  If the patient is **not a candidate** for cystectomy or definitive chemoradiotherapy →
    **RT**ᵇᵇ
                                   │
                                   ▼
                     ┌──────────────────────────────────────┐
                     │ Reassess tumour status 2 – 3 moᵇᵇ    │
                     └──────────────┬───────────────────────┘
                                    │
        ┌───────────────────────────┴─────────────────────────┐
        │                                                     │
     **Tumour**                                           **No tumour**
        │                                                     │
        ▼                                                     ▼
SUBSEQUENT TREATMENT                                   SUBSEQUENT TREATMENT
 • If CIS, Ta, or T1 → TURBT ± intravesical therapyᴾ   • **Surveillance**
 • If persistent T2 → consider surgical re-resection     • Systemic therapyᵈᵈ *or* RT
   (cystectomy or partial cystectomy in highly             alone (if no prior RT)ᵇᵇ
   selected cases)ᵈ                                     • TURBT ± intravesical therapyᴾ
 • *or* Treat as metastatic disease → **BL-10**           • Best supportive care (NCCN
                                                            Guidelines for Palliative Care)
                                   │
                                   ▼
                           **Follow-up (BL-E)**

──────────────────────────────────────────────────────────────────────────────────────────
Patients who receive neoadjuvant therapy and radical / partial cystectomy should
proceed to **Adjuvant Treatment (BL-6)**.


Footnotes
ᶜ Principles of Imaging for Bladder/Urothelial Cancer (BL-A).
 ᵈ Principles of Surgical Management (BL-B).
 ʰ The modifier “c” = clinical staging (bimanual EUA, endoscopic biopsy/TUR, imaging);
 “p” = pathologic staging (post-cystectomy & lymph-node dissection).
 ᴾ Principles of Instillation Therapy (BL-F).
 ˣ Consider FDG-PET/CT scan (skull-base → mid-thigh) (category 2B).
 ʸ For borderline GFR, use timed urine collection to better judge cisplatin eligibility.
 ᶻ Principles of Systemic Therapy (BL-G 1 of 7).
 ᵃᵃ Principles of Systemic Therapy (BL-G 5 of 7).
 ᵇᵇ Principles of Radiation Management of Invasive Disease (BL-H).
 ᶜᶜ Optimal bladder-preservation CRT candidates lack moderate/severe hydronephrosis,
 extensive or multifocal CIS, are < 6 cm, and allow visually complete or maximally
 debulking TURBT. See BL-H.
 ᵈᵈ Principles of Systemic Therapy (BL-G 2 of 7).
 ᶠᶠ Patients with cN1 disease have better outcomes when given neoadjuvant chemotherapy
 and demonstrate a response.
 See Recurrent or Persistent Disease (BL-11) for management of disease detected on follow-up.

Note: All recommendations are category 2A unless otherwise indicated.

—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Muscle-Invasive Bladder Cancer — Clinical Stage IIIB (BL-8)
cT1 – cT4a N2, N3

CLINICAL STAGINGʰ                ADDITIONAL WORKUPᶜ
Stage IIIB ───────────────────►  • Abdomen/pelvis CT or MRIˣ (if not previously done)
(cT1–cT4a, N2,3)                  • Chest imaging (CT chest)
                                   • Bone scan or MRIˣ if clinical suspicion / symptoms
                                     of bone metastases
                                   • Consider molecular / genomic testing⁹⁹
                                   • Estimate GFR to assess cisplatin eligibilityʸ
                                   │
                                   ▼
──────────────────────────────────────────────────────────────────────────────────────────
PRIMARY TREATMENT
   ▸ **Down-staging systemic therapy**ᵈᵈ
                     │
                     ▼
        ┌──────────────────────────────────────┐
        │ Reassess tumour status 2 – 3 moʰʰ    │
        └──────────────┬───────────────────────┘
                       │
   ┌───────────────────┼────────────────────────┐
   │                   │                        │
**Complete response**  **Partial response**  **Progression**
   │                   │                        │
   │                   │                        ▼
   │                   │                Treat as metastatic
   │                   │                disease (**BL-10**)
   │                   │
   │                   ├─► **Cystectomy**ᵈ
   │                   │   or **Chemoradiotherapy**ᵃᵃ,ᵇᵇ
   │                   │   or treat recurrence
   │                   │     according to stage
   │                   │
   │                   └────────────────────────►
   │                                         Follow-up (BL-E)
   │
   ├─► **Consolidation cystectomy**ᵈ
   │   or **Consolidation chemoradiotherapy**ᵃᵃ,ᵇᵇ
   │   or **Surveillance**
   │
   └──────────────────────────────────────────► Follow-up (BL-E)

If a previous complete response converts to recurrence, treat according to the stage of recurrent disease (see Recurrent or Persistent Disease — BL-11).

Footnotes
ᶜ Principles of Imaging for Bladder / Urothelial Cancer (BL-A)
 ᵈ Principles of Surgical Management (BL-B)
 ʰ The modifier “c” = clinical stage (bimanual EUA, TUR/biopsy, imaging); “p” = pathologic stage (post-cystectomy ± node dissection).
 ˣ Consider FDG-PET/CT (skull-base → mid-thigh) (category 2B).
 ʸ For borderline GFR, timed urine collection may better determine cisplatin eligibility.
 ᵃᵃ Principles of Systemic Therapy (BL-G 5 of 7).
 ᵇᵇ Principles of Radiation Management of Invasive Disease (BL-H).
 ᵈᵈ Principles of Systemic Therapy (BL-G 2 of 7) — regimens used for down-staging.
 ⁹⁹ See Principles of Alternative Risk Classifiers & Biomarkers (BL-I).
 ʰʰ Imaging with contrast (CT chest/abdomen/pelvis). If no distant disease is seen, further cystoscopic assessment of bladder response may be considered.
 ⁱⁱ In patients with a prior complete response, treat any recurrence according to the stage of recurrent disease.

Note: All recommendations are category 2A unless otherwise indicated.

—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Muscle-Invasive Bladder Cancer — Clinical Stage IVA (BL-9)
Staging definition: cT4b Any N M0 · Any T Any N M1a

CLINICAL STAGINGʰ               ADDITIONAL WORKUPᶜ
Stage IVA ───────────────────►  • Abdomen / pelvis CT or MRIˣ (if not previously done)
(cT4b Any N M0;                  • Chest imaging (CT chest)
 Any T Any N M1a)                • Bone scan or MRIˣ if clinical suspicion / symptoms of bone mets
                                 • Molecular / genomic testing⁹⁹
                                 • Estimate GFR to assess cisplatin eligibilityʸ
                                 │
                                 ▼
────────────────────────────────────────────────────────────────────────────────────────────
PRIMARY TREATMENT
   • **M0 disease**  ─►  Systemic therapyᵈᵈ
   • **M0 disease**  ─►  Concurrent chemoradiotherapyᵃᵃ,ᵇᵇ
   • **M1a disease** ─►  Systemic therapyᵈᵈ

   ┌───────────────────────────────────────────────────────────────┐
   │ After 2 – 3 cycles (or completion of CRT), reassess with:     │
   │   – Cystoscopy, EUA, TURBT                                    │
   │   – Imaging of abdomen / pelvisᶜ                              │
   └──────────────┬────────────────────────────────────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
   **No tumour**        **Tumour present**
       │                     │
       │                     ├─► Systemic therapyᵈ,ᵏ *or*
       │                     │    Chemoradiotherapyᵃᵃ,ᵇᵇ (if no prior RT)
       │                     │    ± Cystectomyᵈ
       │                     │
       │                     └─► Reassess tumour status 2 – 3 moᵇᵇ
       │                               │
       │                               ├─► **Complete / partial response**
       │                               │      • Consider consolidative local therapy in
       │                               │        selected casesᵃᵃ,ᵇᵇ
       │                               │      • Follow-up (BL-E)
       │                               │
       │                               └─► **Stable disease / progression**
       │                                      • Treat as metastatic disease (BL-10)
       │
       ├─► **Consolidation options**
       │      • Consolidation systemic therapyᵈ
       │      • Chemoradiotherapyᵃᵃ,ᵇᵇ (if no previous RT)
       │      • ± Cystectomyᵈ
       │      • Surveillance
       │
       └──────────────────────────────► **Follow-up (BL-E)**


Footnotes
ᶜ Principles of Imaging for Bladder/Urothelial Cancer (BL-A).
 ᵈ Principles of Surgical Management (BL-B).
 ʰ The modifier “c” = clinical staging (bimanual EUA, biopsy/TUR, imaging).
 The modifier “p” = pathologic staging (post-cystectomy & node dissection).
 ˣ Consider FDG-PET/CT (skull base → mid-thigh) (category 2B).
 ʸ For borderline GFR, use timed urine collection to better assess cisplatin eligibility.
 ᵃᵃ Principles of Systemic Therapy (BL-G 2 of 7).
 ᵇᵇ Principles of Radiation Management of Invasive Disease (BL-H).
 ᵈᵈ Principles of Systemic Therapy (BL-G 5 of 7).
 ᵏ See Principles of Systemic Therapy (BL-G 3 of 7 and 4 of 7) for non-bulky disease and no significant clinical progression.
 ⁹⁹ See Principles of Alternative Risk Classifiers & Biomarkers (BL-I).
 ᵇᵇ Imaging reassessment is CT of chest/abdomen/pelvis with contrast; if no distant disease is found, further cystoscopic evaluation may be considered.
 ⁱⁱ After a previous complete response, manage any recurrence according to stage of recurrent disease (see Recurrent or Persistent Disease – BL-11).

Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Muscle-Invasive Bladder Cancer — Metastatic Disease (BL-10)
Stage IVB: Any T · Any N · M1b

CLINICAL STAGINGʰ              ADDITIONAL WORKUPᶜ
Metastatic (IVB) ───────────►  • Bone scan or MRI if clinical suspicion
(Any T, Any N, M1b)             or symptoms of bone metastases
                               • Chest CT
                               • Consider CNS imagingᶜ
                               • Estimate GFR to assess eligibility
                                 for cisplatinʸ
                               • Consider biopsy if technically feasible
                               • Molecular / genomic testing⁹⁹
                               │
                               ▼
──────────────────────────────────────────────────────────────────────────────
PRIMARY TREATMENT
   • **Systemic therapy**ᵈᵈ,ᵏᵏ
   • **and / or** **Palliative RT**ᵇᵇ
                               │
                               ▼
                       **Follow-up (BL-E)**


Footnotes
ᶜ Principles of Imaging for Bladder/Urothelial Cancer (BL-A)
 ʰ The modifier “c” = clinical staging (bimanual EUA, TUR/biopsy, imaging);
 “p” = pathologic staging (post-cystectomy & lymph-node dissection).
 ʸ For patients with borderline GFR, timed urine collection may more accurately determine cisplatin eligibility.
 ᵇᵇ Principles of Radiation Management of Invasive Disease (BL-H)
 ᵈᵈ Principles of Systemic Therapy (BL-G 2 of 7)
 ᵏᵏ See Principles of Systemic Therapy (BL-G 3 of 7 and 4 of 7)
 ⁹⁹ Principles of Alternative Risk Classifiers & Biomarkers (BL-I)

Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Muscle-Invasive Bladder Cancer — Recurrent / Persistent Disease (BL-11)

FOLLOW-UPᶜ
Muscle-invasive or selected metastatic disease
treated with curative intent
          └──►  Follow-up (BL-E)
                     │
                     ▼
─────────────────────────────────────────────────────────────────────────────
RECURRENT OR PERSISTENT DISEASE
  ├─ Local recurrence / persistent disease; preserved bladder
  │      ├─► **Muscle invasive** ─────────►  see Treatment box ▲
  │      └─► **CIS, Ta, or T1** ──────────►  see Treatment box ▼
  │
  ├─ Preserved bladder
  │      • Cytology positive
  │      • Imaging negative
  │      • Cystoscopy negative
  │      └──► **BL-4**
  │
  └─ Metastatic or local recurrence post-cystectomy
         └──► **BL-10**
─────────────────────────────────────────────────────────────────────────────
TREATMENT OF RECURRENT / PERSISTENT DISEASE
▲ *For muscle-invasive local recurrence*
   • **Cystectomy**ᵈ,ʷ
   • **Chemoradiotherapy** (if no prior RT)ᵃᵃ,ᵇᵇ
   • **Systemic therapy**ᵈᵈ,ᵏᵏ
   • **Palliative TURBT** + best supportive care
     (see *NCCN Guidelines for Palliative Care*)

▼ *For CIS, Ta, or T1 recurrence*
   • Consider **intravesical therapy**ᴾ
   • **Cystectomy**ᵈ,ʷ
   • **TURBT**
        ↓ No response
        → **Cystectomy**ᵈ,ʷ,ˡˡ


Footnotes
ᶜ Principles of Imaging for Bladder/Urothelial Cancer (BL-A)
 ᵈ Principles of Surgical Management (BL-B)
 ᴾ Principles of Instillation Therapy (BL-F)
 ʷ Follow-up (BL-E)
 ᵃᵃ Principles of Systemic Therapy (BL-G 5 of 7)
 ᵇᵇ Principles of Radiation Management of Invasive Disease (BL-H)
 ᵈᵈ Principles of Systemic Therapy (BL-G 2 of 7)
 ᵏᵏ See Principles of Systemic Therapy (BL-G 3 of 7 and 4 of 7)
 ˡˡ If not a cystectomy candidate, consider concurrent chemoradiotherapy (BL-G 5 of 7)
 (if no prior RT), change in intravesical agent, or clinical-trial participation.
Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Bladder Cancer — FOLLOW-UP (BL-E 1 of 6)
No single follow-up plan fits every patient.
 These tables give general guidance and should be tailored to:
 – Site & biology of disease · – Duration of therapy · – New or worsening signs/symptoms.
 Re-imaging or cystoscopy may be needed sooner than scheduled if concern for progression arises. Further research is still needed to define the optimal length of follow-up.

Table 1. AUA Risk Stratification for Non–Muscle-Invasive Bladder Cancer*
Low Risk
Intermediate Risk
High Risk
• Papillary urothelial neoplasm of low malignant potential • Low-grade urothelial carcinoma and ▸ Ta and ≤ 3 cm and Solitary
• Low-grade urothelial carcinoma and ▸ T1 or > 3 cm or Multifocal or Recurrence ≤ 1 year• High-grade urothelial carcinoma and ▸ Ta and ≤ 3 cm and Solitary
• High-grade urothelial carcinoma and ▸ CIS or T1 or > 3 cm or Multifocal• Very-high-risk features (any): ▸ BCG-unresponsiveᵃ · Certain histopathologic subtypesᵇ · Lymphovascular invasion · Prostatic urethral invasion


Table 2. Low-Risk,c Non–Muscle-Invasive Bladder Cancer — Recommended Tests & Timing
Test
Year 1
Year 2
Year 3
Year 4
Year 5
Years 5 – 10
> 10 yrs
Cystoscopy
3 & 12 mo




Annually


colspan=2:As clinically indicated


Upper-tract & abdomen/pelvis imagingᵈ
Baseline imaging




colspan=4:As clinically indicated






Blood tests
colspan=7: N/A












Urine tests
colspan=7: N/A














Where to go next
Intermediate-Risk NMIBC → BL-E 2 of 6


High-Risk NMIBC → BL-E 2 of 6


Post-Cystectomy NMIBC → BL-E 3 of 6


Post-Cystectomy MIBC → BL-E 4 of 6


Post-Bladder-Sparing Surveillance → BL-E 5 of 6


Metastatic Disease: Surveillance → BL-E 6 of 6


Recurrent / Persistent Disease → BL-11


See also NCCN Guidelines for Survivorship



Footnotes
ᵃ Kamat AM, et al. J Clin Oncol 2016;34:1935-1944.
 ᵇ See aggressive subtype histologies in Bladder Cancer: Non-Urothelial and Urothelial with Subtype Histology (BL-D).
 ᶜ For AUA risk-strata definitions see BL-2.
 ᵈ Principles of Imaging for Bladder/Urothelial Cancer (BL-A).
Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------


NCCN Guidelines Version 1.2025
Bladder Cancer — FOLLOW-UP (BL-E 2 of 6)
Further follow-up tables (Tables 3 & 4) add guidance for intermediate- and high-risk non–muscle-invasive bladder cancer (NMIBC). Modify the schedule for individual patients based on site and biology of disease, prior therapies, and any new/worsening signs or symptoms.

Table 3. Intermediate-Risk,c Non–Muscle-Invasive Bladder Cancer
Test
Year 1
Year 2
Year 3
Year 4
Year 5
Years 5 – 10
> 10 yrs
Cystoscopy
3, 6, 12 mo
Every 6 mo
—
Annually
—
colspan=2: As clinically indicated


Upper-tract ± abdomen/pelvis imagingᵈ
Baseline imaging
—
—
colspan=4: As clinically indicated






Blood tests
colspan=7: N/A












Urine tests
Urine cytology at 3, 6, 12 mo
Urine cytology every 6 mo
—
Annually
—
colspan=2: As clinically indicated




Table 4. High-Risk,c Non–Muscle-Invasive Bladder Cancer
Test
Year 1
Year 2
Year 3
Year 4
Year 5
Years 5 – 10
> 10 yrs
Cystoscopy
Every 3 mo
—
—
Every 6 mo
Annually
Annually
As clinically indicated
Upper-tract imagingᵈ
Baseline + at 12 mo
—
—
Every 1 – 2 y
—
colspan=2: As clinically indicated


Abdomen/pelvis imagingᵈ
Baseline imaging
—
—
colspan=4: As clinically indicated






Blood tests
colspan=7: N/A












Urine tests
• Urine cytology every 3 mo • Consider urinary urothelial-tumor markers (category 2B)
—
Urine cytology every 6 mo
—
Annually
colspan=2: As clinically indicated




Footnotes
ᶜ See AUA Risk Stratification for Non-Muscle-Invasive Bladder Cancer definitions on BL-2.
 ᵈ Principles of Imaging for Bladder / Urothelial Cancer (BL-A).
Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Bladder Cancer — FOLLOW-UP (BL-E 3 of 6)
Table 5. Post-Cystectomy Non-Muscle-Invasive Bladder Cancer
Test
Year 1
Year 2
Year 3
Year 4
Year 5
Years 5 – 10
> 10 yrs
Cystoscopy
colspan=7:N/A












Imagingᵈ
• CTU or MRU (upper tracts plus axial abdomen/pelvis) at 3 & 12 mo
—
colspan=2:**CTU or MRU (same protocol) – **annually


Renal ultrasoundᵉ annually
As clinically indicated


Blood tests
• Renal function (electrolytes & creatinine) q 3-6 mo• LFTᶠ q 3-6 mo• CBC, CMP q 3-6 mo if prior chemotherapy
—
colspan=2: • Renal function annually• LFTᶠ annually• B₁₂ annually (clinical judgment)


B₁₂ annually (clinical judgment)
—


Urine tests
• Consider urine cytology q 6-12 mo• Consider urethral-wash cytology q 6-12 moᵍ
colspan=5: Urine cytology as clinically indicated ± urethral-wash cytologyᵍ
—










Where to look next
Post-Cystectomy MIBC → BL-E 4 of 6


Post-Bladder-Sparing Surveillance → BL-E 5 of 6


Recurrent / Persistent Disease → BL-11


See also the NCCN Guidelines for Survivorship



Footnotes
ᵈ Principles of Imaging for Bladder / Urothelial Cancer (BL-A).
 ᵉ Renal ultrasound (US) is recommended to look for hydronephrosis.
 ᶠ LFT = aspartate & alanine aminotransferases (AST, ALT), bilirubin, alkaline phosphatase.
 ᵍ Urethral-wash cytology is reserved for high-risk situations (positive urethral margin, multifocal CIS, prostatic urethral invasion).
Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Bladder Cancer — FOLLOW-UP (BL-E 4 of 6)
Table 6. Post-Cystectomy Muscle-Invasive Bladder Cancer
Test
Year 1
Year 2
Year 3
Year 4
Year 5
Years 5 – 10
> 10 yrs
Cystoscopy
colspan=7: N/A












Imagingᵈ
• CTU or MRU* every 3 – 6 mo• CT chest (preferred) or chest x-ray every 3 – 6 mo• FDG-PET/CT (cat 2B) only if metastatic disease suspected
—
rowspan=2: • Abdomen / pelvis CT or MRI annually• CT chest (preferred) or chest x-ray annually• FDG-PET/CT (cat 2B) only if metastatic disease suspected
—
—
Renal US annuallyᵉ
As clinically indicated
Blood tests
• Renal function (electrolytes, creatinine) q 3 – 6 mo• LFTᶠ q 3 – 6 mo• CBC, CMP q 3 – 6 mo if prior chemo
—
colspan=2: • Renal function annually• LFTᶠ annually• B₁₂ annually (clinical judgment)
—
B₁₂ annually (clinical judgment)
—


Urine tests
• Consider urine cytology q 6 – 12 mo• Consider urethral-wash cytology q 6 – 12 moᵍ
colspan=5: Urine cytology & / or urethral-wash cytology as clinically indicated
—









* CTU = CT urography; MRU = MR urography (upper tracts + axial abdomen/pelvis).

Where to go next
Post-Bladder-Sparing Surveillance → BL-E 5 of 6


Recurrent / Persistent Disease → BL-11


See also the NCCN Guidelines for Survivorship



Footnotes
ᵈ Principles of Imaging for Bladder / Urothelial Cancer (BL-A)
 ᵉ Renal ultrasound is recommended to screen for hydronephrosis.
 ᶠ LFT = AST, ALT, bilirubin, alkaline phosphatase.
 ᵍ Urethral-wash cytology is reserved for patients with high-risk features (positive urethral margin, multifocal CIS, prostatic urethral invasion).
Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Bladder Cancer — FOLLOW-UP (BL-E 5 of 6)
Table 7. Post-Bladder Sparing
*(partial cystectomy or definitive chemoradiation)*ᵸ
Test
Year 1
Year 2
Year 3
Year 4
Year 5
Years 5 – 10
> 10 yrs
Cystoscopy
Every 3 mo
Every 3 mo
Every 6 mo
Every 6 mo
Annually
colspan=1
As clinically indicated
Imagingᵈ
• CTU or MRU (upper tracts + axial abdomen/pelvis) q 3–6 mo for MIBC • CT chest (preferred) or chest x-ray q 3–6 mo • FDG-PET/CT (category 2B) only if metastasis suspected
—
• Abdomen/pelvis CT or MRI annually • CT chest (preferred) or chest x-ray annually • FDG-PET/CT (category 2B) if metastatic disease suspected
—
—
As clinically indicated
—
Blood tests
• Renal function (electrolytes, creatinine) q 3–6 mo • LFTᶠ q 3–6 mo • CBC, CMP q 3–6 mo if prior chemo
—
• Renal function (electrolytes, creatinine) as clinically indicated • LFTᶠ as clinically indicated
—
—
—
—
Urine tests
Urine cytology q 6 – 12 mo
colspan=5: Urine cytology as clinically indicated
—










Footnotes
ᵈ Principles of Imaging for Bladder/Urothelial Cancer (BL-A)
 ᶠ LFT = AST, ALT, bilirubin, alkaline phosphatase.
 ᵸ Patients who are not candidates for aggressive therapy may warrant less-frequent surveillance (e.g., cystoscopy every 6 months, then annually).
 ᶦ PET/CT is not recommended for NMIBC.
Note: All recommendations are category 2A unless otherwise indicated.
—----------------------------------------------------------------------------------------------------------------------------

NCCN Guidelines Version 1.2025
Bladder Cancer — FOLLOW-UP (BL-E 6 of 6)
Table 8. Metastatic Disease: Surveillance
Test
Year 1
Year 2
Year 3
Year 4
Year 5
Years 5 – 10
> 10 yrs
Cystoscopy
colspan=7: As clinically indicated












Imagingᵈ
• CTU or MRU (upper tracts + axial abdomen/pelvis) every 3 – 6 mo if clinically indicated and with any clinical change or new symptoms • CT chest / abdomen / pelvis every 3 – 6 mo with any clinical change or symptoms • FDG-PET/CT (category 2B) — use only if metastatic disease suspected
colspan=6 — Same schedule applies whenever clinically indicated; otherwise none routinely










Blood tests
• CBC, CMP every 1 – 3 mo • B₁₂ annually for cystectomy patients (clinical judgment)
colspan=6 —










Urine tests
colspan=7: Urine cytology as clinically indicated














Footnote
ᵈ Principles of Imaging for Bladder / Urothelial Cancer (BL-A).
Note: All recommendations are category 2A unless otherwise indicated.
`;

function makeReportPrompt(rawReport: string): string {
    return `
You are an oncology decision-support LLM.

Context
-------
- **raw_report**: The raw pathology report text, delimited below.
- **guidance_markdown**: You will be provided with clinical practice guidelines in markdown format in a separate message.

Task
----
1.  Read the **raw_report** to identify key diagnostic details (stage, grade, size, focality, etc.).
2.  Consult the **guidance_markdown** to determine the appropriate risk category and guideline-based recommendations.
3.  Produce a new MARKDOWN report using **exactly** the structure below.
4.  If critical information (like tumor size or grade) is missing from the report, state this in the "Important Notes" and list possible risk categories and their corresponding recommendations.

### Important Content Rules
- **CIS Staging Priority:** The presence of Carcinoma in Situ (CIS) is a dominant factor. If the report mentions *“carcinoma in situ”, “CIS”, “Tis”,* or *“flat high-grade lesion”*, the primary pathological stage in the **Diagnosis** line **must** be labeled as **Tis**. This rule applies even if a papillary component (e.g., Ta) is also mentioned. The co-existence of both components should be noted in the "Pathology Details" section, but the main diagnosis stage must be **Tis**.

### Report Structure

1.  **Diagnosis**
    – Clearly state the diagnosis and include the pathological stage in **bold** parentheses, e.g., (**Tis**).

2.  **Pathology Details**
    – Create a concise bullet-point summary of relevant findings (e.g., "High-grade papillary urothelial carcinoma component present," "Adjacent carcinoma in situ is identified.").

3.  **Risk Category** *or* **Risk Category Possibilities**
    – State the definitive risk category or list possible categories.
    – Explain the rationale based on the guidelines.

4.  **Recommendations**
    – List the guideline-based treatment and follow-up recommendations.

5.  **Important Notes**
    – Mention any caveats or missing information, such as the absence of muscularis propria.

6.  **Conclusion**
    – Provide a brief clinical synthesis of the case.

7.  **Legend**
    – Spell out all acronyms used in the report (e.g., NMIBC, LVI, CIS, BCG).

8.  **References**
    – Cite the guideline section that informed your recommendations (e.g., "High-Risk NMIBC").

### Formatting rules
- Output plain markdown — **no fenced code blocks**.
- Use bullet points and proper headings as specified in the structure.
- Ensure there is a clear gap between each section.

raw_report:
<<<
${rawReport.trim()}
>>>
`.trim();
}

async function askOpenAI(messages: OpenAI.Chat.ChatCompletionMessageParam[]): Promise<string> {
    try {
        const res = await openai.chat.completions.create({
            model: "gpt-4.1",
            temperature: 0.1,
            messages,
        });
        return res.choices?.[0]?.message?.content?.trim() ?? "";
    } catch (error) {
        console.error("Error communicating with OpenAI:", error);

        throw new Error("LLM generation failed");
    }
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    let rawText = "";
    try {
        const pdfBuf = Buffer.from(await file.arrayBuffer());
        const fd = new FormData();
        fd.append("file", pdfBuf, {
            filename: file.name,
            contentType: file.type || "application/pdf",
        });

        const ocrRes = await fetch(`${process.env.API_BASE_URL}/ocr/text`, {
            method: "POST",
            body: fd as any,
            headers: (fd as any).getHeaders(),
        });

        if (!ocrRes.ok) {
            throw new Error(`OCR service responded with status: ${ocrRes.status}`);
        }

        const { success, content } = (await ocrRes.json()) as {
            success: boolean;
            content: string;
        };

        if (!success || !content) {
            throw new Error("OCR service returned failure or empty content");
        }
        rawText = content;
    } catch (e: any) {
        console.error("OCR process failed:", e.message);
        return NextResponse.json({ error: `OCR failed: ${e.message}` }, { status: 500 });
    }

    let markdown: string;
    try {
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: makeReportPrompt(rawText) },
            { role: "assistant", content: guidanceMarkdown },
        ];

        markdown = await askOpenAI(messages);
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message || "LLM generation failed" },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { markdownReport: markdown },
        { status: 200 }
    );
}
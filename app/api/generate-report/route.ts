import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const visionPromises: Promise<{ file: string, output: string }>[] = [];

    for (const [, value] of formData.entries()) {
        if (value instanceof File) {
            visionPromises.push(
                (async () => {
                    const arrayBuffer = await value.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const base64Image = buffer.toString("base64");
                    const mimeType = value.type || "image/png";
                    const response = await openai.chat.completions.create({
                        model: "gpt-4.1",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: "convert this image into text, i want each and every word in the output, just give me transcription, no extra text" },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: `data:${mimeType};base64,${base64Image}`,
                                            detail: "auto",
                                        },
                                    },
                                ],
                            },
                        ],
                    });
                    const outputText = response.choices?.[0]?.message?.content ?? "";
                    return { file: value.name, output: outputText };
                })()
            );
        }
    }

    const visionResults = await Promise.all(visionPromises);

    const visionTextCombined = visionResults.map(
        (res, idx) => `Image ${idx + 1} (${res.file}):\n${res.output}`
    ).join("\n\n");

    const prompt = `
        Based on this AUA risk stratification table, please classify the images that I've added before:

        ### AUA Risk Stratification for NMIBC (with Muscle Invasive Category)

        | Low Risk                              | Intermediate Risk                               | High Risk                                             | Muscle Invasive                 |
        |---------------------------------------|--------------------------------------------------|-------------------------------------------------------|----------------------------------|
        | LG<sup>a</sup> solitary Ta ≤ 3cm      | Recurrence within 1 year, LG Ta                 | HG T1                                                 | T2 or greater (muscle invasive)  |
        | PUNLMP<sup>b</sup>                    | Solitary LG Ta > 3cm                            | Any recurrent, HG Ta                                  |                                |
        |                                       | LG Ta, multifocal                               | HG Ta, >3cm (or multifocal)                           |                                |
        |                                       | HG<sup>c</sup> Ta, ≤ 3cm                        | Any CIS<sup>d</sup>                                   |                                |
        |                                       | LG T1                                           | Any BCG failure in HG patient                         |                                |
        |                                       |                                                  | Any variant histology                                 |                                |
        |                                       |                                                  | Any LVI<sup>e</sup>                                   |                                |
        |                                       |                                                  | Any HG prostatic urethral involvement                 |                                |

        <sup>a</sup> LG = low grade
        <sup>b</sup> PUNLMP = papillary urothelial neoplasm of low malignant potential
        <sup>c</sup> HG = high grade
        <sup>d</sup> CIS = carcinoma in situ
        <sup>e</sup> LVI = lymphovascular invasion

        ---

        ### GUIDELINE STATEMENTS

        #### Diagnosis

        ##### Guideline Statement 1
        **At the time of resection of suspected bladder cancer, a clinician should perform a thorough cystoscopic examination of a patient’s entire urethra and bladder that evaluates and documents tumor size, location, configuration, number, and mucosal abnormalities. _(Clinical Principle)_**

        ##### Guideline Statement 2
        **At initial diagnosis of a patient with bladder cancer, a clinician should perform complete visual resection of the bladder tumor(s), when technically feasible. _(Clinical Principle)_**

        ##### Guideline Statement 3
        **A clinician should perform upper urinary tract imaging as a component of the initial evaluation of a patient with bladder cancer. _(Clinical Principle)_**

        ##### Guideline Statement 4
        **In a patient with a history of NMIBC with normal cystoscopy and positive cytology, a clinician should consider prostatic urethral biopsies and upper tract imaging, as well as enhanced cystoscopic techniques (blue light cystoscopy [BLC], when available), ureteroscopy, or random bladder biopsies. _(Expert Opinion)_**

        ---

        #### Risk Stratification

        ##### Guideline Statement 5
        **At the time of each occurrence/recurrence, a clinician should assign a clinical stage and classify a patient accordingly as “low-,” “intermediate-,” or “high-risk.” _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ---

        #### Variant Histologies

        ##### Guideline Statement 6
        **An experienced genitourinary pathologist should review the pathology of a patient with any doubt in regard to variant or suspected variant histology (e.g., micropapillary, nested, plasmacytoid, neuroendocrine, sarcomatoid), extensive squamous or glandular differentiation, or the presence/absence of lymphovascular invasion (LVI). _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 7
        **If a bladder sparing approach is being considered in a patient with variant histology, then a clinician should perform a restaging transurethral resection of bladder tumor (TURBT) within four to six weeks of the initial TURBT. _(Expert Opinion)_**

        ##### Guideline Statement 8
        **Due to the high rate of upstaging associated with variant histology, a clinician should consider offering initial radical cystectomy. _(Expert Opinion)_**

        ---

        #### Urine Markers after Diagnosis of Bladder Cancer

        ##### Guideline Statement 9
        **In surveillance of NMIBC, a clinician should not use urinary biomarkers in place of cystoscopic evaluation. _(Strong Recommendation; Evidence Strength: Grade B)_**

        ##### Guideline Statement 10
        **In a patient with a history of low-risk cancer and a normal cystoscopy, a clinician should not routinely use a urinary biomarker or cytology during surveillance. _(Expert Opinion)_**

        ##### Guideline Statement 11
        **In a patient with NMIBC, a clinician may use biomarkers to assess response to intravesical BCG (UroVysion® FISH) and adjudicate equivocal cytology (UroVysion® FISH and ImmunoCyt™). _(Expert Opinion)_**

        ---

        #### TURBT/ Repeat Resection: Timing, Technique, Goal, Indication

        ##### Guideline Statement 12
        **In a patient with non-muscle invasive disease who underwent an incomplete initial resection (not all visible tumor treated), a clinician should perform repeat transurethral resection or endoscopic treatment of all remaining tumor if technically feasible. _(Strong Recommendation; Evidence Strength: Grade B)_**

        ##### Guideline Statement 13
        **In a patient with high-risk, high-grade Ta tumors, a clinician should consider performing repeat transurethral resection of the primary tumor site within six weeks of the initial TURBT. _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 14
        **In a patient with T1 disease, a clinician should perform repeat transurethral resection of the primary tumor site to include muscularis propria within six weeks of the initial TURBT. _(Strong Recommendation; Evidence Strength: Grade B)_**

        ---

        #### Intravesical Therapy; BCG/Maintenance; Chemotherapy/BCG Combinations

        ##### Guideline Statement 15
        **In a patient with suspected or known low- or intermediate-risk bladder cancer, a clinician should consider administration of a single postoperative instillation of intravesical chemotherapy (e.g., gemcitabine, mitomycin C) within 24 hours of TURBT. In a patient with a suspected perforation or extensive resection, a clinician should not use postoperative intravesical chemotherapy._(Moderate Recommendation; Evidence Strength: Grade B)_**

        ##### Guideline Statement 16
        **In a low-risk patient, a clinician should not administer induction intravesical therapy. _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 17
        **In an intermediate-risk patient a clinician should consider administration of a six-week course of induction intravesical chemotherapy or immunotherapy. _(Moderate Recommendation; Evidence Strength: Grade B)_**

        ##### Guideline Statement 18
        **In a high-risk patient with newly diagnosed carcinoma _in situ_ (CIS), high-grade T1, or high-risk Ta urothelial carcinoma, a clinician should administer a six-week induction course of BCG. _(Strong Recommendation; Evidence Strength: Grade B)_**

        ##### Guideline Statement 19
        **In an intermediate-risk patient who completely responds to an induction course of intravesical chemotherapy, a clinician may utilize maintenance therapy. _(Conditional Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 20
        **In an intermediate-risk patient who completely responds to induction BCG, a clinician should consider maintenance BCG for one year, as tolerated. _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 21
        **In a high-risk patient who completely responds to induction BCG, a clinician should continue maintenance BCG, based on availability, for three years, as tolerated. _(Moderate Recommendation; Evidence Strength: Grade B)_**

        ---

        #### BCG Relapse and Salvage Regimens

        ##### Guideline Statement 22
        **In an intermediate- or high-risk patient with persistent or recurrent disease or positive cytology following intravesical therapy, a clinician should consider performing prostatic urethral biopsy and an upper tract evaluation prior to administration of additional intravesical therapy. _(Conditional Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 23
        **In an intermediate- or high-risk patient with persistent or recurrent Ta or CIS disease after a single course of induction intravesical BCG, a clinician should offer a second course of BCG. _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 24
        **In a patient fit for surgery with high-grade T1 disease after a single course of induction intravesical BCG, a clinician should offer radical cystectomy. _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 25
        **A clinician should not prescribe additional BCG to a patient who is intolerant of BCG or has documented recurrence on TURBT of high-grade, non-muscle-invasive disease and/or CIS within six months of two induction courses of BCG or induction BCG plus maintenance. _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 26
        **In a patient with persistent or recurrent high-grade NMIBC within 12 months of completion of adequate BCG therapy (two induction courses or one induction course plus one maintenance cycle) who is unwilling or unfit for cystectomy following two courses of BCG, a clinician may recommend clinical trial enrollment, an alternative intravesical therapy (i.e., nadofaragene [firadenovec-vncg]) or alternative intravesical chemotherapies (gemcitabine/docetaxel). A clinician may also offer systemic immunotherapy with pembrolizumab to a patient with CIS within 12 months of completion of adequate BCG therapy. _(Conditional Recommendation; Evidence Strength: Grade C)_**

        ---

        #### Role of Cystectomy in NMIBC

        ##### Guideline Statement 27
        **In a patient with Ta low- or intermediate-risk disease, a clinician should not perform radical cystectomy until bladder-sparing modalities (staged TURBT, intravesical therapies) have failed. _(Clinical Principle)_**

        ##### Guideline Statement 28
        **In a high-risk patient who is fit for surgery with persistent high-grade T1 disease on repeat resection, or T1 tumors with associated CIS, LVI, or variant histologies, a clinician should consider offering initial radical cystectomy. _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 29
        **In a high-risk patient with persistent or recurrent disease within one year following treatment with two induction cycles of BCG or BCG maintenance, a clinician should offer radical cystectomy. _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ---

        #### Enhanced Cystoscopy

        ##### Guideline Statement 30
        **In a patient with NMIBC, a clinician should offer BLC at the time of TURBT, if available, to increase detection and decrease recurrence. _(Moderate Recommendation; Evidence Strength: Grade B)_**

        ##### Guideline Statement 31
        **In a patient with NMIBC, a clinician may consider use of narrow-band imaging (NBI) to increase detection and decrease recurrence. _(Conditional Recommendation; Evidence Strength: Grade C)_**

        ---

        #### Risk Adjusted Surveillance and Follow-up Strategies

        ##### Guideline Statement 32
        **After completion of the initial evaluation and treatment of a patient with NMIBC, a clinician should perform the first surveillance cystoscopy within three to four months. _(Expert Opinion)_**

        ##### Guideline Statement 33
        **For a low-risk patient whose first surveillance cystoscopy is negative for tumor, a clinician should perform subsequent surveillance cystoscopy six to nine months later, and then annually thereafter; surveillance after five years in the absence of recurrence should be based on shared-decision making between the patient and clinician. _(Moderate Recommendation; Evidence Strength: Grade C)_**

        ##### Guideline Statement 34
        **In an asymptomatic patient with a history of low-risk NMIBC, a clinician should not perform routine surveillance upper tract imaging. _(Expert Opinion)_**

        ##### Guideline Statement 35
        **In a patient with a history of low-grade Ta disease and a noted sub-centimeter papillary tumor(s), a clinician may consider in-office fulguration as an alternative to resection under anesthesia. _(Expert Opinion)_**

        ##### Guideline Statement 36
        **For an intermediate-risk patient whose first surveillance cystoscopy is negative for tumor, a clinician should perform subsequent cystoscopy with cytology every 3-6 months for 2 years, then 6-12 months for years 3 and 4, and then annually thereafter. _(Expert Opinion)_**

        ##### Guideline Statement 37
        **For a high-risk patient whose first surveillance cystoscopy is negative for tumor, a clinician should perform subsequent cystoscopy with cytology every three to four months for two years, then six months for years three and four, and then annually thereafter. _(Expert Opinion)_**

        ##### Guideline Statement 38
        **For an intermediate- or high-risk patient, a clinician should consider performing surveillance upper tract imaging at one- to two- year intervals._(Expert Opinion)_**

        ---

        **INSTRUCTIONS FOR THE REPORT:**

        When analyzing the image findings and preparing your report, follow these rules:
        
        - Begin your report with a **clear diagnosis and risk category** for the patient, based strictly on the image descriptions and reference data.
        - **Justify your conclusions** with reference codes where possible.
        - Use the **exact guideline wording** when making recommendations.
          - If guidelines recommend a certain action (e.g., repeat biopsy for pT1), state this clearly (e.g., "Guideline Statement 14 recommends repeat transurethral resection of the primary tumor site within six weeks for T1 disease.").
          - Do not say “should be considered” unless that is the explicit wording in the guideline.
        - **Do not infer or mention findings that are not present** in the image transcription or provided data (e.g., do not state "carcinoma in situ" unless it is explicitly described).
        - Cross-reference the image findings with the provided JSON reference data, but **do not mention the JSON files** in your report.
        - Write a **concise, patient-friendly markdown report** summarizing your analysis and conclusion.
        
        At the **end of your report**, always include a **Legend** section, spelling out the meaning of all acronyms used in your report. For example:
          - **NMIBC**: Non-muscle invasive bladder cancer
          - **LVI**: Lymphovascular invasion
          - **CIS**: Carcinoma in situ
          - **TURBT**: Transurethral resection of bladder tumor
          - **BCG**: Bacillus Calmette-Guerin
          - **HG**: High grade
          - **LG**: Low grade
          - (and any others as needed)

        - Do **not** enclose your markdown report in any code blocks or backticks. Your output should be markdown-formatted text only.

        **Important:**
        - Do not generate findings not present in the data.
        - Format your answer as a markdown report.
    `;

    const reportResponse = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
            {
                role: "system",
                content: "You are a medical pathology assistant who generates clear, referenced markdown reports based on image descriptions and reference JSON data."
            },
            {
                role: "user",
                content: [
                    { type: "text", text: visionTextCombined + "\n\n" + prompt }
                ],
            },
        ],
        max_tokens: 2048,
        temperature: 0.2,
    });

    const markdownReport = reportResponse.choices?.[0]?.message?.content ?? "No report generated.";

    return NextResponse.json({
        markdownReport,
        results: visionResults
    });
}

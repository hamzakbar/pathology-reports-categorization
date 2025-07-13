import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import fetch from "node-fetch"
import FormData from "form-data"

import nccnBundle from "./latest.json" assert { type: "json" }

const openai = new OpenAI()

function makeReportPrompt(rawReport: string): string {
    return `
You are an oncology decision-support LLM.

Context
-------
• **raw_report**: Delimited below.
• **nccn_graph**: Supplied as a separate assistant message containing the full
  JSON decision tree (BL-2 → BL-11, BL-E-1 → 6, etc.).

Task
----
1. Read *raw_report* and infer the patient facts needed to walk the graph
   (stage, histologic grade, CIS presence, tumour size, multifocality, etc.).
2. Traverse the NCCN graph, starting at **BL-2.initial** unless the report
   already indicates Stage II or higher. Follow 'next', 'options', and 'link'
   pointers until you land on an **endpoint** with no further link.
3. Produce a MARKDOWN report using **exactly** the structure below.

### General Instuction
- **Risk-category override:** Within NMIBC, the presence of any high-risk feature (e.g., CIS, high-grade T1, lymphovascular invasion, aggressive variant histology, prostatic urethral involvement, or high-grade Ta that is > 3 cm or multifocal) upgrades the case to *high risk*, irrespective of size or number. (Note: Stage ≥ T2 exits the NMIBC algorithm and triggers the MIBC pathways.)
- If there is a possibility for multiple risk categories, then list them both under risk category possibilities sections, also give recommendations for each possibility in that case too.
- **If decisive criteria are absent** and the tumor’s size or number is unknown, list **possible risk categories** instead of assigning a single one.
- Rewrite recommendations in **plain, human-readable language**:
- Format all recommendations in clear, professional, and readable bullet points.

After every section there should be a proper gap before the new section starts.

### Report Structure

1. **Diagnosis**
   – Clearly state the diagnosis and include the pathological stage in **bold**
     parentheses, e.g., (**Ta**).
2. **Pathology Details**
   – Concise bullet-point summary of relevant findings.
3. **Risk Category** *or* **Risk Category Possibilities**
   – Explain rationale for definitive or indeterminate risk.
4. **Recommendations**
   – List guideline-based recommendations.
   – **If NCCN: If follow-up is recommended, insert the full, relevant follow-up
     bullet points from the \`followup\` section of the endpoint, not just a
     reference to BL-E.**
    – **For high-risk, BCG-unresponsive or BCG-intolerant disease with CIS,
     include the systemic / novel-agent option
     (“Pembrolizumab OR Nadofaragene firadenovec-vncg OR Nogapendekin alfa
     inbakicept-pmln + BCG – select patients”) verbatim.**
    - If the case is high-risk **and** CIS is present **and** 'bcg_status' is null,
      traverse the 'unresponsive_or_intoleran' branch.
5. ** Important Notes **
   – Caveats(e.g., muscularis propria not present).
6. ** Conclusion **
   – Brief clinical synthesis.
7. ** Legend **
   – Spell out all acronyms used(NMIBC, LVI, CIS, etc.).
8. ** References **
   – Enumerate cited guideline statement numbers.

Formatting rules
    ----------------
• Output plain markdown — ** no fenced code blocks **.
• Use bullet points where indicated.
• Bold only the stage inside parentheses in the Diagnosis line.
• Beautifully format the report with proper headings, sections, gap between sections, bulleted points lists, proper indentation etc.
• Use a combination of bullet points, and numbered lists for a case where we have lists within lists

    raw_report:
<< <
        ${ rawReport.trim()}
        >>>
`.trim()
}

// • Reference node IDs inline in the Rationale section, e.g.,
//         (BL - 2.grade_check → BL - 2.final_management → BL - 3.high).

async function askOpenAI(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
    const res = await openai.chat.completions.create({
        model: "gpt-4.1",
        // reasoning_effort: "high",
        temperature: 0.2,
        messages,
    })
    return res.choices?.[0]?.message?.content?.trim() ?? ""
}

export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof File))
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 })

    let rawText = ""
    try {
        const pdfBuf = Buffer.from(await file.arrayBuffer())
        const fd = new FormData()
        fd.append("file", pdfBuf, {
            filename: file.name,
            contentType: file.type || "application/pdf",
        })

        const ocrRes = await fetch(`${process.env.API_BASE_URL}/ocr/text`, {
            method: "POST",
            body: fd as any,
            headers: (fd as any).getHeaders(),
        })
        const { success, content } = (await ocrRes.json()) as {
            success: boolean
            content: string
        }
        if (!success) throw new Error("OCR service returned failure")
        rawText = content
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "OCR failed" }, { status: 500 })
    }

    let markdown: string
    try {
        markdown = await askOpenAI([
            { role: "system", content: makeReportPrompt(rawText) },
            { role: "assistant", name: "nccn_graph", content: JSON.stringify(nccnBundle) },
        ])
    } catch (e: any) {
        return NextResponse.json(
            { error: "LLM generation failed – " + e.message },
            { status: 500 }
        )
    }

    return NextResponse.json(
        { markdownReport: markdown },
        { status: 200 }
    )
}

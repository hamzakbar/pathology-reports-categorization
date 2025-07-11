import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import fetch from "node-fetch"
import FormData from "form-data"
import guidelines from "./bladder_guidelines_prompt.json" assert { type: "json" }

const openai = new OpenAI()

type ReportRules = { general: string; structure: string }
type PromptCfg = {
    aua: string
    nccn: string
    guideline_statements: string
    report_instructions: ReportRules
}

const cfg = guidelines as unknown as PromptCfg

function assemblePrompt(
    criteria: "aua" | "nccn",
    riskBlock: string,
    guidelinesText: string,
    rules: ReportRules
): string {
    return `
    Based on the **${criteria.toUpperCase()}** risk-stratification information below, please classify the images that I've added before.

    ${criteria === 'nccn' && 'give recommendations from all the text that i have given you from ncnn'}

    ${riskBlock}

    ---

    ${criteria === 'aua' && guidelinesText}

    ---

    ${rules.general}

    ${rules.structure}
      `.trim()
}

export async function POST(req: NextRequest) {
    const criteriaParam = req.nextUrl.searchParams.get("criteria")?.toLowerCase()
    const criteria: "aua" | "nccn" = criteriaParam === "aua" ? "aua" : "nccn"

    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof File))
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 })

    let ocrText = ""
    try {
        const pdfBuffer = Buffer.from(await file.arrayBuffer())
        const fd = new FormData()
        fd.append("file", pdfBuffer, {
            filename: file.name,
            contentType: file.type || "application/pdf",
        })

        const ocrRes = await fetch(`${process.env.API_BASE_URL}/ocr/text`, {
            method: "POST",
            body: fd as any,
            headers: (fd as any).getHeaders(),
        })
        if (!ocrRes.ok) throw new Error(`OCR API failed (${ocrRes.status})`)

        const ocrJson: any = await ocrRes.json()
        if (!ocrJson.success) throw new Error("OCR API did not return success")
        ocrText = ocrJson.content ?? ""
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message ?? "OCR extraction failed." },
            { status: 500 }
        )
    }

    const riskBlock = criteria === "aua" ? cfg.aua : cfg.nccn
    const prompt = assemblePrompt(
        criteria,
        riskBlock,
        cfg.guideline_statements,
        cfg.report_instructions
    )

    let markdownReport = ""
    try {
        const ai = await openai.chat.completions.create({
            model: "gpt-4.1",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a medical pathology assistant who generates clear, referenced markdown reports based on image descriptions and guideline data.",
                },
                { role: "user", content: [{ type: "text", text: `${ocrText}\n\n${prompt}` }] },
            ],
            max_tokens: 2048,
            temperature: 0.2,
        })
        markdownReport = ai.choices?.[0]?.message?.content ?? "No report generated."
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message ?? "LLM generation failed." },
            { status: 500 }
        )
    }

    return NextResponse.json(
        {
            markdownReport,
            results: [
                {
                    file: file.name,
                    output: ocrText,
                },
            ],
        },
        { status: 200 }
    )
}

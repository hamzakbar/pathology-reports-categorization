import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fetch from "node-fetch";
import FormData from "form-data";
import guidelines from "./nccn.json" assert { type: "json" };

const openai = new OpenAI();

type ReportRules = { general: string; structure: string };

type PromptCfg = {
    aua: string;
    nccn: object;
    guideline_statements: string;
    report_instructions: ReportRules;
};

const cfg = guidelines as unknown as PromptCfg;

function assemblePrompt(
    criteria: "aua" | "nccn",
    guidelineData: string,
    guidelinesText: string,
    rules: ReportRules = { general: '', structure: '' }
): string {
    return `
You are a medical pathology assistant. Your task is to analyze the provided pathology report text.
Based on the **${criteria.toUpperCase()}** guideline data provided below, classify the report and generate a clear, referenced markdown report.

---
## Guideline Data (${criteria.toUpperCase()})

${guidelineData}

---

${criteria === 'aua' ? `## Additional Guideline Statements\n\n${guidelinesText}` : '## Task: Generate NCCN Recommendations\n\nBased *only* on the comprehensive NCCN JSON data provided above, generate a detailed report that includes risk stratification, staging, primary treatment options, and a complete follow-up schedule.'}

---

## Report Generation Rules

${rules.general}

${rules.structure}
      `.trim();
}

/**
 * Cleans the markdown string from the LLM, removing the common code fence wrappers.
 * @param markdown The raw string from the OpenAI API.
 * @returns A clean markdown string.
 */
function cleanMarkdown(markdown: string): string {
    const regex = /^```(?:markdown)?\s*([\s\S]*?)\s*```$/;
    const match = markdown.trim().match(regex);

    // FIX 1: Access the captured group [1] (a string) before trimming.
    // The captured group 'match[1]' contains the actual markdown content.
    return match && match[1] ? match[1].trim() : markdown.trim();
}


export async function POST(req: NextRequest) {
    const criteriaParam = req.nextUrl.searchParams.get("criteria")?.toLowerCase();
    const criteria: "aua" | "nccn" = criteriaParam === "aua" ? "aua" : "nccn";

    if (!cfg.report_instructions) {
        console.error("Configuration Error: 'report_instructions' is missing from nccn.json");
        return NextResponse.json({ error: "Server configuration is invalid." }, { status: 500 });
    }

    let ocrText = "";
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        if (!(file instanceof File)) {
            return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
        }
        const pdfBuffer = Buffer.from(await file.arrayBuffer());
        const fd = new FormData();
        fd.append("file", pdfBuffer, { filename: file.name, contentType: file.type || "application/pdf" });

        if (!process.env.API_BASE_URL) {
            throw new Error("OCR service configuration error: API_BASE_URL environment variable is not set.");
        }
        const ocrRes = await fetch(`${process.env.API_BASE_URL}/ocr/text`, { method: "POST", body: fd as any, headers: (fd as any).getHeaders() });

        if (!ocrRes.ok) {
            const errorBody = await ocrRes.text();
            throw new Error(`OCR API request failed with status ${ocrRes.status}: ${errorBody}`);
        }
        const ocrJson: any = await ocrRes.json();
        if (!ocrJson.success || !ocrJson.content) {
            throw new Error("OCR API did not return successful or valid content.");
        }
        ocrText = ocrJson.content;
    } catch (err: any) {
        console.error("\n--- OCR EXTRACTION FAILED ---", err);
        return NextResponse.json({ error: "Failed during text extraction from file. Check server logs for details." }, { status: 500 });
    }

    const guidelineData = criteria === "aua" ? cfg.aua : JSON.stringify(cfg.nccn, null, 2);
    const prompt = assemblePrompt(criteria, guidelineData, cfg.guideline_statements, cfg.report_instructions);

    let rawMarkdownReport = "";
    try {
        const ai = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "You are a medical pathology assistant who generates clear, referenced markdown reports based on pathology text and extensive guideline data in JSON format." },
                { role: "user", content: [{ type: "text", text: `## Pathology Report Text:\n\n${ocrText}\n\n---\n\n${prompt}` }] },
            ],
            max_tokens: 4096,
            temperature: 0.1,
        });

        // FIX 2: Corrected the optional chaining syntax to properly access the message content.
        rawMarkdownReport = ai.choices?.[0]?.message?.content ?? "No report generated.";

    } catch (err: any) {
        console.error("\n--- LLM GENERATION FAILED ---", err);
        return NextResponse.json({ error: "Failed during AI report generation. Check server logs for details." }, { status: 500 });
    }

    const markdownReport = cleanMarkdown(rawMarkdownReport);

    return NextResponse.json(
        {
            markdownReport,
            results: [{ output: ocrText }],
        },
        { status: 200 }
    );
}
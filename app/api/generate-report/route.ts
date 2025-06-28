import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const visionPromises: Promise<{ file: string, output: string }>[] = [];

    for (const [_, value] of formData.entries()) {
        if (value instanceof File) {
            visionPromises.push(
                (async () => {
                    const arrayBuffer = await value.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const base64Image = buffer.toString("base64");
                    const mimeType = value.type || "image/png";
                    const response = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: "what's in this image?" },
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

    const bladderPathJsonPath = path.join(process.cwd(), "configs/bladder-pathology-practice-cases.json");
    const uroClassJsonPath = path.join(process.cwd(), "configs/uro-class.json");
    const [bladderPathData, uroClassData] = await Promise.all([
        fs.readFile(bladderPathJsonPath, "utf-8"),
        fs.readFile(uroClassJsonPath, "utf-8")
    ]);

    const visionTextCombined = visionResults.map(
        (res, idx) => `Image ${idx + 1} (${res.file}):\n${res.output}`
    ).join("\n\n");

    const prompt = `
        You are a pathology assistant. Below are the descriptions of several bladder biopsy report images. Along with these, you have access to two JSON reference files: 
        
        1. bladder-pathology-practice-cases.json:
        \`\`\`json
        ${bladderPathData}
        \`\`\`
        
        2. uro-class.json:
        \`\`\`json
        ${uroClassData}
        \`\`\`
        
        Based on the biopsy image descriptions and the reference data, analyze what pathological condition(s) the patient most likely has, including any tumor class or urothelial grading. 
        
        - Cross-reference the image findings with the JSON reference data. 
        - Justify your diagnosis with reference codes if possible.
        - Write a clear and concise markdown report for the patient, summarizing your analysis, conclusion, and relevant supporting evidence.
`;

    const reportResponse = await openai.chat.completions.create({
        model: "gpt-4o",
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

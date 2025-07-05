import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { prompt, reportContext, redactedTextContext } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Bad Request: 'prompt' is required in the request body." },
        { status: 400 }
      );
    }
    if (!reportContext && !redactedTextContext) {
      return NextResponse.json(
        { error: "Bad Request: At least one context ('reportContext' or 'redactedTextContext') is required." },
        { status: 400 }
      );
    }

    const systemMessage = `
      You are a helpful medical assistant. 
      You will be given two documents as context: a 'Generated Report' and the 'Original Redacted Text'.
      Your primary task is to answer follow-up questions by synthesizing information from *both* sources.
      Prioritize the 'Generated Report' for summarized information but refer to the 'Original Redacted Text' for specific details or direct quotes if necessary.
      Do not invent, infer, or assume any information not present in the provided documents.
      Keep your answers concise. If the answer cannot be found in either document, clearly state that the information is not available.
    `;

    const userMessage = `
      CONTEXT 1: Generated Report
      ---
      ${reportContext || "No summary was provided."}
      ---

      CONTEXT 2: Original Redacted Text
      ---
      ${redactedTextContext || "No original text was provided."}
      ---

      Based on the two documents provided above, please answer the following question:
      "${prompt}"
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: userMessage
        },
      ],
      max_tokens: 500,
      temperature: 0.2,
    });

    const responseMessage = completion.choices[0]?.message?.content ?? "Sorry, I was unable to generate a response. Please try again.";

    return NextResponse.json({ response: responseMessage });

  } catch (err: any) {
    console.error("[CHAT_API_ERROR]", err);
    return NextResponse.json(
      { error: "An internal server error occurred while processing your question." },
      { status: 500 }
    );
  }
}
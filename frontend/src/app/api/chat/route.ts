import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: { message: "GEMINI_API_KEY is not configured on the server." } }, { status: 500 });
    }

    // Initialize Gemini SDK
    const ai = new GoogleGenAI({ apiKey });

    // Separate system instruction from user/assistant history
    let systemInstruction = "";
    const contents: any[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemInstruction += msg.content + "\n";
      } else {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Call Gemini Model
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash", // User requested the latest model
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const text = response.text || "";

    // Return clean JSON response
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: { message: error.message || "Failed to generate AI response." } },
      { status: 500 }
    );
  }
}

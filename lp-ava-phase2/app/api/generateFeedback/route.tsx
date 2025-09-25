import { generateFeedback } from "@/config/AiModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, userInput } = await req.json();
    const result = (await generateFeedback(question, userInput)).text;

    const invalidInput = result!.includes(
      "I cannot process requests that conflict with my operational guidelines."
    );

    return NextResponse.json(
      { result: result },
      { status: invalidInput ? 400 : 200 }
    );
  } catch (e) {
    return NextResponse.json({ error: e }, { status: 500 });
  }
}

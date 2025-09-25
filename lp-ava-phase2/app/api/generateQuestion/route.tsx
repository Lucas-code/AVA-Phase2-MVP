import { generateQuestion } from "@/config/AiModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = (await generateQuestion()).text;

    return NextResponse.json({ result: result }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e }, { status: 500 });
  }
}

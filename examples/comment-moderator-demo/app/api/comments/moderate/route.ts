import { NextResponse } from "next/server";

// This is a simple example - in reality you'd call the MindStudio API
function moderateContent(content: string) {
  // For demo purposes, reject comments containing "bad" and approve others
  const isBad = content.toLowerCase().includes("bad");

  return {
    isApproved: !isBad,
    reason: isBad ? "Content contains inappropriate language" : undefined,
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // In a real app, this would call the MindStudio API
  const moderationResult = moderateContent(content);

  return NextResponse.json(moderationResult);
}

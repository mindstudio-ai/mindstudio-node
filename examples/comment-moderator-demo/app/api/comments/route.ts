import { NextResponse } from "next/server";
import { Comment } from "@/app/types";

// In a real app, this would be a database
const comments: Comment[] = [];

export async function GET() {
  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const body = await request.json();

  const newComment: Comment = {
    id: Math.random().toString(36).substring(7),
    content: body.content,
    author: "Anonymous", // In a real app, this would come from auth
    createdAt: new Date(),
    isModerated: false,
  };

  // Add to our "database"
  comments.push(newComment);

  // In a real app, we would trigger moderation here
  // For now, we'll do it inline
  try {
    const moderationResponse = await fetch("/api/comments/moderate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: newComment.content }),
    });

    if (moderationResponse.ok) {
      const result = await moderationResponse.json();
      newComment.moderationResult = result;
      newComment.isModerated = true;
    }
  } catch (error) {
    console.error("Moderation failed:", error);
  }

  return NextResponse.json(newComment);
}

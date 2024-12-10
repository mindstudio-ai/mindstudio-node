import { revalidatePath } from "next/cache";
import CommentForm from "./components/CommentForm";
import CommentList from "./components/CommentList";
import { Comment } from "@/types";
import { MindStudio } from "mindstudio";

// Initialize MindStudio client
const mindstudio = new MindStudio(process.env.MINDSTUDIO_KEY);

// Mock comments database (in-memory)
const comments: Comment[] = [];

export default function Home() {
  // Server action for handling comment submission
  async function submitComment(formData: FormData) {
    "use server";

    const content = formData.get("content") as string;

    if (!content) {
      throw new Error("Content is required");
    }

    const newComment: Comment = {
      id: Math.random().toString(36).substring(7),
      content,
      author: "Anonymous",
      createdAt: new Date(),
      isModerated: false,
    };

    // Moderate the comment content using MindStudio
    try {
      const moderationResult =
        await mindstudio.workers.MindStudioServices.contentModerator({
          content: newComment.content,
        });

      newComment.moderationResult = {
        isApproved: moderationResult.result === "CLEAR",
        reason: moderationResult.result,
      };
      newComment.isModerated = true;
    } catch (error) {
      console.error("Moderation failed:", error);
      newComment.moderationResult = {
        isApproved: false,
        reason: "Moderation error",
      };
      newComment.isModerated = true;
    }

    // Add the new comment to the mock database
    comments.push(newComment);

    // Revalidate the current path to update the page with the new comment
    revalidatePath("/");
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Comment Moderator Demo</h1>
      <div className="mb-8">
        <CommentForm submitComment={submitComment} />
      </div>
      <CommentList comments={comments} />
    </div>
  );
}

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
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          MindStudio Comment Moderator
        </h1>
        <p className="mt-3 text-lg leading-6 text-gray-600">
          A simple demo of AI-powered content moderation
        </p>
      </div>

      <div className="space-y-10">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <CommentForm submitComment={submitComment} />
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-base font-semibold leading-6 text-gray-900 mb-4">
              Comments
            </h2>
            <CommentList comments={comments} />
          </div>
        </div>
      </div>
    </div>
  );
}

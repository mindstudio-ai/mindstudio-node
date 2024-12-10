"use client";

import { Comment } from "@/types";

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-center text-gray-500 text-sm">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={`rounded-lg border p-4 ${
            comment.isModerated
              ? comment.moderationResult?.isApproved
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-900">
              {comment.author}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="mt-2 flex items-center">
            {comment.isModerated ? (
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  comment.moderationResult?.isApproved
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {comment.moderationResult?.isApproved
                  ? "✓ Approved"
                  : "✕ Rejected"}
                {comment.moderationResult?.reason &&
                  `: ${comment.moderationResult.reason}`}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                ⋯ Moderating...
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

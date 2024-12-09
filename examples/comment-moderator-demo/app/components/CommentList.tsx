import { Comment } from "@types";

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={`p-4 rounded-lg border ${
            comment.moderationResult?.isApproved
              ? "border-green-200 bg-green-50"
              : comment.moderationResult
                ? "border-red-200 bg-red-50"
                : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-900">
              {comment.author}
            </p>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
          {comment.moderationResult && (
            <div className="mt-2 text-xs">
              <span
                className={
                  comment.moderationResult.isApproved
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {comment.moderationResult.isApproved ? "Approved" : "Rejected"}
                {comment.moderationResult.reason &&
                  `: ${comment.moderationResult.reason}`}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

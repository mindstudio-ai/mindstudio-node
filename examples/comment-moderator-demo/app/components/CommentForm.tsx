"use client";

interface CommentFormProps {
  submitComment: (formData: FormData) => void;
}

export default function CommentForm({ submitComment }: CommentFormProps) {
  return (
    <form action={submitComment} className="space-y-4">
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Add a comment
        </label>
        <div className="mt-2">
          <textarea
            id="comment"
            name="content"
            rows={3}
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Type your comment here..."
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Submit for moderation
        </button>
      </div>
    </form>
  );
}

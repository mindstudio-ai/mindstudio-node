"use client";

interface CommentFormProps {
  submitComment: (formData: FormData) => void;
}

export default function CommentForm({ submitComment }: CommentFormProps) {
  return (
    <form action={submitComment}>
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700"
        >
          Add a comment
        </label>
        <textarea
          id="comment"
          name="content"
          rows={3}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-4 mt-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Submit
      </button>
    </form>
  );
}

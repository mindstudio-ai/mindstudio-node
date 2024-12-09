"use client";

import { useState, useEffect } from "react";
import CommentForm from "./components/CommentForm";
import CommentList from "./components/CommentList";
import { Comment } from "./types";

export default function Home() {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    // Load initial comments
    fetch("/api/comments")
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((error) => console.error("Failed to load comments:", error));
  }, []);

  const handleSubmitComment = async (content: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to submit comment");

      const newComment = await response.json();
      setComments((prev) => [...prev, newComment]);
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert("Failed to submit comment. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Comment Moderator Demo</h1>
      <div className="mb-8">
        <CommentForm onSubmit={handleSubmitComment} />
      </div>
      <CommentList comments={comments} />
    </div>
  );
}

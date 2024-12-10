export const metadata = {
  title: "Comment Moderator Demo",
  description: "A simple comment moderation demo using MindStudio and Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

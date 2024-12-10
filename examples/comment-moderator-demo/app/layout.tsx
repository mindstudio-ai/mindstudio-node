import "./globals.css";

export const metadata = {
  title: "MindStudio Comment Moderator",
  description: "A simple demo of MindStudio content moderation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        <main className="min-h-full">{children}</main>
      </body>
    </html>
  );
}

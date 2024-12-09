# Comment Moderator Demo with MindStudio

A simple Next.js application demonstrating how to use MindStudio AI Workers for content moderation. This demo shows how to integrate MindStudio's content moderation capabilities into a web application.

## Features

- Comment submission and display
- Automatic content moderation using MindStudio AI
- Real-time feedback on moderation results
- Simple in-memory storage (for demo purposes)

## Prerequisites

- Node.js 16.0.0 or later
- A MindStudio account and API key
- Basic knowledge of Next.js and TypeScript

## Getting Started

1. **Clone and Install Dependencies**

   ```bash
   git clone https://github.com/yourusername/comment-moderator-demo
   cd comment-moderator-demo
   npm install
   ```

2. **Set Up MindStudio**

   ```bash
   # Install MindStudio CLI globally (optional)
   npm install -g mindstudio

   # List available workers
   npx mindstudio list

   # Generate type definitions for your workers
   npx mindstudio sync
   ```

3. **Configure Environment Variables**

   ```bash
   # Create a .env.local file
   cp .env.example .env.local

   # Add your MindStudio API key
   MINDSTUDIO_KEY=your-api-key
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

5. **Open the Application**
   Visit [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Comment Submission**

   ```typescript
   import { MindStudio } from 'mindstudio';

   const client = new MindStudio(process.env.MINDSTUDIO_KEY);

   // When a comment is submitted
   const moderationResult = await client.workers.ContentModerator.checkContent({
     text: commentText
   });

   // Handle the moderation result
   if (moderationResult.result.isApproved) {
     // Store and display the comment
   } else {
     // Handle rejected content
   }
   ```

2. **Moderation Results**
   - Comments are automatically checked for inappropriate content
   - Approved comments are displayed with a green background
   - Rejected comments are displayed with a red background and reason
   - Moderation results include detailed feedback

## Project Structure

```
comment-moderator-demo/
├── app/
│   ├── api/
│   │   └── comments/
│   │       ├── route.ts       # API endpoints
│   │       └── moderate.ts    # MindStudio integration
│   ├── components/
│   │   ├── CommentForm.tsx   # Comment submission form
│   │   └── CommentList.tsx   # Comments display
│   └── page.tsx              # Main page
└── types/
    └── index.ts              # Type definitions
```

## Best Practices

1. **API Key Security**
   - Store your MindStudio API key in environment variables
   - Never commit API keys to version control
   - Use secure environment variables in production

2. **Error Handling**

   ```typescript
   try {
     const result = await client.workers.ContentModerator.checkContent({
       text: comment
     });
   } catch (error) {
     if (error instanceof MindStudioError) {
       console.error('Moderation failed:', error.message);
     }
   }
   ```

3. **Type Safety**
   - Use the generated types from `mindstudio sync`
   - Keep types up to date with your workers
   - Leverage TypeScript for better development experience

## Next Steps

1. Add a database for comment persistence
2. Implement user authentication
3. Add rate limiting
4. Deploy to production

## Learn More

- [MindStudio Documentation](https://docs.mindstudio.ai)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

MIT

# Comment Moderation with MindStudio

A complete example of implementing AI-powered content moderation in a Next.js application using MindStudio. This repository demonstrates how to integrate MindStudio workers into a real web application, from initial setup to deployment.

[Screenshot or GIF of the demo in action]

## What You'll Learn

- How to remix and configure a MindStudio content moderation worker
- Integrating MindStudio workers into a Next.js application
- Real-time content moderation with visual feedback
- Best practices for API key management and error handling

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- A [MindStudio](https://mindstudio.ai) account
- Basic familiarity with Next.js and React

## Setup Guide

### 1. Remix the Content Moderation Worker

1. Visit the [Content Moderation Worker Template](https://mindstudio.ai/workers/templates/content-moderation)
2. Click "Remix Worker"
3. Configure your worker settings (or keep the defaults)
4. Deploy your worker

### 2. Get Your API Key

1. Go to your [MindStudio Dashboard](https://mindstudio.ai/dashboard)
2. Navigate to API Keys
3. Create a new API key or copy an existing one

### 3. Run the Demo Locally

```bash
# Clone the repository
git clone https://github.com/mindstudio/comment-moderator-demo
cd comment-moderator-demo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API key to .env.local
```

Edit `.env.local`:

```
MINDSTUDIO_KEY=your-api-key-here
```

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the demo in action!

## How It Works

This demo implements a simple comment system with real-time moderation:

1. **User submits a comment** through the web interface
2. **Server processes the submission** using Next.js Server Actions
3. **MindStudio worker analyzes the content** for appropriateness
4. **Results are displayed instantly** with visual feedback:
   - 🟡 Pending moderation
   - 🟢 Approved content
   - 🔴 Rejected content

## Key Implementation Details

### Initializing MindStudio

```typescript
import { MindStudio } from "mindstudio";
const mindstudio = new MindStudio(process.env.MINDSTUDIO_KEY);
```

### Processing Content

```typescript
const moderationResult = await mindstudio.workers.ContentModerator.checkContent({
  content: newComment.content,
});
```

### Error Handling

```typescript
try {
  // Moderation code here
} catch (error) {
  if (error instanceof MindStudioError) {
    console.error('Moderation failed:', error.message);
  }
}
```

## Project Structure

```
comment-moderator-demo/
├── app/
│   ├── components/
│   │   ├── CommentForm.tsx   # Comment submission form
│   │   └── CommentList.tsx   # Comments display with moderation status
│   └── page.tsx              # Main page with MindStudio integration
└── types/
    └── index.ts              # Type definitions
```

## Customization

### Modifying Moderation Rules

1. Visit your worker in MindStudio
2. Adjust the moderation parameters
3. Deploy the changes
4. Your application will automatically use the updated rules

### Styling

The demo uses Tailwind CSS for styling. Modify `tailwind.config.ts` and component classes to match your design system.

## Deployment

This demo can be deployed to any platform that supports Next.js applications. For the simplest deployment:

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your `MINDSTUDIO_KEY` to the environment variables
4. Deploy!

## Learn More

- [MindStudio Documentation](https://docs.mindstudio.ai)
- [Worker Templates](https://mindstudio.ai/workers/templates)
- [API Reference](https://docs.mindstudio.ai/api)
- [Next.js Documentation](https://nextjs.org/docs)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT

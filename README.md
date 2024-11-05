# MindStudio

Client library for MindStudio AI Workers. Easily integrate and execute AI workflows in your applications with type-safe interfaces.

## Installation

```bash
npm install mindstudio
```

## Quick Start

```typescript
import { MindStudio } from 'mindstudio';

// Initialize the client
const client = new MindStudio('your-api-key');
await client.init();

// Execute a workflow
const result = await client.workers.myWorker.generateText({
  prompt: "Write a story about a space cat"
});

console.log(result);
```

## Configuration

Create a `.env` file in your project root:

```env
MINDSTUDIO_KEY=your-api-key
```

Or pass configuration when initializing:

```typescript
const client = new MindStudio('your-api-key', {
  baseUrl: 'https://custom-api-endpoint.com'
});
```

## CLI Usage

MindStudio includes a CLI for workspace management and type generation.

### Initialize Your Workspace

```bash
npx mindstudio sync
```

This will:

1. Create a `.mindstudio.json` configuration file
2. Generate TypeScript type definitions for your workers
3. Set up your development environment

### Test Workflows

```bash
npx mindstudio test
```

Interactive CLI to test your workflows with input validation.

### Generate Types

```bash
npx mindstudio generate
```

Regenerate TypeScript definitions from your current configuration.

## Type-Safe Workflows

After initialization, you'll get full TypeScript support for your workflows:

```typescript
// Workflow with output variables
const { success, result, error, billingCost } = await client.workers.contentGenerator.createBlogPost({
  topic: "AI Technology",
  tone: "Professional",
  wordCount: "1000"
});

if (success) {
  // Result contains defined output variables
  console.log(result.blogPost);
  console.log(result.title);
}

// Workflow with string output
const { success, result } = await client.workers.textGenerator.generateText({
  prompt: "Write a story about a space cat"
});

if (success && typeof result === 'string') {
  console.log(result); // Direct string output
}
```

## Response Structure

All workflow executions return a consistent structure:

```typescript
interface WorkflowResponse<T> {
  success: boolean;        // Indicates if the workflow executed successfully
  result: T;              // Output variables object, string, or undefined
  error?: any;            // Error information if the workflow failed
  billingCost?: number;   // Execution cost for billing purposes
}
```

The `result` type depends on your workflow configuration:

- If output variables are defined: Returns an object with typed output variables
- If no output variables: Returns a string or undefined

## Error Handling

```typescript
try {
  const { success, result, error } = await client.workers.myWorker.generateText({
    prompt: "Hello"
  });

  if (!success) {
    console.error('Workflow failed:', error);
    return;
  }

  // Handle the result based on its type
  if (typeof result === 'string') {
    console.log('Text generated:', result);
  } else if (result && typeof result === 'object') {
    console.log('Output variables:', result);
  }
} catch (error) {
  if (error instanceof MindStudioError) {
    console.error(error.code);    // Error code
    console.error(error.status);  // HTTP status
    console.error(error.message); // Error message
    console.error(error.details); // Additional error details
  }
}
```

## Best Practices

### Version Control

We recommend committing your `.mindstudio.json` file to version control. This ensures:

- Consistent worker/workflow configurations across your team
- Type definitions can be regenerated on new installations
- Changes to your AI workflows can be tracked over time

### Post-Install Type Generation

To ensure type definitions are always up-to-date after package installation, add a postinstall script to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "mindstudio generate"
  }
}
```

This will automatically regenerate type definitions when:

- Installing the project on a new machine
- Running `npm install` or `yarn install`
- Updating the mindstudio package

Note: Make sure `.mindstudio.json` exists in your repository for this to work.

## License

MIT

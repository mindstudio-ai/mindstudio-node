![MindStudio](https://youai.imgix.net/images/a47f3f3a-a1fa-41ca-8de3-e415452b4611_1731014311207.png?fm=auto)

# MindStudio JavaScript/TypeScript API Library

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
const { success, result } = await client.workers.myWorker.generateText({
  prompt: "Write a story about a space cat"
});

if (success) {
  console.log(result);
}
```

## Configuration

Create a `.env` file in your project root:

```env
MINDSTUDIO_KEY=your-api-key
MINDSTUDIO_BASE_URL=https://custom-api-endpoint.com  # Optional
```

Or pass configuration when initializing:

```typescript
const client = new MindStudio('your-api-key', {
  baseUrl: 'https://custom-api-endpoint.com'
});
```

## Type Definitions

The library provides comprehensive TypeScript definitions. After initialization, you'll get full type support for your workflows:

```typescript
// Import available types
import { 
  WorkflowResponse, 
  OutputVarsResponse, 
  StringResponse,
  MindStudioWorkers 
} from 'mindstudio';

// Type-safe worker instance
const client: MindStudio;
const workers: MindStudioWorkers;

// Workflow with output variables
const response: OutputVarsResponse<{
  blogPost: string;
  title: string;
}> = await client.workers.contentGenerator.createBlogPost({
  topic: "AI Technology",
  tone: "Professional"
});

// Workflow with string output
const response: StringResponse = await client.workers.textGenerator.generateText({
  prompt: "Write a story"
});
```

## Response Types

All workflow executions return a consistent structure:

```typescript
// Base response type
interface WorkflowResponse<TResult> {
  success: boolean;
  result: TResult;
  error?: any;
  billingCost?: number;
}

// For workflows with output variables
type OutputVarsResponse<T extends Record<string, string>> = WorkflowResponse<T>;

// For workflows with string output
type StringResponse = WorkflowResponse<string | undefined>;
```

## CLI Usage

MindStudio includes a CLI for workspace management:

### Initialize Workspace

```bash
npx mindstudio sync
```

This will:

1. Create `.mindstudio.json` with your worker configurations
2. Generate TypeScript definitions in `node_modules/mindstudio/dist/generated.d.ts`
3. Set up your development environment

### Test Workflows

```bash
npx mindstudio test [--worker <name>] [--workflow <name>] [--input <json>]
```

Interactive CLI to test workflows with input validation.

### Regenerate Types

```bash
npx mindstudio generate
```

Updates TypeScript definitions from your current `.mindstudio.json` configuration.

## Error Handling

The library provides two levels of error handling:

1. Workflow execution errors (returned in the response)
2. Client-level errors (thrown as MindStudioError)

### Workflow Execution Errors

```typescript
const { success, result, error } = await client.workers.myWorker.generateText({
  prompt: "Hello"
});

if (!success) {
  console.error('Workflow execution failed:', error);
  return;
}

console.log('Success:', result);
```

### Client-Level Errors

```typescript
import { MindStudioError } from 'mindstudio';

try {
  // These can throw MindStudioError:
  const client = new MindStudio('invalid-api-key');
  await client.init();
  
} catch (error) {
  if (error instanceof MindStudioError) {
    console.error({
      message: error.message,  // Error description
      code: error.code,        // Error code (e.g., 'missing_api_key', 'init_failed')
      status: error.status,    // HTTP status code (e.g., 400, 500)
      details: error.details   // Additional error context
    });
  }
}
```

Common error codes:

- `missing_api_key`: API key not provided
- `init_failed`: Failed to initialize client
- `missing_input`: Required workflow input variables not provided
- `invalid_input`: Input validation failed
- `invalid_output`: Output validation failed

## Best Practices

### Version Control

Commit `.mindstudio.json` to version control to ensure:

- Consistent worker configurations across your team
- Type definitions can be regenerated on new installations
- AI workflow changes can be tracked

### Post-Install Type Generation

Add to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "mindstudio generate"
  }
}
```

This regenerates types automatically when:

- Installing on a new machine
- Running `npm install`
- Updating the mindstudio package

Note: Requires `.mindstudio.json` in your repository.

## License

MIT

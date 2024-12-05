![MindStudio](https://youai.imgix.net/images/a47f3f3a-a1fa-41ca-8de3-e415452b4611_1731014311207.png?fm=auto)

# MindStudio JavaScript/TypeScript API Library

![NPM Version](https://img.shields.io/npm/v/mindstudio)

Client library for MindStudio AI Workers. Easily integrate and execute AI workflows in your applications with type-safe interfaces.

## Quick Start

1. **Install the Package**

```bash
npm install mindstudio
```

2. **Get Your API Key**
   - Go to [MindStudio Developer Settings](https://app.mindstudio.ai/workspace/settings/developer?page=api-keys)
   - Create a new API key
   - Copy the key for the next step

3. **Initialize Your Workspace**

```bash
# First-time setup with your API key
npx mindstudio sync
```

4. **Start Using the Library**

```typescript
import { MindStudio } from 'mindstudio';

const client = new MindStudio('your-api-key');

// Use type-safe workers
const { success, result } = await client.workers.myWorker.generateText({
  prompt: "Write a story about a space cat"
});

if (success) {
  console.log(result);
}
```

## Usage Guide

### 1. Setting Up Your Project

#### Environment Variables (Recommended)

Create a `.env` file in your project root:

```env
MINDSTUDIO_KEY=your-api-key
```

#### Direct Configuration

Or pass configuration when initializing:

```typescript
const client = new MindStudio('your-api-key', {
  baseUrl: 'https://custom-api-endpoint.com'  // Optional
});
```

### 2. Choose Your Usage Pattern

#### Pattern A: Type-Safe Usage (Recommended)

```typescript
// Requires running 'npx mindstudio sync' first
const { success, result } = await client.workers.myWorker.generateText({
  prompt: "Write a story about a space cat"
});

if (success) {
  console.log(result);
}
```

Benefits:

- Full TypeScript support
- Auto-completion for workers and parameters
- Compile-time validation
- Better developer experience

#### Pattern B: Direct Execution

```typescript
// Always available, no setup required
const { success, result } = await client.run({
  workerId: "worker-id",
  workflow: "generateText",
  variables: {
    prompt: "Write a story about a space cat"
  }
});
```

Benefits:

- No setup required
- Works without type definitions
- Flexible for dynamic usage

### 3. Team Setup

1. **Initial Setup** (Project Owner)

```bash
# Initialize workspace and commit configuration
npx mindstudio sync
git add .mindstudio.json
git commit -m "Add MindStudio configuration"
```

2. **Team Member Setup**

```bash
# After cloning the repository
npm install
npx mindstudio sync --offline
```

3. **Automatic Type Generation** (Optional)
Add to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "mindstudio sync --offline"
  }
}
```

## CLI Commands

### `sync`

Initialize or update your workspace configuration and type definitions.

```bash
# Full sync (requires API key)
npx mindstudio sync

# Offline mode (requires existing .mindstudio.json)
npx mindstudio sync --offline
```

Options:

- `--key <apiKey>`: Override API key
- `--base-url <url>`: Override API base URL
- `--offline`: Generate types without API calls

### `test`

Test a workflow directly from the command line.

```bash
npx mindstudio test --worker myWorker --workflow generateText --input '{"prompt":"Hello"}'
```

## Error Handling

### 1. Workflow Execution Errors

```typescript
const { success, result, error } = await client.workers.myWorker.generateText({
  prompt: "Hello"
});

if (!success) {
  console.error('Workflow execution failed:', error);
  return;
}
```

### 2. Client-Level Errors

```typescript
import { MindStudioError } from 'mindstudio';

try {
  const client = new MindStudio('invalid-api-key');
} catch (error) {
  if (error instanceof MindStudioError) {
    console.error({
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });
  }
}
```

## Troubleshooting

### Common Issues

1. **Types Not Available**

   ```
   Error: Type-safe workers not available
   ```

   Solution: Run `npx mindstudio sync` to generate type definitions

2. **API Key Issues**

   ```
   Error: API key is required
   ```

   Solution: Ensure your API key is properly set in `.env` or passed to the constructor

3. **Configuration Missing**

   ```
   Error: Failed to load configuration
   ```

   Solution: Run `npx mindstudio sync` to create initial configuration

4. **Type Generation Fails**

   ```
   Error: Failed to generate types
   ```

   Solution: Try running with full sync: `npx mindstudio sync`

## Best Practices

1. **Version Control**
   - Commit `.mindstudio.json` to your repository
   - Add `.env` to `.gitignore`
   - Use `postinstall` script for automatic type generation

2. **Error Handling**
   - Always check `success` before using `result`
   - Implement proper error handling for both workflow and client errors
   - Use TypeScript for better type safety

3. **Team Workflow**
   - Run `sync` after pulling changes that modify `.mindstudio.json`
   - Use `--offline` mode in CI/CD environments
   - Keep worker configurations in sync across team

## License

MIT

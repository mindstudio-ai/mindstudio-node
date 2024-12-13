![MindStudio](https://youai.imgix.net/images/a47f3f3a-a1fa-41ca-8de3-e415452b4611_1731014311207.png?fm=auto)

# MindStudio JavaScript/TypeScript API Library

![NPM Version](https://img.shields.io/npm/v/mindstudio)

Client library for MindStudio AI Workers. Easily integrate and execute AI workflows in your applications with type-safe interfaces.

---

## 🚀 Quick Start

1. **Install the Package**

```bash
npm install mindstudio
```

2. **Get Your API Key**
   - Go to [MindStudio Developer Settings](https://app.mindstudio.ai/workspace/settings/developer?page=api-keys)
   - Create a new API key

3. **Choose Your Usage Pattern**

   **Option A: Type-Safe Usage (Recommended)**

   ```typescript
   try {
     // Initialize the client
     const client = new MindStudio(process.env.MINDSTUDIO_KEY);

     // Execute a workflow
     // Note: Replace 'MyWorker' and 'generateText' with your actual worker and workflow names
     // Run 'npx mindstudio list' to see available workers and workflows
     const { result, billingCost } = await client.workers.MyWorker.generateText({
       prompt: "Write a story about a space cat"
     });

     console.log('Generated text:', result);
     console.log('Execution cost:', billingCost);
   } catch (error) {
     if (error instanceof MindStudioError) {
       console.error('Workflow failed:', error.message);
     }
   }
   ```

   **Option B: Direct Usage**

   ```typescript
   import { MindStudio } from 'mindstudio';
   
   try {
     const client = new MindStudio(process.env.MINDSTUDIO_KEY);
     const { result, billingCost } = await client.run({
       workerId: "your-worker-id",   // Get this from 'npx mindstudio list'
       workflow: "generateText",     // Get this from 'npx mindstudio list'
       variables: {
         prompt: "Write a story about a space cat"
       }
     });

     console.log('Generated text:', result);
     console.log('Execution cost:', billingCost);
   } catch (error) {
     if (error instanceof MindStudioError) {
       console.error('Workflow failed:', error.message);
     }
   }
   ```

---

## Response Format

All workflow executions return a consistent response type:

```typescript
interface WorkflowResponse<T> {
  result: T;            // The workflow execution result
  threadId: string;     // The ID of the response object
  billingCost?: string; // Execution cost in credits (optional)
}
```

---

## 🛠️ CLI Commands

### `sync`

Synchronize worker configurations and generate type definitions:

```bash
npx mindstudio sync [options]

Options:
  --key <apiKey>     Override API key
  --base-url <url>   Override API base URL
  --offline          Generate types from existing config without API calls
  -v, --verbose      Enable verbose logging
```

### `list`

List available workers and their workflows:

```bash
npx mindstudio list [options]

Options:
  --key <apiKey>     Override API key
  --base-url <url>   Override API base URL
  -v, --verbose      Enable verbose logging

# Example output:
📦 Available Workers

Text Generator
Import: workers.TextGenerator

  🔹 Generate Text
    └─ workers.TextGenerator.generateText({ prompt })
       Returns: { text }

──────────────────────────────────────────────────────

Image Generator
Import: workers.ImageGenerator

  🔹 Create Image
    └─ workers.ImageGenerator.createImage({ description, style })
       Returns: { imageUrl }

──────────────────────────────────────────────────────

💡 Run 'npx mindstudio sync' to generate type definitions for these workers
```

### `test`

Test a workflow:

```bash
npx mindstudio test [options]

Options:
  --worker <worker>    Worker name (optional, will prompt if not provided)
  --workflow <name>    Workflow name (optional, will prompt if not provided)
  --input <json>      Input JSON string (optional, will prompt if not provided)
  --key <apiKey>      Override API key
  --base-url <url>    Override API base URL
  -v, --verbose       Enable verbose logging
```

If worker, workflow, or input are not provided, the command will enter interactive mode and prompt for the required information.

---

## 🧑‍💻 Team Usage

1. **Project Owner:**

   ```bash
   # Generate initial configuration and types
   npx mindstudio sync
   
   # Commit .mindstudio.json to version control
   # This ensures consistent type definitions across your team
   ```

2. **Team Members:**

   ```bash
   npm install
   npx mindstudio sync
   ```

Optional: Add to `package.json` for automatic type generation:

```json
{
  "scripts": {
    "postinstall": "npx mindstudio sync"
  }
}
```

---

## 📦 Installation & Setup

### Environment Variables

MindStudio requires an API key for authentication. You can provide it in several ways:

```env
# Option 1: In your shell
export MINDSTUDIO_KEY=your-api-key

# Option 2: In your .env file
MINDSTUDIO_KEY=your-api-key
MINDSTUDIO_BASE_URL=https://custom-api-endpoint.com  # Optional

# Option 3: Pass directly to CLI commands
npx mindstudio sync --key your-api-key
```

For security best practices:

- Never commit API keys to version control
- Add `.env` to your `.gitignore`
- Use environment variables in CI/CD environments

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

---

## ❌ Error Handling

```typescript
import { MindStudio, MindStudioError } from 'mindstudio';

// Workflow execution
try {
  const client = new MindStudio(process.env.MINDSTUDIO_KEY);
  // Note: Replace 'MyWorker' with your actual worker name from 'npx mindstudio list'
  const { result } = await client.workers.MyWorker.generateText({
    prompt: "Hello"
  });
  console.log('Generated text:', result);
} catch (error) {
  if (error instanceof MindStudioError) {
    console.error('Workflow failed:', error.message);
    // Access additional error details if needed
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    console.error('Error details:', error.details);
  }
}

// Client initialization
try {
  const client = new MindStudio('invalid-key');
} catch (error) {
  if (error instanceof MindStudioError) {
    console.error('Client error:', error.message);
  }
}
```

---

## 💡 Common Issues

1. **"Type-safe workers not available"**  
   Run `npx mindstudio sync` to generate type definitions

2. **"API key is required"**  
   Ensure MINDSTUDIO_KEY is set in your environment or passed to the constructor

3. **"Failed to load configuration"**  
   Run `npx mindstudio sync` to create initial configuration

---

## ✨ Best Practices

1. **API Key Security**
   - Store API keys in environment variables
   - Use `.env` files only for local development
   - Never commit API keys to version control
   - Use secure environment variables in CI/CD

2. **Type Safety**
   - Use the type-safe pattern when possible
   - Keep your types up to date by running `sync` after API changes
   - Generated types are available in `dist/src/generated`
   - Commit `.mindstudio.json` to version control for consistent types across your team

3. **Error Handling**
   - Use try-catch blocks to handle errors
   - Check for `MindStudioError` instances for detailed error information
   - Implement proper error logging and monitoring
   - Use TypeScript for better type safety

---

## 📚 Examples

This repository includes example implementations as Git submodules under the `examples/` directory. To get started with the examples:

1. **Clone the repository with examples:**

```bash
git clone --recurse-submodules https://github.com/mindstudio-ai/mindstudio-node.git
```

2. **Or if you've already cloned the repository:**

```bash
git submodule init
git submodule update
```

Each example is maintained in its own repository for clarity and simplicity:

- `examples/mindstudio-nextjs-sample`: Next.js application examples

To explore a specific example:

```bash
cd examples/mindstudio-nextjs-sample
npm install
npm run start
```

Visit each example's README for detailed implementation instructions and explanations.

---

## License

MIT

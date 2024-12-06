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
   // Initialize the client
   const client = new MindStudio(process.env.MINDSTUDIO_KEY);

   // Execute a workflow
   const { success, result } = await client.workers.myWorker.generateText({
     prompt: "Write a story about a space cat"
   });

   // Handle the response
   if (success) {
     console.log(result);
   }
   ```

   **Option B: Direct Usage**

   ```typescript
   import { MindStudio } from 'mindstudio';
   
   const client = new MindStudio(process.env.MINDSTUDIO_KEY);
   const { success, result } = await client.run({
     workerId: "your-worker-id",
     workflow: "generateText",
     variables: {
       prompt: "Write a story about a space cat"
     }
   });
   ```

---

## Response Format

All workflow executions return a consistent response type:

```typescript
interface WorkflowResponse<T> {
  success: boolean;
  result?: T;          // The workflow result when success is true
  error?: Error;       // Error details when success is false
  billingCost?: string // Execution cost in credits
}
```

---

## 🛠️ CLI Commands

### `sync`

Generate type definitions for type-safe usage:

```bash
# With API key in environment
npx mindstudio sync

# With explicit API key
npx mindstudio sync --key your-api-key

# From existing config (CI environments)
npx mindstudio sync --offline
```

### `test`

Test a workflow from the command line:

```bash
npx mindstudio test --worker myWorker --workflow generateText --input '{"prompt":"Hello"}'
```

---

## 🧑‍💻 Team Usage

1. **Project Owner:**

   ```bash
   npx mindstudio sync
   git add .mindstudio.json
   git commit -m "Add MindStudio configuration"
   ```

2. **Team Members:**

   ```bash
   npm install
   npx mindstudio sync --offline
   ```

Optional: Add to `package.json` for automatic type generation:

```json
{
  "scripts": {
    "postinstall": "npx mindstudio sync --offline"
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
// Workflow errors
const { success, result, error } = await client.workers.myWorker.generateText({
  prompt: "Hello"
});

if (!success) {
  console.error('Workflow failed:', error);
  return;
}

// Client errors
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
   - Commit `.mindstudio.json` to version control
   - Run `sync` after pulling changes

3. **Error Handling**
   - Always check `success` before using `result`
   - Implement proper error handling
   - Use TypeScript for better type safety

---

## License

MIT

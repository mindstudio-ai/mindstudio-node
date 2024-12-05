export * from "./worker";
export * from "./client";

// Environment type declarations
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MINDSTUDIO_KEY: string;
    }
  }
}

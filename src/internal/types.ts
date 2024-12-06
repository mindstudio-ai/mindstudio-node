export * from "./workers/types";
export * from "./http/types";

// Environment type declarations
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MINDSTUDIO_KEY: string;
    }
  }
}

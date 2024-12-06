export * from "./workers/types";
export * from "./http/types";
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MINDSTUDIO_KEY?: string;
        }
    }
}

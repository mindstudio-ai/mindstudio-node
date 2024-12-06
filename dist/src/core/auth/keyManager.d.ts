export declare class KeyManager {
    private static readonly API_KEY_ERROR_MESSAGE;
    /**
     * Resolves the API key from available sources in order of precedence:
     * 1. Direct argument
     * 2. Environment variable (MINDSTUDIO_KEY)
     * 3. .env file
     */
    static resolveKey(providedKey?: string): string;
}

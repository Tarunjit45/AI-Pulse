
/**
 * Waits for a specified duration.
 * @param ms milliseconds to wait
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retries a function that returns a promise with exponential backoff.
 * Useful for flaky API calls or rate limits.
 * 
 * @param fn The async function to retry
 * @param retries Maximum number of retries (default 3)
 * @param backoff Initial backoff in ms (default 1000)
 */
export async function withRetry<T>(
    fn: () => Promise<T>, 
    retries: number = 3, 
    backoff: number = 1000,
    fallbackValue?: T
): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries === 0) {
            if (fallbackValue !== undefined) {
                console.warn("Max retries reached. Using fallback value.", error);
                return fallbackValue;
            }
            throw error;
        }

        const isRateLimit = error.message?.includes('429') || error.status === 429;
        const waitTime = isRateLimit ? backoff * 2 : backoff;

        console.log(`Operation failed. Retrying in ${waitTime}ms... (${retries} attempts left). Error: ${error.message}`);
        
        await delay(waitTime);
        return withRetry(fn, retries - 1, waitTime * 1.5, fallbackValue);
    }
}

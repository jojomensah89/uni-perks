/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler<T>(
    fn: (c: any) => Promise<T>
): (c: any) => Promise<T> {
    return async (c: any) => {
        try {
            return await fn(c);
        } catch (error) {
            throw error; // Re-throw to be caught by error middleware
        }
    };
}

/**
 * Try-catch wrapper for repository/service functions
 */
export async function tryCatch<T>(
    fn: () => Promise<T>,
    errorMessage: string = "Operation failed"
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        console.error(`${errorMessage}:`, error);
        throw error;
    }
}

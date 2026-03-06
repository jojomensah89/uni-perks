
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

/**
 * Base application error class
 */
export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public isOperational: boolean = true
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends AppError {
    constructor(resource: string = "Resource") {
        super(`${resource} not found`, 404);
    }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends AppError {
    constructor(message: string = "Bad request") {
        super(message, 400);
    }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401);
    }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, 403);
    }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
    constructor(message: string = "Internal server error") {
        super(message, 500, false);
    }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
    constructor(message: string = "Database operation failed") {
        super(message, 500, false);
    }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
    constructor(
        message: string = "Validation failed",
        public errors?: Record<string, string[]>
    ) {
        super(message, 422);
    }
}

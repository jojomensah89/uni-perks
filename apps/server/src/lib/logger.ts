type LogLevel = "info" | "error";

interface LogPayload {
    message: string;
    scope: string;
    metadata?: Record<string, unknown>;
}

function write(level: LogLevel, payload: LogPayload) {
    if (level === "info" && process.env.NODE_ENV === "production") {
        return;
    }

    const entry = {
        level,
        scope: payload.scope,
        message: payload.message,
        metadata: payload.metadata ?? {},
        timestamp: new Date().toISOString(),
    };

    const serialized = JSON.stringify(entry);
    if (level === "error") {
        console.error(serialized);
        return;
    }
    console.log(serialized);
}

export function logInfo(scope: string, message: string, metadata?: Record<string, unknown>) {
    write("info", { scope, message, metadata });
}

export function logError(scope: string, message: string, metadata?: Record<string, unknown>) {
    write("error", { scope, message, metadata });
}

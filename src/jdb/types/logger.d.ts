import "pino";

declare module "pino" {
    interface BaseLogger {
        exception(exc: unknown): void;
    }
}

export {};

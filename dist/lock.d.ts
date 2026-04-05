export declare class AsyncLock {
    private isHeld;
    private waiters;
    acquire(): Promise<null>;
    release(): void;
}
//# sourceMappingURL=lock.d.ts.map
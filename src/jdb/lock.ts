export class AsyncLock {
    private isHeld: boolean = false;
    private waiters: Array<() => void> = [];

    acquire(): Promise<null> {
        if (this.isHeld === false) {
            this.isHeld = true;
            return new Promise((resolve: ResolveFn<null>, ..._) => {resolve(null);});
        } else {
            return new Promise((resolve: ResolveFn<null>, reject: RejectFn) => {
                reject;  // UNUSED VARIABLE
                this.waiters.push(() => resolve(null));
            });
        }
    }

    release(): void {
        if (this.waiters.length >= 1) {
            const fn = this.waiters.shift();
            if (fn !== undefined) {
                fn();
                return;
            }
        }
        this.isHeld = false;
    }
}

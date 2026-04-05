export class AsyncLock {
    isHeld = false;
    waiters = [];
    acquire() {
        if (this.isHeld === false) {
            this.isHeld = true;
            return new Promise((resolve, ..._) => { resolve(null); });
        }
        else {
            return new Promise((resolve, reject) => {
                reject; // UNUSED VARIABLE
                this.waiters.push(() => resolve(null));
            });
        }
    }
    release() {
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
//# sourceMappingURL=lock.js.map
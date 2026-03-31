type ResolveFn<T> = (value: T | PromiseLike<T>) => void;

type RejectFn = (reason?: any) => void;

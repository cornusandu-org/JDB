import type { DatabaseManager } from "./index.js";
import type { AsyncLock } from "./lock.js";
export declare class Transaction {
    #private;
    data: {
        name: string;
        index: Map<string, IndexType>;
        records: Map<Hash256Type, Map<string, unknown>>;
    };
    getData: () => DBDataType;
    constructor(data: {
        name: string;
        index: Map<string, IndexType>;
        records: Map<Hash256Type, Map<string, unknown>>;
    }, dbHook: DatabaseManager, lock: AsyncLock, getData: () => DBDataType);
    commit(): Promise<void>;
}
//# sourceMappingURL=transaction.d.ts.map
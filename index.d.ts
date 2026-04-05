import { JDB_DB_MKTRANSACTION_NOENTRY, JDBError } from './exceptions.js';
import { AsyncLock } from './lock.js';
import { Transaction } from './transaction.js';
export declare class DatabaseManager {
    #private;
    path: string;
    _promise_queue: Array<Promise<any>>;
    errors: Array<Error>;
    access_lock: AsyncLock;
    name: string;
    constructor(dbname: string);
    then(resolve: ResolveFn<[boolean, JDBError | null]>, reject: RejectFn): Promise<void>;
    table_exists(name: string): Promise<boolean>;
    mktable(name: string, fields?: Array<string>): Promise<void>;
    transaction(tableName: string): Promise<Transaction | JDB_DB_MKTRANSACTION_NOENTRY>;
    flushToDisk(): Promise<void>;
    flushToDiskNow(): Promise<[boolean, Error | null]>;
}
//# sourceMappingURL=index.d.ts.map
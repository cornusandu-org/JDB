import { JDB_TRANSACTION_INTERNAL_FAILEDTOCOMMIT_NOENTRY } from "./exceptions.js";
import { codes, getLog } from "./getlog.js";
import logger from "./logger.js";
// TODO: Finish Implementing (write, read, query, etc.)
export class Transaction {
    data;
    #dbHook;
    #lock;
    getData;
    constructor(data, dbHook, lock, getData) {
        this.data = data;
        this.#dbHook = dbHook;
        this.#lock = lock;
        this.#lock.acquire();
        this.getData = getData;
        if (false) { }
        ; // if invalid input data, throw new error
    }
    async commit() {
        let i = 0;
        for (const table of this.getData().tables) {
            if (table.name === this.data.name) {
                await this.#dbHook.access_lock.acquire();
                this.getData().tables[i] = this.data;
                await this.#dbHook.access_lock.release();
                this.#lock.release();
                return;
            }
            i++;
        }
        const err = new JDB_TRANSACTION_INTERNAL_FAILEDTOCOMMIT_NOENTRY(getLog(codes.JDB_TRANSACTION_INTERNAL_FAILEDTOCOMMIT_NOENTRY));
        logger.error(err, "An internal error occured in Transaction:commit");
        throw err;
    }
}
//# sourceMappingURL=transaction.js.map
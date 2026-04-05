import { JDB_TRANSACTION_CANCELTOOLATE, JDB_TRANSACTION_COMMITTOOLATE, JDB_TRANSACTION_INTERNAL_FAILEDTOCOMMIT_NOENTRY, JDB_TRANSACTION_RECANCEL, JDB_TRANSACTION_RECOMMIT } from "./exceptions.js";
import { codes, getLog } from "./getlog.js";
import logger from "./logger.js";
const TransactionStatus = Object.freeze({
    InProgress: 0n,
    Committed: 1n,
    Canceled: 2n,
});
// TODO: Finish Implementing (write, read, query, etc.)
export class Transaction {
    data;
    #dbHook;
    #lock;
    getData;
    status;
    constructor(data, dbHook, lock, getData) {
        this.data = data;
        this.#dbHook = dbHook;
        this.#lock = lock;
        this.#lock.acquire();
        this.getData = getData;
        this.status = TransactionStatus.InProgress;
        if (false) { }
        ; // TODO: if invalid input data, throw new error
    }
    async commit() {
        if (this.status === TransactionStatus.Committed) {
            const err = new JDB_TRANSACTION_RECOMMIT(getLog(codes.JDB_TRANSACTION_RECOMMIT0));
            logger.error(err, `Failed to commit transaction for table ${this.data.name}.`);
            throw err;
        }
        if (this.status === TransactionStatus.Canceled) {
            const err = new JDB_TRANSACTION_COMMITTOOLATE(getLog(codes.JDB_TRANSACTION_COMMITTOOLATE0));
            logger.error(err, `Failed to commit transaction for table ${this.data.name}.`);
            throw err;
        }
        let i = 0;
        for (const table of this.getData().tables) {
            if (table.name === this.data.name) {
                await this.#dbHook.access_lock.acquire();
                this.getData().tables[i] = this.data;
                await this.#dbHook.access_lock.release();
                this.#lock.release();
                this.status = TransactionStatus.Committed;
                return;
            }
            i++;
        }
        const err = new JDB_TRANSACTION_INTERNAL_FAILEDTOCOMMIT_NOENTRY(getLog(codes.JDB_TRANSACTION_INTERNAL_FAILEDTOCOMMIT_NOENTRY));
        logger.error(err, "An internal error occured in Transaction:commit");
        throw err;
    }
    async cancel() {
        if (this.status === TransactionStatus.Committed) {
            const err = new JDB_TRANSACTION_CANCELTOOLATE(getLog(codes.JDB_TRANSACTION_CANCELTOOLATE0));
            logger.error(err, `Failed to commit transaction for table ${this.data.name}.`);
            throw err;
        }
        if (this.status === TransactionStatus.Canceled) {
            const err = new JDB_TRANSACTION_RECANCEL(getLog(codes.JDB_TRANSACTION_RECANCEL));
            logger.warn(err, "Unintended use of transactions. Are you sure this isn't a mistake?");
        }
        this.status = TransactionStatus.Canceled;
        this.#lock.release();
    }
}
//# sourceMappingURL=transaction.js.map
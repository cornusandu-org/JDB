import { JDB_TRANSACTION_CANCELTOOLATE, JDB_TRANSACTION_COMMITTOOLATE, JDB_TRANSACTION_INTERNAL_FAILEDNOENTRY, JDB_TRANSACTION_RECANCEL, JDB_TRANSACTION_RECOMMIT } from "./exceptions.js";
import { codes, getLog } from "./getlog.js";
import type { DatabaseManager } from "./index.js";
import type { AsyncLock } from "./lock.js";
import logger from "./logger.js";
import { UUIDv7 } from "./uuid.js";

const TransactionStatus: Record<string, BigInt> = Object.freeze({
    InProgress: 0n,
    Committed: 1n,
    Canceled: 2n,
} as const);

// TODO: Finish Implementing (write, read, query, etc.)
export class Transaction {
    data: {
        name: string,
        index: Map<string, IndexType>,
        fields: Array<string>,
        strictfields: boolean,
        records: Map<UUIDv7, Map<string, unknown>>
    };
    #dbHook: DatabaseManager;
    #lock: AsyncLock;
    getData: () => DBDataType;
    status: BigInt;

    constructor(data: {
                    name: string,
                    index: Map<string, IndexType>,
                    fields: Array<string>,
                    strictfields: boolean,
                    records: Map<UUIDv7, Map<string, unknown>>
                },
                dbHook: DatabaseManager, lock: AsyncLock, getData: () => DBDataType) {

        this.data = data;
        this.#dbHook = dbHook;
        this.#lock = lock;
        this.#lock.acquire();
        this.getData = getData;
        this.status = TransactionStatus.InProgress as BigInt;
        if (data === null || data === undefined || data.name === "" || dbHook === null || dbHook === undefined || lock === null || lock === undefined || typeof getData != "function") {
            const err = new JDB_TRANSACTION_INTERNAL_FAILEDNOENTRY(getLog(codes.JDB_TRANSACTION_INTERNAL_FAILEDNOENTRY));
            logger.error(err, `Failed to initialise transaction for table ${this.data.name}.`);
            throw err;
        };
    }

    async commit(): Promise<void> {
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
        await this.__internal_acquireGlobalLock();
        this.getData().tables[await this.__internal_getTableIndex()] = this.data;
        await this.__internal_releaseGlobalLock();
    }

    async cancel(): Promise<void> {
        if (this.status === TransactionStatus.Committed) {
            const err = new JDB_TRANSACTION_CANCELTOOLATE(getLog(codes.JDB_TRANSACTION_CANCELTOOLATE0));
            logger.error(err, `Failed to commit transaction for table ${this.data.name}.`);
            throw err;
        }
        if (this.status === TransactionStatus.Canceled) {
            const err = new JDB_TRANSACTION_RECANCEL(getLog(codes.JDB_TRANSACTION_RECANCEL));
            logger.warn(err, "Unintended use of transactions. Are you sure this isn't a mistake?");
        }
        this.status = TransactionStatus.Canceled as BigInt;
        this.#lock.release();
    }

    async insert(value: object | Record<string, any>): Promise<void> {
        const uuid = UUIDv7.s256();
        const map = new Map<string, unknown>();

        for (const field of this.data.fields) {
            map.set(field, Reflect.get(value, field));
        }

        this.data.records.set(uuid, map);
    }

    private async __internal_acquireGlobalLock() {
        return await this.#dbHook.access_lock.release();
    }

    private async __internal_releaseGlobalLock() {
        return await this.#dbHook.access_lock.release();
    }

    private async __internal_getTableIndex() {
        this.__internal_acquireGlobalLock();  // Handles reentrancy
        
        let i = -1;
        for (const table of this.getData().tables) {
            i++;
            if (table.name === this.data.name) {
                break;
            }
        }

        if (i === -1) {
            const err = new JDB_TRANSACTION_INTERNAL_FAILEDNOENTRY(getLog(codes.JDB_TRANSACTION_INTERNAL_FAILEDNOENTRY).replaceAll("%table%", this.data.name));
            logger.error(err, "An internal error occured in Transaction:__internal_getTableIndex");
            throw err;
        }

        this.__internal_releaseGlobalLock();

        return i;
    }
}

import logger from './logger.js';
import fs, { readFileSync } from "fs";
import path from "path";
import { getLog, codes } from './getlog.js';
import { JDB_DB_INTERNAL_MKTRANSACTION_MISSINGDATA, JDB_DB_INVALIDCONTROLFLOW, JDB_DB_MKTABLE_EXISTS, JDB_DB_MKTABLE_F1, JDB_DB_MKTRANSACTION_NOENTRY, JDB_DBINIT_INVPATH, JDBError } from './exceptions.js';
import { AsyncLock } from './lock.js';
import { encode, decode } from "@msgpack/msgpack";
import { EventEmitter } from "events";
import { Transaction } from './transaction.js';
let dbm_constructed = false;
function onceAsync(emitter, event) {
    return new Promise((resolve, reject) => {
        emitter.once(event, (...args) => resolve(args));
        emitter.once("error", reject);
    });
}
export class DatabaseManager {
    path;
    _promise_queue;
    errors = [];
    access_lock;
    #data;
    #locks;
    constructor(dbname) {
        this._promise_queue = [];
        this.path = "";
        this.access_lock = new AsyncLock();
        this.#data = { tables: [] }; // placeholder value until fully initialised
        this.#locks = new Map();
        this._promise_queue.push(new Promise((resolve, reject) => {
            reject;
            try {
                this.path = path.join("private", "assets", `${dbname}.db`);
                ;
                fs.mkdirSync("./private/assets/", { recursive: true });
                if (!fs.existsSync(this.path)) {
                    if (!dbm_constructed) {
                        logger.info("Thank you for using JDB! Please remember that JDB is licensed under AGPL 3.19, and any code using it has to use the same license.");
                    }
                    ;
                    fs.writeFileSync(this.path, "");
                    this.#data = {
                        tables: []
                    };
                }
                else {
                    const buff = readFileSync(this.path);
                    if (buff.length === 0) {
                        this.#data = { tables: [] };
                    }
                    else {
                        this.#data = decode(buff);
                    }
                }
                dbm_constructed = true;
                resolve(null);
            }
            catch (e) {
                dbm_constructed = true;
                logger.error(e, getLog(codes.JDB_DBINIT_INVPATH));
                this.path = './ERROR/ERRORVALUE';
                fs.mkdirSync("./ERROR", { recursive: true });
                if (!fs.existsSync(this.path)) {
                    fs.writeFileSync(this.path, "");
                }
                this.errors.push(new JDB_DBINIT_INVPATH(getLog(codes.JDB_DBINIT_INVPATH)));
                resolve(new JDB_DBINIT_INVPATH(getLog(codes.JDB_DBINIT_INVPATH)));
            }
            for (const table of this.#data.tables) {
                this.#locks.set(table.name, new AsyncLock());
            }
            return;
        }));
    }
    then(resolve, reject) {
        return (async (me) => {
            try {
                await me.access_lock.acquire();
                const results = await Promise.all(this._promise_queue);
                me.access_lock.release();
                const error = results.find(x => x instanceof JDBError) ?? null;
                resolve([error !== null, error]);
                return;
            }
            catch (e) {
                me.access_lock.release();
                reject(e);
                return;
            }
            logger.error(getLog(codes.JDB_DB_INVALIDCONTROLFLOW));
            throw new JDB_DB_INVALIDCONTROLFLOW("error in DatabaseManager:then\n" + getLog(codes.JDB_DB_INVALIDCONTROLFLOW));
        })(this);
    }
    async table_exists(name) {
        await this.access_lock.acquire();
        for (const t of this.#data.tables) {
            if (t.name === name) {
                await this.access_lock.release();
                return true;
            }
        }
        await this.access_lock.release();
        return false;
    }
    async mktable(name) {
        await this.access_lock.acquire();
        this._promise_queue.push(new Promise((resolve, ..._) => {
            const bus = new EventEmitter();
            const wait = async () => {
                await onceAsync(bus, "done");
                return await this.#sync();
            };
            this._promise_queue.push(wait());
            try {
                for (const t of this.#data.tables) {
                    if (t.name === name) {
                        // TODO: Optimize
                        this.errors.push(new JDB_DB_MKTABLE_EXISTS(getLog(codes.JDB_DB_MKTABLE_EXISTS).replace("%table%", name)));
                        logger.error(getLog(codes.JDB_DB_MKTABLE_EXISTS).replace("%table%", name));
                        resolve([true, new JDB_DB_MKTABLE_EXISTS(getLog(codes.JDB_DB_MKTABLE_EXISTS).replace("%table%", name))]);
                        return;
                    }
                }
                this.#data.tables.push({
                    name: name,
                    index: new Map(Object.entries({
                        "id": {
                            type: 'int',
                            entries: {}
                        }
                    })),
                    records: new Map()
                });
                logger.info(`Added new table: ${name}`);
                this.#locks.set(name, new AsyncLock());
                resolve([false, null]);
            }
            catch (err) {
                // TODO: Optimize
                this.errors.push(new JDB_DB_MKTABLE_F1(getLog(codes.JDB_DB_MKTABLE_F1).replace("%table%", name)));
                logger.error(err, getLog(codes.JDB_DB_MKTABLE_F1).replace("%table%", name));
                resolve([true, new JDB_DB_MKTABLE_F1(getLog(codes.JDB_DB_MKTABLE_F1).replace("%table%", name))]);
            }
            bus.emit("done");
            this.access_lock.release();
            return;
        }));
    }
    async transaction(tableName) {
        if (!this.table_exists(tableName)) {
            const err = new JDB_DB_MKTRANSACTION_NOENTRY(getLog(codes.JDB_DB_MKTRANSACTION_NOENTRY));
            logger.error(err, "An unexpected error occured in DatabaseManager:transaction. Are you sure the entered table name does not include any typos?");
            return err;
        }
        let tableData = null;
        for (const table of this.#data.tables) {
            if (table.name === tableName) {
                tableData = table;
            }
        }
        if (tableData === null) {
            const err = new JDB_DB_INTERNAL_MKTRANSACTION_MISSINGDATA(getLog(codes.JDB_DB_INTERNAL_MKTRANSACTION_MISSINGDATA));
            logger.error(err, "This is most likely not an issue on your side. If you're seeing this, please report it.");
            throw err;
        }
        return new Transaction(structuredClone(tableData), this, this.#locks.get(tableName), () => this.#data);
    }
    async #sync() {
        // TODO: Use async functions here
        logger.info(`Saving db ${this.path} to disk`);
        await this.access_lock.acquire();
        const data = encode(this.#data);
        fs.writeFileSync(this.path, data);
        this.access_lock.release();
        return [false, null]; // TODO: Add error handling
    }
    async flushToDisk() {
        this._promise_queue.push(this.#sync());
    }
    async flushToDiskNow() {
        return await this.#sync();
    }
}
//# sourceMappingURL=index.js.map
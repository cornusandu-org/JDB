import logger from './logger.js';
import fs from "fs";
import path from "path";
import { getLog, codes } from './getlog.js';
import { JDB_DB_INVALIDCONTROLFLOW, JDB_DBINIT_INVALIDCONTROLFLOW, JDB_DBINIT_INVPATH, JDBError } from './exceptions.js';
import { AsyncLock } from './lock.js';

let dbm_constructed: boolean = false;

const uninitialised = Symbol("uninitialised");
type MaybeUninit<T> = T | typeof uninitialised;

let _: MaybeUninit<number> = 2; _;

export class DatabaseManager {
    path: string;
    _promise_queue: Array<Promise<any>>;
    access_lock: AsyncLock;
    #data?: [
        tables: Array<[
            name: string,
            records: Map<string, any>
        ]>
    ];
    
    constructor(dbname: string) {
        this.#data;  // unused variable

        if (dbm_constructed === false) {
            logger.info("Thank you for using JDB! Please remember that JDB is licensed under AGPL 3.19, and any code using it has to use the same license.")
            dbm_constructed = true;
        }

        this._promise_queue = [];
        this.path = "";
        this.access_lock = new AsyncLock();

        this._promise_queue.push(new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            reject;
            try {
                this.path = path.join("private", "assets", `${dbname}.db`);;
                fs.mkdirSync("./private/assets/", { recursive: true });
                if (!fs.existsSync(this.path)) {
                    fs.writeFileSync(this.path, "");
                }
                resolve(null);
                return;
            } catch (e) {
                logger.error(e, getLog(codes.JDB_DBINIT_INVPATH));
                this.path = './ERROR/ERRORVALUE';
                fs.mkdirSync("./ERROR", { recursive: true });
                if (!fs.existsSync(this.path)) {
                    fs.writeFileSync(this.path, "");
                }
                resolve(new JDB_DBINIT_INVPATH(getLog(codes.JDB_DBINIT_INVPATH)));
                return;
            }
            logger.error(getLog(codes.JDB_DBINIT_INVALIDCONTROLFLOW));
            throw new JDB_DBINIT_INVALIDCONTROLFLOW("error in DatabaseManager:constructor\n" + getLog(codes.JDB_DBINIT_INVALIDCONTROLFLOW));
        }));
    }

    then(resolve: ResolveFn<[boolean, JDBError | null]>, reject: RejectFn) {
        return (async (me) => {
            try {
                await me.access_lock.acquire();
                const results = await Promise.all(this._promise_queue);
                me.access_lock.release();
                const error = results.find(x => x instanceof JDBError) ?? null;
                resolve([error !== null, error]);
                return;
            } catch (e) {
                me.access_lock.release();
                reject(e);
                return;
            }
            logger.error(getLog(codes.JDB_DB_INVALIDCONTROLFLOW));
            throw new JDB_DB_INVALIDCONTROLFLOW("error in DatabaseManager:then\n" + getLog(codes.JDB_DB_INVALIDCONTROLFLOW));
        })(this);
    }
}

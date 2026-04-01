import logger from './logger.js';
import fs, { readFileSync } from "fs";
import path from "path";
import { getLog, codes } from './getlog.js';
import { JDB_DB_INVALIDCONTROLFLOW, JDB_DBINIT_INVALIDCONTROLFLOW, JDB_DBINIT_INVPATH, JDBError } from './exceptions.js';
import { AsyncLock } from './lock.js';
import { decode } from "@msgpack/msgpack";

let dbm_constructed: boolean = false;

export class DatabaseManager {
    path: string;
    _promise_queue: Array<Promise<any>>;
    access_lock: AsyncLock;
    #data: DBDataType;
    
    constructor(dbname: string) {
        this._promise_queue = [];
        this.path = "";
        this.access_lock = new AsyncLock();
        this.#data = {tables:[]};  // placeholder value until fully initialised
        this.#data;  // silence linter errors

        this._promise_queue.push(new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            reject;
            try {
                this.path = path.join("private", "assets", `${dbname}.db`);;
                fs.mkdirSync("./private/assets/", { recursive: true });
                if (!fs.existsSync(this.path)) {
                    if (!dbm_constructed) {logger.info("Thank you for using JDB! Please remember that JDB is licensed under AGPL 3.19, and any code using it has to use the same license.")};
                    fs.writeFileSync(this.path, "");
                    this.#data = {
                        tables: []
                    } as DBDataType;
                } else {
                    const buff = readFileSync(this.path);
                    if (buff.length === 0) {
                        this.#data = { tables: [] };
                    } else {
                        this.#data = decode(buff) as DBDataType;
                    }
                }
                dbm_constructed = true;
                resolve(null);
                return;
            } catch (e) {
                dbm_constructed = true;
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

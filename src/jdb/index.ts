import logger from './logger.js';
import fs from "fs";
import path from "path";

let dbm_constructed: boolean = false;

export class DatabaseManager {
    path: string;
    
    constructor(dbname: string) {
        if (dbm_constructed === false) {
            logger.info("Thank you for using JDB! Please remember that JDB is licensed under AGPL 3.19, and any code using it has to use the same license.")
            dbm_constructed = true;
        }

        try {
            this.path = this.path = path.join("private", "assets", `${dbname}.db`);;
            fs.mkdirSync("./private/assets/", { recursive: true });
            if (!fs.existsSync(this.path)) {
                fs.writeFileSync(this.path, "");
            }
        } catch (e) {
            logger.error(e, "An unexpected error occured! Please make sure your database name does not include any slashes or backslashes!");
            this.path = './ERROR/ERRORVALUE';
            fs.mkdirSync("./ERROR", { recursive: true });
            if (!fs.existsSync(this.path)) {
                fs.writeFileSync(this.path, "");
            }
        }
    }
}

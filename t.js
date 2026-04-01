// Testing File

import { DatabaseManager } from './dist/index.js';

const db = new DatabaseManager("asd");
let v;
if ((v = await db)[0]) throw v[1];
if (!await db.table_exists("test")) {
    await db.mktable("test");
    if ((v = await db)[0]) throw v[1];
}

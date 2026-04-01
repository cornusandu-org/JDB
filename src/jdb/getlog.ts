import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, 'assets', 'errors.json');
const raw = readFileSync(filePath, 'utf-8');
const errors: Record<string, string> = JSON.parse(raw);

export function getLog(key: string): string {
    return `(${key}) ` + String(errors[key]);
}

export const codes = Object.freeze({
    JDB_DBINIT_INVPATH: "JDB_DBINIT_INVPATH",
    JDB_DBINIT_INVALIDCONTROLFLOW: "JDB_DBINIT_INVALIDCONTROLFLOW",
    JDB_DB_INVALIDCONTROLFLOW: "JDB_DB_INVALIDCONTROLFLOW",
    JDB_INTERNAL_B64_WRONGINPUTSIZE1: "JDB_INTERNAL_B64_WRONGINPUTSIZE1",
    JDB_INTERNAL_B64_WRONGINPUTSIZE2: "JDB_INTERNAL_B64_WRONGINPUTSIZE2"
} as const);

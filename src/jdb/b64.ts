import { JDB_INTERNAL_B64_WRONGINPUTSIZE } from "./exceptions.js";
import { codes, getLog } from "./getlog.js";
import logger from "./logger.js";

export function toBase64(bytes: RawHash256Type): Hash256Type {
    if (bytes.length !== 32) {
        logger.error(getLog(codes.JDB_INTERNAL_B64_WRONGINPUTSIZE1).replace("%byt%", String(bytes.length)));
        throw new JDB_INTERNAL_B64_WRONGINPUTSIZE(getLog(codes.JDB_INTERNAL_B64_WRONGINPUTSIZE1).replace("%byt%", String(bytes.length)));
    }

    return Buffer.from(bytes).toString("base64") as Base64;
}

export function fromBase64(b64: Hash256Type): RawHash256Type {
    const d: RawHash256Type = new Uint8Array(Buffer.from(b64, "base64")) as RawHash256Type;

    if (d.length !== 32) {
        logger.error(getLog(codes.JDB_INTERNAL_B64_WRONGINPUTSIZE2).replace("%byt%", String(d.length)));
        throw new JDB_INTERNAL_B64_WRONGINPUTSIZE(getLog(codes.JDB_INTERNAL_B64_WRONGINPUTSIZE2).replace("%byt%", String(d.length)));
    }

    return d as RawHash256Type;
}

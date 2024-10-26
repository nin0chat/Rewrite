import { __DEV__ } from "./constants";

function getDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
}

export class Yapper {
    constructor() {}
    trace(obj) {
        if (__DEV__) console.log("\x1b[90;1m TRC\x1b[90;1m \x1b[0;90m", getDateTime(), obj);
    }
    debug(obj) {
        if (__DEV__)
            console.log("\x1b[90;1;47m DBG", `\x1b[0m \x1b[90m${getDateTime()}`, obj, "\x1b[0m");
    }
    info(obj) {
        if (__DEV__) console.log("\x1b[44;1m INF", `\x1b[0m \x1b[90m${getDateTime()}\x1b[0m`, obj);
    }
    warn(obj) {
        console.log("\x1b[43;1m WRN", `\x1b[0m \x1b[90m${getDateTime()}\x1b[0m`, obj);
    }
    error(obj) {
        console.log("\x1b[41;1m ERR", `\x1b[0m \x1b[90m${getDateTime()}\x1b[0m`, obj);
    }
    fatal(obj) {
        console.log(
            "\x1b[40;31;1m FTL",
            `\x1b[0m \x1b[31;1m${getDateTime()}\x1b[0;31m`,
            obj,
            "\x1b[0m"
        );
    }
    child() {
        return new Yapper();
    }
    level; // unused
    silent; // unused
}

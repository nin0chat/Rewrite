// @ts-nocheck
import * as cluster from "cluster";

export class Snowflake {
    static readonly EPOCH = 1729373102932n; // Sat, 26 Oct 2024 00:19:47 UTC
    static INCREMENT = 0n; // Max 4095
    static processId = BigInt(process.pid % 31); // max 31
    static workerId = BigInt((cluster.worker?.id || 0) % 31); // max 31

    /**
     * Generates a snowflake id
     *
     * @returns {string} The generated snowflake as a string
     */
    static generate() {
        if (Snowflake.INCREMENT >= 4095) Snowflake.INCREMENT = 0n;

        const time = BigInt(BigInt(Date.now()) - Snowflake.EPOCH) << 22n;
        const worker = Snowflake.workerId << 17n;
        const process = Snowflake.processId << 12n;
        const increment = Snowflake.INCREMENT++;

        return BigInt(time | worker | process | increment).toString();
    }

    /**
     * Deconstructs a snowflake.
     *
     * @param snowflake Snowflake to deconstruct
     * @returns Deconstructed snowflake
     */
    static deconstruct(snowflake: string) {
        const rawValue = BigInt(snowflake);

        return {
            timestamp: new Date(Number((rawValue >> 22n) + Snowflake.EPOCH)),
            workerID: Number((rawValue & 0x3e0000n) >> 17n),
            processID: Number((rawValue & 0x1f000n) >> 12n),
            increment: Number(rawValue & 0xfffn),
            rawValue
        };
    }
}

/**
 * The log levels.
 * - INFO: Informational messages.
 * - WARN: Warnings.
 * - ERR: Errors.
 * - RESET: Resets the console color.
 */
type LogLevel = "INFO" | "WARN" | "ERR" | "RESET";

/**
 * Logs a message to the console with a timestamp and color-coded log level.
 * @param level The log level.
 * @param args The message to log.
 * @returns void
 */
export function log(level: LogLevel, ...args: any[]) {
    const colorMap: { [key in LogLevel]: string } = {
        "INFO": "\x1b[44m",
        "WARN": "\x1b[43m",
        "ERR": "\x1b[41m",
        "RESET": "\x1b[0m"
    };

    const timestamp = new Date().toLocaleString();
    console.log(`${colorMap[level]}[${level}]${colorMap.RESET} (${timestamp})`, ...args);
}

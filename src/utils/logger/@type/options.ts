import { LogLevel } from "./level"
import { Color } from "./color"

import { Logger } from ".."

export interface ILoggerOptions {
    name: string,
    color?: Color,
    parent?: Logger,
    logLevel?: LogLevel
}
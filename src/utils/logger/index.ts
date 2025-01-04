import dayjs from "dayjs";
import { writeFileSync } from "fs";
import { join } from "path";

// @type
import { Color, ILoggerOptions, LogLevel } from "./@type";

// constants
import { PATH_LOGFILE } from "../../constant";

class Logger {
    parent: Logger | undefined
    tag: string
    name: string
    color: Color
    logLevel: LogLevel
    

    constructor(options: ILoggerOptions) {
        this.name = options.name

        // Color
        if (!options.color)
            // DEFAULT
            this.color = Color.RESET
        else 
            this.color = options.color
            
        // LogLevel
        if (!options.logLevel) 
            // DEFAULT
            this.logLevel = LogLevel.INFO
        else
            this.logLevel = options.logLevel

        // Parent
        if (options.parent)
            this.tag = `${options.parent.tag}${this.color}[${this.name}]${Color.RESET}`
        else
            this.tag = `${this.color}[${this.name}]${Color.RESET}`
    }

    private get timestamp(): string {
        return `${Color.BLUE}[${dayjs().format("HH:mm ss.SSS")}ms]${Color.RESET}`
    }

    private get header(): string {
        return `${this.timestamp}${this.tag}`
    }

    private print(data: string) {
        writeFileSync(PATH_LOGFILE, `${data}\n`, { flag: 'a' })
        console.log(data)
    }

    childCategory(name: string): Logger {
        return new Logger({
            name: name,
            color: this.color,
            logLevel: this.logLevel,
            parent: this
        })
    }

    debug(text: string) {
        // Level: 0
        if (this.logLevel <= LogLevel.DEBUG) {
            this.print(`${this.header} ${text}`)
        }
    }

    info(text: string) {
        // Level: 1
        if (this.logLevel <= LogLevel.INFO) {
            this.print(`${this.header} ${text}`)
        }
    }

    warn(text: string) {
        // Level: 2
        if (this.logLevel <= LogLevel.WARNING) {
            this.print(`${this.header} ${Color.YELLOW}${text}${Color.RESET}`)
        }
    }

    error(err: Error) {
        // Level: 3
        if (this.logLevel <= LogLevel.ERROR) {
            this.print(`${this.header} ${Color.RED}${err.message}${Color.RESET}`)
            console.error(err.stack)
        }
    }
}

export { Logger }
import { Mutex } from "async-mutex";
import { existsSync, readFileSync, writeFileSync } from "fs";

// components
import { SettingEventEmitter, SettingEventType } from "./event";
import { LIST_SETTING } from "./@constant/setting";
import { LIST_CATEGORY } from "./@constant/category";
import { Setting } from "./instance";

// @decorator
import { mutex } from "../@decorator/mutex";

// @types
import { ICategory, SettingKeys } from "./@type";

// constant
import { PATH_SETTING } from "../constant";
import { Logger } from "../utils/logger";
import { Color } from "../utils/logger/@type";

const resourcesMutex = new Mutex()
export class Settings {
    private static eventEmitter = new SettingEventEmitter<SettingEventType>()
    private static log: Logger = new Logger({
        name: "Setting",
        color: Color.MAGENTA
    })
    private static debounceTimeout: NodeJS.Timeout | undefined = undefined
    private static DUMP_DELAY = 5000

    static on(eventName: SettingKeys, handler: (value: any) => void) {
        this.eventEmitter.on(eventName, handler)
    }

    static off(eventName: SettingKeys, handler: (value: any) => void) {
        this.eventEmitter.off(eventName, handler)
    }

    static has(key: string): SettingKeys | undefined {
        const values = Object.values(SettingKeys).filter(value => typeof value === "string") as string[]

        return values.includes(key) ? (key as SettingKeys) : undefined
    }

    static get(key: SettingKeys): Setting | undefined {
        return LIST_SETTING.get(key)
    }

    static getValue(key: SettingKeys): any | undefined {
        return LIST_SETTING.get(key)?.value ?? undefined
    }

    static getAll(): Setting[] {
        return [...LIST_SETTING.values()]
    }

    static getCategories(): ICategory[] {
        return [...LIST_CATEGORY.values()]
    }

    @mutex(resourcesMutex)
    static async set(key: SettingKeys, value: any, dump: boolean = true): Promise<boolean> {
        let setting = LIST_SETTING.get(key)

        if (setting && setting.evaluate(value)) {
            setting.value = value

            if (dump) this.scheduleDump()

            this.log.debug(`Updated ${setting.key}: ${setting.value}`)
            this.eventEmitter.emit(key, setting.value)
            return true
        }

        return false
    }

    @mutex(resourcesMutex)
    static async reset(key: SettingKeys): Promise<boolean> {
        let setting = LIST_SETTING.get(key)

        if (setting && setting.defaultValue !== undefined) {
            setting.value = setting.defaultValue
            return true
        }
        
        return false
    }

    @mutex(resourcesMutex)
    static async load(): Promise<void> {
        if (existsSync(PATH_SETTING)) {
            let raw = readFileSync(PATH_SETTING, { encoding: "utf-8" })

            try {
                let obj = JSON.parse(raw)
                for (let [key, value] of Object.entries(obj)) {
                    if (key === "__comment") continue
                    
                    let parsedKey = this.has(key)
                    if (parsedKey) {
                        this.set(parsedKey, value, false)
                    }
                }
            }catch(err) {
                this.log.error(new Error("Failed to load setting!"))
            }
        }else this.log.warn("Settings file not found!")   
    }

    @mutex(resourcesMutex)
    private static async dump(): Promise<void> {
        let output: { [key: string]: any } = {
            "__comment": "If you don't know what you're doing, please do not modify this file"
        }

        let arr = [...LIST_SETTING.values()]
        arr.forEach(setting => {
            output[setting.key] = setting.value
        })

        writeFileSync(PATH_SETTING, JSON.stringify(output, null, 4), { encoding: "utf-8" })
        this.log.info("Dumped settings.json!")
    }

    static scheduleDump(): void {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout)
        }
        
        this.debounceTimeout = setTimeout(this.dump.bind(this), this.DUMP_DELAY)
    }
}
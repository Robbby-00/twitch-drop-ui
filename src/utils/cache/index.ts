import { Logger } from "../logger";

interface CacheOptions<T> {
    data?: T
    logger?: Logger
}

export class Cache<T> {
    private logger: Logger | undefined
    private data: T | undefined
    private cacheDuration: number
    private lastUpdate: number = 0
    private updateFunction: () => Promise<T>

    public constructor(updateFunction: () => Promise<T>, cacheDuration: number, options?: CacheOptions<T>) {
        this.updateFunction = updateFunction
        this.cacheDuration = cacheDuration

        if (options?.data) {
            this.lastUpdate = Date.now()
            this.data = options?.data
        }

        if (options?.logger) {
            this.logger = options.logger
        }
    }

    private async __updateFunction(): Promise<T> {
        if (this.logger) {
            this.logger.debug("Calling update function")
        }

        return await this.updateFunction()
    }

    public async get(): Promise<T> {
        const now = Date.now()

        if (this.data === undefined || (now - this.lastUpdate) > this.cacheDuration) {
            if (this.logger) {
                this.logger.debug("Cache Miss!")
            }

            this.data = await this.__updateFunction()
            this.lastUpdate = now
        }else if(this.logger) {
            this.logger.debug("Cache Hit!")
        }

        return this.data
    }
}
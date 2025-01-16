import axios from "axios";
import { parse } from 'hls-parser';

// components
import { TW } from "..";
import { AuthUser } from "../twitch/auth";

// @types
import { IChannelExtended, IDetailedCampaign } from "../twitch/@type";
import { MasterPlaylist, MediaPlaylist } from "hls-parser/types";

// constant
import { WATCH_INTERVAL, MAX_WATCH_ERROR } from "../constant";

// utils
import { Logger } from "../utils/logger";
import { Color, LogLevel } from "../utils/logger/@type";

const watchLog = new Logger({
    name: "Watch",
    color: Color.CYAN,
    logLevel: LogLevel.INFO
})

export class Watch {
    public channel: IChannelExtended

    // link
    public pointsClaim: boolean
    public campaign: IDetailedCampaign[]

    // internal
    private abortController = new AbortController()
    private onStreamEnd: () => void
    private streamLink: string
    private stopped: boolean = false
    private skipEvent: boolean = false
    
    constructor(channel: IChannelExtended, onStreamEnd: () => void, claim?: { points?: boolean, campaign?: IDetailedCampaign }) {
        this.channel = channel
        this.onStreamEnd = onStreamEnd
        this.streamLink = ""
        this.pointsClaim = claim?.points ?? false
        this.campaign = claim?.campaign ? [claim.campaign] : []

        if (this.channel.stream === undefined) {
            let error = new Error("Can't start watching no stream running!")
            watchLog.error(error)
            
            throw error
        }
    }

    private async getStreamLink() {
        const accessToken = await TW.getPlaybackAccessToken(this.channel.login)

        if (accessToken) {
            let url = `https://usher.ttvnw.net/api/channel/hls/${this.channel.login}.m3u8?sig=${accessToken.signature}&token=${accessToken.value}`
            let resp = await axios.get(url, {
                headers: AuthUser.headers(true)
            })
            
            let hls = parse(resp.data) as MasterPlaylist
            let streamInfo = hls.variants.pop()
            
            if (streamInfo) {
                this.streamLink = streamInfo?.uri
            }else throw new Error("Missing stream info")
        } else throw new Error("Failed to get access token")
    }

    private async sendWatch(): Promise<boolean> {
        try {
            let resp = await axios.get(this.streamLink, {
                headers: AuthUser.headers(true)
            })
    
            if (resp.status === 200) {
                let hls = parse(resp.data) as MediaPlaylist
                let segment = hls.segments.pop()
                if (segment) {
                    let resp = await axios.head(segment.uri, {
                        headers: AuthUser.headers(true)
                    }) 
    
                    return resp.status === 200
                }
            }
        } catch (err) {
            watchLog.info(`Error during send watch to ${this.channel.displayName}, probably live end!`)
        }

        return false
    }

    private async delay(ms: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const _abortEvent = () => {
                clearTimeout(timeout);
                reject(new DOMException("Operation aborted", "AbortError"));
            }

            const timeout = setTimeout(() => {
                this.abortController.signal.removeEventListener("abort", _abortEvent)
                resolve()
            }, ms);

            this.abortController.signal.addEventListener("abort", _abortEvent);
        });
    }

    private async _watch(): Promise<void> {
        try {
            let error_count = 0
            while (!this.stopped && error_count < MAX_WATCH_ERROR) {
                let watched = await this.sendWatch()
                if (watched) {
                    watchLog.info(`Succesfully watched ${this.channel.displayName}`)
    
                    error_count = 0
                }else error_count++

                await this.delay(WATCH_INTERVAL * 1000)
            }
        }catch(err) {
            if (err instanceof Error && err.name === "AbortError") {
                watchLog.debug(`Forced stop for ${this.channel.displayName}`)
            }
        }
        
        watchLog.info(`Stop watching ${this.channel.displayName} [skipEvent=${this.skipEvent}]`)
        if (!this.skipEvent) {
            this.onStreamEnd()
        }
    }

    public stop(skipEvent: boolean = false) {
        this.skipEvent = skipEvent
        this.stopped = true
        this.abortController.abort();
    }

    public async watch() {
        watchLog.info(`Start watching ${this.channel.displayName}`)

        try {
            await this.getStreamLink()
        }catch(err) {
            this.onStreamEnd()
        }
        
        await this._watch()
    }

    public isUseless(): boolean {
        return !this.pointsClaim && this.campaign.length === 0
    }

    public resetLink(): void {
        this.pointsClaim = false
        this.campaign = []
    }

    public hasLinkedCampaign(campaign: IDetailedCampaign): boolean {
        return this.campaign.some(c => c.id === campaign.id)
    }

    public addLinkedCampaign(campaign: IDetailedCampaign): void {
        this.campaign.push(campaign)
    }

    public removeLinkedCampaign(campaign: IDetailedCampaign): boolean {
        let idx = this.campaign.findIndex(c => c.id === campaign.id)
        if (idx > -1)  {
            this.campaign.splice(idx, 1)
            return true
        }

        return false
    }
}
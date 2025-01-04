import axios from "axios";

import { BrowserInstance } from "../browser";
import { Logger } from "../utils/logger";

// @constant
import { ClientType, LinkGQL, OperationGQL } from "./@constant";
import { MAX_INTEGRITY_RETRY } from "../constant";

// @types
import { IClientInfo } from "./@type";
import { Color } from "../utils/logger/@type";


interface IIntegrityData {
    isValidate: boolean
    token: string
    expire: number
}

type IHeader = {[key: string]: string}

const InvalidIntegrityData: IIntegrityData = { 
    isValidate: false,
    token: "",
    expire: -1
}

export class AuthUser {
    public static clientInfo: IClientInfo = ClientType.Web
    public static userId: string | undefined
    public static deviceId: string | undefined
    public static clientId: string | undefined
    public static sessionId: string | undefined
    public static accessToken: string | undefined
    public static clientVersion: string | undefined
    public static integrityToken: IIntegrityData = InvalidIntegrityData
    private static log: Logger = new Logger({
        name: "AuthUser",
        color: Color.MAGENTA
    })

    public static headers(authNeeded: boolean): IHeader {
        let headers: IHeader = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip",
            "Accept-Language": "en-US",
            "Content-Type": "application/json",
            "Pragma": "no-cache",
            "User-Agent": this.clientInfo.userAgent,
            "Origin": this.clientInfo.url,
            "Referer": this.clientInfo.url
        }

        if (this.clientId !== undefined) {
            headers["Client-ID"] = this.clientId
        }

        if (this.deviceId !== undefined) {
            headers["X-Device-Id"] = this.deviceId
        }

        if (this.integrityToken.isValidate) {
            headers["Client-Integrity"] = this.integrityToken.token
        }

        if (authNeeded) {
            if (this.accessToken === undefined) {
                throw new Error("Missing Authorization!")
            }

            headers["Authorization"] = `OAuth ${this.accessToken}`
        }

        return headers
    }

    private static async _validateIntegrity(token: string): Promise<boolean> {
        let headers = this.headers(true)
        headers["Client-Integrity"] = token

        let payload = OperationGQL.ClaimDrop("")
        let resp = await axios.post(LinkGQL, JSON.stringify(payload), {
            headers: headers
        })

        if (resp.status === 200) {
            return !('errors' in resp.data)
        }

        return false
    }

    public static async updateIntegrity(): Promise<void> {
        let retryCount = 0

        while (retryCount < MAX_INTEGRITY_RETRY) {
            let integrityResp = await BrowserInstance.getIntegrityToken()
            
            if (integrityResp) {
                if (await this._validateIntegrity(integrityResp.token)) {
                    // updated integrity token
                    this.log.info("Successfull updated integrity token!")
                    this.integrityToken = {
                        isValidate: true,
                        token: integrityResp.token,
                        expire: integrityResp.expiration
                    }
                    
                    return
                }
            }

            // failed to update integrity token
            retryCount++
            this.log.warn(`Failed to update integrity token! count: ${retryCount}/${MAX_INTEGRITY_RETRY}`)
        }

        // add 10 minutes to next retry
        this.integrityToken = {
            ...this.integrityToken,
            expire: Date.now() + (10 * 60 * 1000)
        }
        this.log.warn(`Unable to update token aborting... next try: ${new Date(this.integrityToken.expire).toUTCString()}`)
    }

    public static async validateAuth(): Promise<void> {
        if (this.accessToken === undefined) {
            throw new Error("Missing access token")
        }

        let resp = await axios.get("https://id.twitch.tv/oauth2/validate", {
            headers: {
                Authorization: `OAuth ${this.accessToken}`
            }
        })

        if (resp.status !== 200) {
            throw new Error("Can't validate access token")
        }

        if ('client_id' in resp.data) {
            this.clientId = resp.data['client_id']
        }
    }

    public static async startAutoUpdateIntegrity() {
        while (true) {
            let expireDate = this.integrityToken.expire !== -1 ? this.integrityToken.expire : Date.now()
            let nextUpdate = expireDate - Date.now()

            // anticipate update of 30min (if validate token, otherwise retry immediatly)
            if (this.integrityToken.isValidate) {
                nextUpdate = Math.max(0, nextUpdate - 30 * 60 * 1000)
            }
            
            let targetTime = new Date(Date.now() + nextUpdate)
            this.log.info(`Next update integrity at: ${targetTime.toUTCString()}`)
    
            await new Promise(resolve => {
                setTimeout(() => {
                    this.updateIntegrity().then(resolve)
                }, nextUpdate)
            })
        }
    }
}
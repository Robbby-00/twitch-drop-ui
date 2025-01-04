import { IClientInfo, IClientType } from "../@type";

const webClient: IClientInfo = {
    url: "https://www.twitch.tv",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
}

const mobileClient: IClientInfo = {
    url: "https://m.twitch.tv",
    userAgent: "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.102 Mobile Safari/537.36"
}

const androidClient: IClientInfo = {
    url: "https://www.twitch.tv",
    userAgent: "Dalvik/2.1.0 (Linux; U; Android 7.1.2; SM-G977N Build/LMY48Z) tv.twitch.android.app/16.8.1/1608010"
}

const smartboxClient: IClientInfo = {
    url: "https://android.tv.twitch.tv",
    userAgent: "Mozilla/5.0 (Linux; Android 7.1; Smart Box C1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
}


export const ClientType: IClientType = {
    Web: webClient,
    MobileWeb: mobileClient,
    AndroidApp: androidClient,
    SmartBox: smartboxClient
}
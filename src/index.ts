// load constant
import { ACCESS_TOKEN, BROWSER_TEST } from "./constant"

// components
import { AuthUser } from "./twitch/auth";
import { Twitch } from "./twitch";

export const TW = new Twitch()

import { Tracker } from "./tracker";
import { startServer } from "./api";
import { BrowserInstance } from "./browser";

(async () => {
    if (BROWSER_TEST) {
        BrowserInstance.test()
    }else {
        // MAIN
        AuthUser.accessToken = ACCESS_TOKEN

        AuthUser.validateAuth().then(() => {
            AuthUser.updateIntegrity().then(() => {
                AuthUser.startAutoUpdateIntegrity()
                Tracker.load().then(startServer)
            })
        })
    }
})()

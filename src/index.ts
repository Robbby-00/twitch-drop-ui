// load constant
import { ACCESS_TOKEN } from "./constant"

// components
import { AuthUser } from "./twitch/auth";
import { Twitch } from "./twitch";

export const TW = new Twitch()

import { Tracker } from "./tracker";
import { startServer } from "./api";

(async () => {
    // MAIN
    AuthUser.accessToken = ACCESS_TOKEN

    AuthUser.validateAuth().then(() => {
        AuthUser.updateIntegrity().then(() => {
            AuthUser.startAutoUpdateIntegrity()
            Tracker.load().then(startServer)
        })
    })
})()

import { Request, NextFunction, Router } from "express";
import { WebSocket } from "ws";

const activeWs: WebSocket[] = []

export const wsRouter = (): Router => {
    const router = Router()

    router.ws('/update', (ws: WebSocket, req: Request, next: NextFunction): void => {
        ws.on("close", () => {
            let idx = activeWs.findIndex(it => it === ws)
            if (idx > -1) {
                activeWs.splice(idx, 1)
            }
        })
        activeWs.push(ws)
    })

    return router
}

export enum UpdateType {
    TRACK_CHANNEL = "TrackChannel",
    TRACK_CAMPAIGN = "TrackCampaign",
    TRACK_GAME = "TrackGame",
    WATCHING_CHANNEL = "WatchingChannel"
}

export const emitUpdate = (updaterType: UpdateType) => {
    activeWs.forEach(ws => ws.send(updaterType))
}

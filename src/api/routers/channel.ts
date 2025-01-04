import { Router, Request, Response, NextFunction } from "express";
import { apiLog } from "..";

// @errors
import { BadRequestError } from "../@errors";

// components
import { TW } from "../..";
import { Tracker } from "../../tracker";

// @types
import { IPayloadPoint, TargetPayload } from "../../tracker/@types";

// utils
import { readQueryValue } from "../utils";

const channelLog = apiLog.childCategory("Channel")

const channelRouter = Router()

channelRouter.get('/search', (req: Request, res: Response, next: NextFunction): void => {
    channelLog.debug(`Requested search channel: ${JSON.stringify(req.query)}`)

    let query = readQueryValue(req, "query")

    if (query !== undefined) {
        TW.searchChannels(String(query)).then(channels => {
            res.status(200).json(channels)
        })
    }else throw new BadRequestError("Missing query params")
})

channelRouter.get('/follow', (req: Request, res: Response, next: NextFunction): void => {
    channelLog.debug(`Requested followed channel`)

    TW.getFollowChannel().then(channels => {
        res.status(200).json(channels)
    })
})

channelRouter.get('/track', (req: Request, res: Response, next: NextFunction): void => {
    channelLog.debug(`Requested tracked channels`)

    res.status(200).json({
        data: Tracker.getPointChannels,
        nextUpdate: (Tracker.nextUpdate - Date.now()) + 5 * 1000 // add 5 seconds to have enough update time
    })
})

channelRouter.put('/track', (req: Request, res: Response, next: NextFunction): void => {
    channelLog.debug(`Put channel into tracked channels: ${JSON.stringify(req.query)}`)

    let channel = readQueryValue(req, "channel")
    
    if (channel !== undefined) {
        Tracker.add({
            type: TargetPayload.Point,
            payload: channel
        } satisfies IPayloadPoint).then(result => {
            res.sendStatus(result ? 200 : 404)
        })
    }else throw new BadRequestError("Missing channel params")
})

channelRouter.delete('/track', (req: Request, res: Response, next: NextFunction): void => {
    channelLog.debug(`Delete channel from tracked channels: ${JSON.stringify(req.query)}`)

    let channel = readQueryValue(req, "channel")
    if (channel !== undefined) {
        Tracker.remove({
            type: TargetPayload.Point,
            payload: channel
        } satisfies IPayloadPoint).then(result => {
            res.sendStatus(result ? 200 : 404)
        })
    }else throw new BadRequestError("Missing channel params")
})

export { channelRouter }
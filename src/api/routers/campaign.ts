import { Router, Request, Response, NextFunction } from "express";
import { apiLog } from "..";

// @errors
import { BadRequestError, ServiceUnavailableError } from "../@errors";

// @types
import { IPayloadCampaign, TargetPayload } from "../../tracker/@types";

// components
import { TW } from "../..";
import { Tracker } from "../../tracker";

// utils
import { readQueryValue } from "../utils";
import { AuthUser } from "../../twitch/auth";

const campaignLog = apiLog.childCategory("Channel")

const campaignRouter = Router()

const isServiceAvaiable = (): boolean => {
    return AuthUser.integrityToken.isValidate && AuthUser.accessToken !== undefined
}

campaignRouter.use((req: Request, res: Response, next: NextFunction): void => {
    // Service unavaiable middleware
    if (!isServiceAvaiable()) {
        throw new ServiceUnavailableError("Bad integrity or auth token")
    }

    next()
})

campaignRouter.get('/list', (req: Request, res: Response, next: NextFunction): void => {
    campaignLog.debug(`Requested campaign list`)

    TW.getCampaigns().then(campaigns => {
        res.status(200).json(campaigns)
    })
})

campaignRouter.get('/track', (req: Request, res: Response, next: NextFunction): void => {
    campaignLog.debug(`Requested tracked campaigns`)

    
    res.status(200).json({
        data: Tracker.getDropCampaign,
        nextUpdate: (Tracker.nextUpdate - Date.now()) + 5 * 1000 // add 5 seconds to have enough update time
    })
})

campaignRouter.put('/track', (req: Request, res: Response, next: NextFunction): void => {
    campaignLog.debug(`Put campaign into tracked campaigns: ${JSON.stringify(req.query)}`)

    let campaignId = readQueryValue(req, "campaignId")
    if (campaignId !== undefined) {
        Tracker.add({
            type: TargetPayload.Campaign,
            payload: campaignId
        } satisfies IPayloadCampaign).then(result => {
            res.sendStatus(result ? 200 : 404)
        })
    }else throw new BadRequestError("Missing channel params")
})

campaignRouter.delete('/track', (req: Request, res: Response, next: NextFunction): void => {
    campaignLog.debug(`Delete campaign from tracked campaigns: ${JSON.stringify(req.query)}`)

    let campaignId = readQueryValue(req, "campaignId")
    if (campaignId !== undefined) {
        Tracker.remove({
            type: TargetPayload.Campaign,
            payload: campaignId
        } satisfies IPayloadCampaign).then(result => {
            res.sendStatus(result ? 200 : 404)
        })
    }else throw new BadRequestError("Missing channel params")
})

export { campaignRouter }
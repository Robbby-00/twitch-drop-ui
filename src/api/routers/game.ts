import { Router, Request, Response, NextFunction } from "express";
import { apiLog } from "..";

// @errors
import { BadRequestError } from "../@errors";

// components
import { TW } from "../..";
import { Tracker } from "../../tracker";

// @types
import { TargetPayload } from "../../tracker/@types";
import { IPayloadGame } from "../../tracker/@types/tracker-payload";

// utils
import { readQueryValue } from "../utils";

const gameLog = apiLog.childCategory("Game")

const gameRouter = Router()

gameRouter.get('/search', (req: Request, res: Response, next: NextFunction): void => {
    gameLog.debug(`Requested search game: ${JSON.stringify(req.query)}`)

    let query = readQueryValue(req, "query")

    if (query !== undefined) {
        TW.searchGame(String(query)).then(game => {
            res.status(200).json(game)
        })
    }else throw new BadRequestError("Missing query params")
})

gameRouter.get('/track', (req: Request, res: Response, next: NextFunction): void => {
    gameLog.debug(`Requested tracked games`)

    res.status(200).json({
        data: Tracker.getTrackingGame,
        nextUpdate: (Tracker.nextUpdate - Date.now()) + 5 * 1000 // add 5 seconds to have enough update time
    })
})

gameRouter.put('/track', (req: Request, res: Response, next: NextFunction): void => {
    gameLog.debug(`Put game into tracked games: ${JSON.stringify(req.query)}`)

    let slug = readQueryValue(req, "slug")
    if (slug !== undefined) {
        Tracker.add({
            type: TargetPayload.Game,
            payload: slug
        } satisfies IPayloadGame).then(result => {
            res.sendStatus(result ? 200 : 404)
        })
    }else throw new BadRequestError("Missing slug params")
})

gameRouter.delete('/track', (req: Request, res: Response, next: NextFunction): void => {
    gameLog.debug(`Delete game from tracked games: ${JSON.stringify(req.query)}`)

    let slug = readQueryValue(req, "slug")
    if (slug !== undefined) {
        Tracker.remove({
            type: TargetPayload.Game,
            payload: slug
        } satisfies IPayloadGame).then(result => {
            res.sendStatus(result ? 200 : 404)
        })
    }else throw new BadRequestError("Missing slug params")
})

export { gameRouter }
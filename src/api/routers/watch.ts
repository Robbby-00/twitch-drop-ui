import { Router, Request, Response, NextFunction } from "express";
import { apiLog } from "..";

// tracker
import { Tracker } from "../../tracker";

const watchLog = apiLog.childCategory("User")

const watchRouter = Router()

watchRouter.get('/list', (req: Request, res: Response, next: NextFunction): void => {
    watchLog.debug("Requested watching list")

    res.status(200).json(Tracker.getWatchingChannel)
})

export { watchRouter }
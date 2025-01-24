import { Router, Request, Response, NextFunction } from "express";

// constant
import { CHANGELOG_DATA, VERSION } from "../../constant";

const infoRouter = Router()

infoRouter.get('/changelog', (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).send(CHANGELOG_DATA)
})

infoRouter.get('/version', (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).send(VERSION)
})

export { infoRouter }



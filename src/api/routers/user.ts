import { Router, Request, Response, NextFunction } from "express";
import { apiLog } from "..";

// twitch user
import { TW } from "../..";

const userLog = apiLog.childCategory("User")

const userRouter = Router()

userRouter.get('/', (req: Request, res: Response, next: NextFunction): void => {
    userLog.debug("Requested user data")

    TW.getUserData().then(userdata => res.status(200).json(userdata))
})

export { userRouter }
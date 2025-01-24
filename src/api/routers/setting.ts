import { Router, Request, Response, NextFunction } from "express";
import { apiLog } from "..";

// @errors
import { NotFoundError, BadRequestError } from "../@errors";

// @types
import { ISettingExposed, SettingKeys } from "../../settings/@type";

// settings
import { Settings } from "../../settings";

const settingLog = apiLog.childCategory("Setting")

const settingRouter = Router()

settingRouter.get('/', (req: Request, res: Response, next: NextFunction): void => {
    settingLog.debug("Requested settings")

    let exposedSettings = Settings.getAll().map<ISettingExposed>(setting => setting.toObject())

    res.status(200).json(exposedSettings)
})

settingRouter.get("/categories", (req: Request, res: Response, next: NextFunction): void => {
    settingLog.debug("Requested setting categories")

    res.status(200).json(Settings.getCategories())
})

settingRouter.post("/:key", (req: Request, res: Response, next: NextFunction): void => {
    settingLog.debug(`Update setting with key: ${req.params.key}`)

    let key = Settings.has(req.params.key)
    if (key) {
        if ("value" in req.body) {
            let value = req.body.value

            Settings.set(key, value).then(success => {
                if (success) {
                    res.status(200).json(Settings.get(key)!.toObject())
                }else throw new BadRequestError("Bad value in body request")
            })
        
        }else throw new BadRequestError("Missing value in body request")
    
    }else throw new NotFoundError(`Setting not found, with key: ${key}`)
})

export { settingRouter }
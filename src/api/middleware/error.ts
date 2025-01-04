import { Request, Response, NextFunction } from "express"
import { ApiError } from "../@errors"

// logs
import { apiLog } from "../"

export const errors = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof ApiError) {
        // Handled Errors
        res.status(err.statusCode).json({
            status: err.statusCode,
            error: err.errorMsg,
            message: err.message,
            timestamp: new Date().toISOString()
        })
        return
    }

    // Unhandled Error
    apiLog.error(err)
    res.status(500).json({
        status: 500,
        error: "Internal Server Error",
        message: "Something went wrong!",
        timestamp: new Date().toISOString()
    })
}
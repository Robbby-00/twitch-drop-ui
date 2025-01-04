import { Request } from "express"

export const readQueryValue = (req: Request, name: string, default_value: string | undefined = undefined): string | undefined => {
    let data = req.query[name]

    if (data === undefined)
        return default_value

    return data as string
}
import ApiError from "./master";

export default class BadRequestError extends ApiError {
    constructor(desc: string) {
        super(
            desc,
            "Bad Request",
            400
        )
    }
}
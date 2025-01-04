import ApiError from "./master";

export default class ForbiddenError extends ApiError {
    constructor(desc: string) {
        super(
            desc,
            "Forbidden",
            403
        )
    }
}
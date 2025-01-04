import ApiError from "./master";

export default class UnauthorizedError extends ApiError {
    constructor(desc: string) {
        super(
            desc,
            "Unauthorized",
            401
        )
    }
}
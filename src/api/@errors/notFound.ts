import ApiError from "./master";

export default class NotFoundError extends ApiError {
    constructor(desc: string) {
        super(
            desc,
            "Not Found",
            404
        )
    }
}
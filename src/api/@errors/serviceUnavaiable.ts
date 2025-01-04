import ApiError from "./master";

export default class ServiceUnavailableError extends ApiError {
    constructor(desc: string) {
        super(
            desc,
            "Service Unavailable",
            503
        )
    }
}
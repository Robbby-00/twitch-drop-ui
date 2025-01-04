export default class ApiError extends Error {
    private _errorMsg: string
    private _statusCode: number

    constructor(desc: string, errorMsg: string, statusCode: number) {
        super(desc)
        
        this._errorMsg = errorMsg
        this._statusCode = statusCode
    }

    public get errorMsg(): string {
        return this._errorMsg
    }

    public get statusCode(): number {
        return this._statusCode
    }
}
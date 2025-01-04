export interface IPlaybackAccessToken {
    value: string
    signature: string
    authorization: {
        isForbidden: boolean
        forbiddenReasonCode: string
    }
}
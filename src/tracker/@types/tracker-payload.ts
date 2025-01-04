export enum TargetPayload {
    Point = "point",
    Campaign = "campaign",
    Game = "game"
}

export interface IPayload {
    type: TargetPayload,
    payload: string
}

export type IPayloadPoint = {
    type: TargetPayload.Point
    payload: string
}

export type IPayloadCampaign = {
    type: TargetPayload.Campaign
    payload: string
}

export type IPayloadGame = {
    type: TargetPayload.Game
    payload: string
}

export type IPayloadTracker = IPayload | IPayloadPoint | IPayloadCampaign | IPayloadGame
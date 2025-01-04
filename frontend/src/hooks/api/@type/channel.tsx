import { ICampaign } from "./campaign"

export interface IChannel {
    id: string
    name: string
    profileImage: string
    isLive: boolean
    isVerified: boolean
}

export interface IChannelExtended {
    id: string
    login: string
    displayName: string
    profileImage: string
    points: {
        balance: number
        pointsImage?: string
    }
    stream?: {
        id: string
        viewersCount: number
        title: string
        game: {
            id: string
            name: string
            slug: string
        }
    }
}

export interface IWatchingChannel {
    channel: IChannelExtended
    calimPoints: boolean
    campaign: ICampaign[]
}

export interface IChannel {
    id: number
    name: string
    profileImage: string
    isLive: boolean
    isVerified: boolean
}

export interface IChannelExtended {
    id: number
    login: string
    displayName: string
    profileImage: string
    points: {
        balance: number
        pointsImage?: string
    }
    stream?: {
        id: number
        viewersCount: number
        title: string
        game: {
            id: string
            name: string
            slug: string
        }
    }
}
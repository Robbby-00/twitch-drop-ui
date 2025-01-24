import { IDrop } from "./drop"

export interface ICampaign {
    id: string
    name: string
    owner: {
        id: string
        name: string
    }
    game: {
        id: number
        displayName: string
        boxArtURL: string
    }
    status: string
    startAt: string
    endAt: string
    detailsURL: string
    accountLinkURL: string
    self: {
        isAccountConnected: boolean
    }
    drops: IDrop[]
    priority: number
}
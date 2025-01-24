import { IDrop } from "./drop"

export interface ICampaign {
    id: string
    name: string
    owner: {
        id: string
        name: string
    }
    game: {
        id: string
        displayName: string
        boxArtURL: string
    }
    status: string
    startAt: string
    endAt: string
    detailsURL: string
    accountLinkUrl: string
    self: {
        isAccountConnected: boolean
    }
}

export interface IDetailedCampaign {
    id: string
    name: string
    allow: {
        channels: {
            id: string
            name: string
            displayName: string
        }[]
        isEnabled: boolean
    }
    owner: {
        id: string
        name: string
    }
    game: {
        id: string
        displayName: string
        boxArtURL: string
        slug: "delta-force-hawk-ops"
    }
    status: string
    startAt: string
    endAt: string
    detailsURL: string
    accountLinkUrl: string
    self: {
        isAccountConnected: boolean
    }
    drops: IDrop[]
}

export interface IDetailedCampaignPrioritize extends IDetailedCampaign {
    priority: number
}

export interface IRawCampaign {
    id: string
    name: string
    allow: {
        channels: {
            id: string
            name: string
            displayName: string
        }[]
        isEnabled: boolean
    }
    owner: {
        id: string
        name: string
    }
    game: {
        id: string
        displayName: string
        boxArtURL: string
        slug: "delta-force-hawk-ops"
    }
    status: string
    startAt: string
    endAt: string
    detailsURL: string
    accountLinkUrl: string
    self: {
        isAccountConnected: boolean
    }
    timeBasedDrops: {
        id: string
        name: string
        endAt: string
        requiredMinutesWatched: number
        requiredSubs: number
        benefitEdges: {
            benefit: {
                distributionType: string
                id: string
                imageAssetURL: string
                name: string
            }
            claimCount: number
            entitlementLimit: number
        }[]
        self: {
            hasPreconditionsMet: boolean
            dropInstanceID: string | null
            currentMinutesWatched: number
            currentSubs: number
            isClaimed: boolean
        }
    }[]
}
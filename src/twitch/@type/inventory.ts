import { IRawCampaign } from "./campaign";

export interface IInventory {
    completedRewardCampaigns: any[]
    dropCampaignsInProgress: IRawCampaign[]
    gameEventDrops: {
        game: any | null
        id: string
        imageURL: string
        isConnected: boolean
        lastAwardedAt: string
        requiredAccountLink: string
        totalCount: number
    }[]
}
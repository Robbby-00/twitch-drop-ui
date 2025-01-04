export interface IOperationGQL<T> {
    operationName: string
    extensions: {
        persistedQuery: {
            version: number
            sha256Hash: string
        }
    },
    variables?: T
}

export interface IVarFollowedChannels {
    creatorAnniversariesFeature: boolean
    withFreeformTags: boolean
    input: {
        recommendationContext: {
            platform: string
            clientApp: string
        }
        sectionInputs: ("RECS_FOLLOWED_SECTION" | "RECOMMENDED_COLLABS_SECTION" | "RECOMMENDED_SECTION" | "SIMILAR_SECTION")[]
    }
}

export interface IVarSearchTray {
    queryFragment: string
    includeIsDJ: boolean
    withOfflineChannelContent: boolean
}

export interface IVarGetStreamInfo {
    channel: string
}

export interface IVarClaimComunityPoints {
    input: {
        claimID: string
        channelID: string
    }
}

export interface IVarClaimDrop {
    input: {
        dropInstanceID: string
    }
}

export interface IVarChannelPointsContext {
    channelLogin: string
}

export interface IVarInventory {
    fetchRewardCampaigns: boolean
}

export interface IVarCurrentDrop {
    channelID: string
    channelLogin: string
}

export interface IVarCampaigns {
    fetchRewardCampaigns: boolean
}

export interface IVarCampaignDetails {
    channelLogin: string
    dropID: string
}

export interface IVarAvailableDrops {
    channelID: string
}

export interface IVarPlaybackAccessToken {
    isLive: boolean
    isVod: boolean
    login: string
    platform: string
    playerType: string
    vodID: string
}

export interface IVarGameDirectory {
    limit: number
    slug: string
    imageWidth: number
    includeIsDJ: boolean
    options: {
        broadcasterLanguages: string[]
        freeformTags: string | null
        includeRestricted: string[]
        recommendationsContext: {
            platform: string
        }
        sort: string
        systemFilters: string[]
        tags: string[]
        requestID: string
    }
    sortTypeIsRecency: boolean
}

export interface IVarSlugRedirect {
    name: string
}
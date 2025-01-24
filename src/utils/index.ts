import { TW } from "..";

// @types
import { IChannelExtended, IDetailedCampaign, IDetailedCampaignPrioritize } from "../twitch/@type";

export const getDayInMillis = () => 1000 * 60 * 60 * 24

export function splitArrayIntoChunks<T>(arr: T[], chunk: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += chunk) {
        result.push(arr.slice(i, i + chunk));
    }

    return result
}

export const searchCampaignChannels = async (campaign: IDetailedCampaign): Promise<IChannelExtended | undefined> => {
    let followedChannel = await TW.getFollowChannel()

    if (campaign.allow.channels === null) {
        let followedExtChannel = await TW.getExtendedChannel(followedChannel.filter(ch => ch.isLive).map(ch => ch.name))
        let followedLiveChannel = followedExtChannel.find(ch => ch.stream !== undefined && ch.stream.game.id === campaign.game.id)
        if (followedLiveChannel) {
            return followedLiveChannel
        }

        let gameDir = await TW.getGameDirectory(campaign.game.slug)
        if (gameDir.length > 0 && gameDir[0].streams.edges.length > 0) {
            let liveChannel = await TW.getExtendedChannel(gameDir[0].streams.edges[0].node.broadcaster.login)
            if (liveChannel.length > 0) {
                return liveChannel[0]
            }
        }
    }else {
        let followedCampaignChannel = campaign.allow.channels.filter(ch => followedChannel.find(it => it.id === Number(ch.id) && it.isLive) !== undefined)
        if (followedCampaignChannel.length > 0) {
            let followedExtChannel = await TW.getExtendedChannel(followedCampaignChannel.map(ch => ch.name))
            let liveChannel = followedExtChannel.find(ch => ch.stream !== undefined && ch.stream.game.id === campaign.game.id)

            if (liveChannel !== undefined) {
                return liveChannel
            }
        }

        let chunkedAllowChannels = splitArrayIntoChunks(campaign.allow.channels, 15)
        for (let chunk of chunkedAllowChannels) {
            let channels = await TW.getExtendedChannel(chunk.map(c => c.name))
            
            let liveChannel = channels.find(ch => ch.stream !== undefined) 
            if (liveChannel) {
                return liveChannel
            }
        }
    }

    return undefined
}

export const applyPriorityValue = (campaign: IDetailedCampaign): IDetailedCampaignPrioritize => {
    let maxDropWatchtime = Math.max(...campaign.drops.map<number>(drop => drop.requiredMinutesWatched))
    let arrayMinutesWatched = campaign.drops.map<number | undefined>(drop => drop.minutesWatched).filter(minutes => minutes !== undefined)
    let minutesWatched = arrayMinutesWatched.length > 0 ? Math.min(...arrayMinutesWatched) : 0
    let minutesToWatch = maxDropWatchtime - minutesWatched

    let endMillis = new Date(campaign.endAt).getTime()
    let deltaMillis = endMillis - Date.now()

    return {
        ...campaign,
        priority: deltaMillis - (minutesToWatch * 60 * 1000)
    }
}

/*
export const sortCampaignToFirstExpired = (campaigns: IDetailedCampaign[]): IDetailedCampaign[] => {
    return campaigns.map<[IDetailedCampaign, number]>(campaign => {
        let maxDropWatchtime = Math.max(...campaign.drops.map<number>(drop => drop.requiredMinutesWatched))
        let arrayMinutesWatched = campaign.drops.map<number | undefined>(drop => drop.minutesWatched).filter(minutes => minutes !== undefined)
        let minutesWatched = arrayMinutesWatched.length > 0 ? Math.min(...arrayMinutesWatched) : 0
        let minutesToWatch = maxDropWatchtime - minutesWatched

        let endMillis = new Date(campaign.endAt).getTime()
        let deltaMillis = endMillis - Date.now()

        return [campaign, deltaMillis - (minutesToWatch * 60 * 1000)]
    }).sort((a, b) => a[1] - b[1]).map<IDetailedCampaign>(([campaign, sortingValue]) => campaign)
}*/
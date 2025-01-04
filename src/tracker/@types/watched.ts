import { ICampaign, IChannelExtended } from "../../twitch/@type";

export interface IWatchingChannel {
    channel: IChannelExtended
    calimPoints: boolean
    campaign: ICampaign[]
}
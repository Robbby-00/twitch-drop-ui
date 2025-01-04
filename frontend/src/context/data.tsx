import { createContext, ReactNode, useState } from "react";

// hookes
import { DEFAULT_USER, useApi } from "../hooks/api/index";
import { usePeriodUpdate } from "../hooks/period-update";

// @types
import { IUser } from "../hooks/api/@type/user";
import { IChannelExtended, IWatchingChannel } from "../hooks/api/@type/channel";
import { ICampaign } from "../hooks/api/@type/campaign";
import { IGame } from "../hooks/api/@type/game";


type StatusType = "avaiable" | "unavaiable"

interface ServicesStatus {
    points: StatusType
    campaigns: StatusType
}

const DEFAULT_SERVICES_STATUS = {
    points: "avaiable",
    campaigns: "avaiable"
} satisfies ServicesStatus

interface ContextType {
    user: IUser
    trackChannel: IChannelExtended[]
    trackCampaign: ICampaign[]
    trackGame: IGame[]
    activeCampaign: ICampaign[]
    watchingChannel: IWatchingChannel[]
    servicesStatus: ServicesStatus
    forceUpdateTrackedChannel: () => void
    forceUpdateTrackedCampaign: () => void
    forceUpdateTrackedGame: () => void
    setPointsStatus: (status: StatusType) => void
    setCampaignsStatus: (status: StatusType) => void
}

export const DataContext = createContext<ContextType>({
    user: DEFAULT_USER,
    trackChannel: [],
    trackCampaign: [],
    trackGame: [],
    activeCampaign: [],
    watchingChannel: [],
    servicesStatus: DEFAULT_SERVICES_STATUS,
    forceUpdateTrackedChannel: async () => {},
    forceUpdateTrackedCampaign: async () => {},
    forceUpdateTrackedGame: async () => {},
    setPointsStatus: () => {},
    setCampaignsStatus: () => {}
})

export function DataProvider(props: { children?: ReactNode }) {

    // api
    const { getUserData, getTrackedChannel, getTrackedCampaign, getTrackedGame, getActiveCampaign, getWatchingChannel } = useApi()

    // service status
    const [ servicesStatus, setServicesStatus ] = useState<ServicesStatus>(DEFAULT_SERVICES_STATUS)

    // set service state
    const setPointsStatus = (status: StatusType) => {
        setServicesStatus(ss => ({
            ...ss,
            points: status
        }))
    }
    const setCampaignsStatus = (status: StatusType) => {
        setServicesStatus(ss => ({
            ...ss,
            campaigns: status
        }))
    }

    // on request response
    const handleCampaignsRequest = (success: boolean) => {
        setCampaignsStatus(success ? "avaiable" : "unavaiable")
    }
    const handlePointsRequest = (success: boolean) => {
        setPointsStatus(success ? "avaiable" : "unavaiable")
    }

    // hooks
    const { data: user } = usePeriodUpdate(getUserData, DEFAULT_USER)
    const { data: trackChannel, forceUpdateData: forceUpdateTrackedChannel } = usePeriodUpdate(getTrackedChannel, [], handlePointsRequest)
    const { data: trackCampaign, forceUpdateData: forceUpdateTrackedCampaign } = usePeriodUpdate(getTrackedCampaign, [], handleCampaignsRequest)
    const { data: trackGame, forceUpdateData: forceUpdateTrackedGame } = usePeriodUpdate(getTrackedGame, [])
    const { data: activeCampaign } = usePeriodUpdate(getActiveCampaign, [], handleCampaignsRequest)
    const { data: watchingChannel } = usePeriodUpdate(getWatchingChannel, [])

    return <DataContext.Provider value={{ 
        user, 
        trackChannel, 
        trackCampaign,
        trackGame,
        activeCampaign,
        watchingChannel,
        servicesStatus,
        forceUpdateTrackedChannel,
        forceUpdateTrackedCampaign,
        forceUpdateTrackedGame,
        setPointsStatus,
        setCampaignsStatus
     }}>{props.children}</DataContext.Provider>
}
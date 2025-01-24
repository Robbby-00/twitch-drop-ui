import { createContext, ReactNode, useEffect, useState } from "react";
import useWebSocket from 'react-use-websocket'

// hookes
import { useApi } from "../hooks/api/index";
import { usePeriodUpdate } from "../hooks/period-update";

// @types
import { DEFAULT_USER, IUser } from "../hooks/api/@type/user";
import { IChannelExtended, IWatchingChannel } from "../hooks/api/@type/channel";
import { ICampaign } from "../hooks/api/@type/campaign";
import { IGame } from "../hooks/api/@type/game";

enum UpdateType {
    TRACK_CHANNEL = "TrackChannel",
    TRACK_CAMPAIGN = "TrackCampaign",
    TRACK_GAME = "TrackGame",
    WATCHING_CHANNEL = "WatchingChannel"
}

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
    changelog: string
    version: string,
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
    changelog: "",
    version: "",
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
    const { getChangelog, getVersion, getUserData, getTrackedChannel, getTrackedCampaign, getTrackedGame, getActiveCampaign, getWatchingChannel } = useApi()

    // ws
    const { lastMessage } = useWebSocket("/api/v1/ws/update", {
        reconnectInterval: (count: number) => {
            if (count < 10) {
                return 1000
            }

            return 5000
        },
        shouldReconnect: () => true,
    });

    // state
    const [ servicesStatus, setServicesStatus ] = useState<ServicesStatus>(DEFAULT_SERVICES_STATUS)
    const [ changelog, setChangelog ] = useState<string>("")
    const [ version, setVersion ] = useState<string>("")
    const [ trackChannel, setTrackChannel ] = useState<IChannelExtended[]>([])
    const [ trackCampaign, setTrackCampaign ] = useState<ICampaign[]>([])
    const [ trackGame, setTrackGame ] = useState<IGame[]>([])
    const [ watchingChannel, setWatchingChannel ] = useState<IWatchingChannel[]>([])

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
    const { data: activeCampaign } = usePeriodUpdate(getActiveCampaign, [], handleCampaignsRequest)
    /*const { data: trackChannel, forceUpdateData: forceUpdateTrackedChannel } = usePeriodUpdate(getTrackedChannel, [], handlePointsRequest)
    const { data: trackCampaign, forceUpdateData: forceUpdateTrackedCampaign } = usePeriodUpdate(getTrackedCampaign, [], handleCampaignsRequest)
    const { data: trackGame, forceUpdateData: forceUpdateTrackedGame } = usePeriodUpdate(getTrackedGame, [])
    const { data: watchingChannel } = usePeriodUpdate(getWatchingChannel, [])*/

    useEffect(() => {
        getChangelog().then(setChangelog)
        getVersion().then(setVersion)
    }, [])

    useEffect(() => {
        if (lastMessage) {
            switch (lastMessage.data as UpdateType) {
                case UpdateType.TRACK_CHANNEL:
                    getTrackedChannel().then(([tc, _]) => {
                        setTrackChannel(tc)
                        handlePointsRequest(true)
                    }).catch(() => handlePointsRequest(false))
                    break
                case UpdateType.TRACK_CAMPAIGN:
                    getTrackedCampaign().then(([tc, _]) => {
                        setTrackCampaign(tc)
                        handleCampaignsRequest(true)
                    }).catch(() => handleCampaignsRequest(false))
                    break
                case UpdateType.TRACK_GAME:
                    getTrackedGame().then(([tg, _]) => setTrackGame(tg))
                    break
                case UpdateType.WATCHING_CHANNEL:
                    getWatchingChannel().then(([wc, _]) => setWatchingChannel(wc))
                    break
            }
        }
    }, [lastMessage])

    useEffect(() => {
        // init channels
        getTrackedChannel().then(([tc, _]) => {
            setTrackChannel(tc)
            handlePointsRequest(true)
        }).catch(() => handlePointsRequest(false))

        // init campaigns
        getTrackedCampaign().then(([tc, _]) => {
            setTrackCampaign(tc)
            handleCampaignsRequest(true)
        }).catch(() => handleCampaignsRequest(false))

        // init games
        getTrackedGame().then(([tg, _]) => setTrackGame(tg))

        // init watching channels
        getWatchingChannel().then(([wc, _]) => setWatchingChannel(wc))
    }, [])

    const forceUpdateTrackedChannel = () => {}
    const forceUpdateTrackedCampaign = () => {}
    const forceUpdateTrackedGame = () => {}

    return <DataContext.Provider value={{
        changelog, 
        version,
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
import axios, { AxiosError } from "axios"
import { useContext } from "react"

// context
import { DataContext } from "../../context/data"

// @types
import { IUser } from "./@type/user"
import { IChannel, IChannelExtended, IWatchingChannel } from "./@type/channel"
import { ICampaign } from "./@type/campaign"
import { IGame } from "./@type/game"

enum HTTPMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete"
}

export enum ContentType {
    Channel = "channel",
    Campaign = "campaign",
    Game = "game"
}

export const DEFAULT_USER: IUser = {
    id: "",
    displayName: "",
    profileImage: ""
}

// api version
const VERSION = 'v1'
// update when failed the request
const RETRY_TIME = 10 * 1000
// update rate of watched channel
const WATCHING_TIME = 20 * 1000

function performRequest<T>(method: HTTPMethod, endpoint: string, manipulateData: (data: any) => T): Promise<T> {
    return new Promise((resolve, reject) => {
        let url = `/api/${VERSION}${endpoint}`

        axios({
            method: method,
            url: url,
            timeout: 2000
        }).then(resp => {
            resolve(manipulateData(resp.data))
        }).catch(err => {
            console.log(`Failed to perform request to: ${url}`)
            reject(err)
        })
    })
}

export function useApi() {

    const { forceUpdateTrackedChannel, forceUpdateTrackedCampaign, forceUpdateTrackedGame } = useContext(DataContext)
    
    const getUserData = (): Promise<[IUser, number]> => {
        return new Promise(resolve => {
            performRequest<[IUser, number]>(HTTPMethod.GET, "/user", (raw) => {
                // let { data, nextUpdate } = raw
                
                return [raw, 5 * 60 * 1000]
            })
            .then(resolve)
            .finally(() => resolve([DEFAULT_USER, RETRY_TIME]))
        }) 
    }

    const searchChannels = async (query: string): Promise<IChannel[]> => {
        return new Promise(resolve => {
            performRequest<IChannel[]>(HTTPMethod.GET, `/channel/search?query=${query}`, (data) => data)
            .then(resolve)
            .finally(() => resolve([]))
        })
    }

    const searchGames = async (query: string): Promise<IGame[]> => {
        return new Promise(resolve => {
            performRequest<IGame[]>(HTTPMethod.GET, `/game/search?query=${query}`, (data) => data)
            .then(resolve)
            .finally(() => resolve([]))
        })
    }

    const getFollow = async (): Promise<IChannel[]> => {
        return new Promise(resolve => {
            performRequest<IChannel[]>(HTTPMethod.GET, `/channel/follow`, (data) => data as IChannel[])
            .then(resolve)
            .finally(() => resolve([]))
        })  
    }

    const getTrackedChannel = async (): Promise<[IChannelExtended[], number]> => {
        return new Promise((resolve, reject) => {
            performRequest<[IChannelExtended[], number]>(HTTPMethod.GET, `/channel/track`, (raw) => {
                let { data, nextUpdate } = raw

                return [(data as IChannelExtended[]).sort((a, b) => {
                    // Both channels have a stream
                    if (a.stream && b.stream) {
                        // Sort by viewersCount in descending order
                        if (b.stream.viewersCount !== a.stream.viewersCount) {
                            return b.stream.viewersCount - a.stream.viewersCount;
                        }
                        
                        // If viewersCount is the same, sort alphabetically by name
                        return a.displayName.localeCompare(b.displayName);
                    }
                    // One channel has a stream, the other does not
                    if (a.stream && !b.stream) {
                        // Channels with streams come first
                        return -1; 
                    }
                    if (!a.stream && b.stream) {
                        // Channels without streams go after
                        return 1; 
                    }
                    // Neither channel has a stream; sort alphabetically by name
                    return a.displayName.localeCompare(b.displayName);
                }), nextUpdate]
            })
            .then(resolve)
            .catch(err => {
                if (err instanceof AxiosError) {
                    reject(err.status)
                }
            })
            .finally(() => resolve([[], RETRY_TIME]))
        })  
    }

    const getTrackedGame = async (): Promise<[IGame[], number]> => {
        return new Promise((resolve, reject) => {
            performRequest<[IGame[], number]>(HTTPMethod.GET, `/game/track`, (raw) => {
                let { data, nextUpdate } = raw

                return [data as IGame[], nextUpdate]
            })
            .then(resolve)
            .catch(err => {
                if (err instanceof AxiosError) {
                    reject(err.status)
                }
            })
            .finally(() => resolve([[], RETRY_TIME]))
        })  
    }

    const addToTracking = async (type: ContentType, data: string): Promise<boolean> => {
        let paramsName: string = ""
        switch(type) {
            case ContentType.Channel:
                paramsName = "channel"
                break
            case ContentType.Campaign:
                paramsName = "campaignId"
                break
            case ContentType.Game:
                paramsName = "slug"
                break
        }

        let result = await new Promise<boolean>(resolve => {
            performRequest<boolean>(HTTPMethod.PUT, `/${type}/track?${paramsName}=${data}`, () => true)
            .then(resolve)
            .catch(() => resolve(false))
            .finally(() => resolve(false))
        })

        // update data context
        if (result) {
            switch (type) {
                case ContentType.Channel:
                    forceUpdateTrackedChannel()
                    break
                case ContentType.Campaign:
                    forceUpdateTrackedCampaign()
                    break
                case ContentType.Game:
                    forceUpdateTrackedGame()
                    forceUpdateTrackedCampaign()
            }
        }

        return result
    }

    const removeToTracking = async (type: ContentType, data: string): Promise<boolean> => {
        let paramsName: string = ""
        switch(type) {
            case ContentType.Channel:
                paramsName = "channel"
                break
            case ContentType.Campaign:
                paramsName = "campaignId"
                break
            case ContentType.Game:
                paramsName = "slug"
                break
        }

        let result = await new Promise<boolean>(resolve => {
            performRequest<boolean>(HTTPMethod.DELETE, `/${type}/track?${paramsName}=${data}`, () => true)
            .then(resolve)
            .catch(() => resolve(false))
            .finally(() => resolve(false))
        })
        
        // update data context
        if (result) {
            switch (type) {
                case ContentType.Channel:
                    forceUpdateTrackedChannel()
                    break
                case ContentType.Campaign:
                    forceUpdateTrackedCampaign()
                    break
                case ContentType.Game:
                    forceUpdateTrackedGame()
                    forceUpdateTrackedCampaign()
            }
        }

        return result
    }

    const getActiveCampaign = async (): Promise<[ICampaign[], number]> => {
        return new Promise((resolve, reject) => {
            performRequest<[ICampaign[], number]>(HTTPMethod.GET, `/campaign/list`, (raw) => {
                // let { campaigns, nextUpdate } = data

                return [raw as ICampaign[], 5 * 60 * 1000]
            })
            .then(resolve)
            .catch(err => {
                if (err instanceof AxiosError) {
                    reject(err.status)
                }
            })
            .finally(() => resolve([[], RETRY_TIME]))
        })
    } 

    const getTrackedCampaign = async (): Promise<[ICampaign[], number]> => {
        return new Promise((resolve, reject) => {
            performRequest<[ICampaign[], number]>(HTTPMethod.GET, `/campaign/track`, (raw) => {
                let { data, nextUpdate } = raw

                return [data as ICampaign[], nextUpdate]
            })
            .then(resolve)
            .catch(err => {
                if (err instanceof AxiosError) {
                    reject(err.status)
                }
            })
            .finally(() => resolve([[], RETRY_TIME]))
        })
    }

    const getWatchingChannel = async (): Promise<[IWatchingChannel[], number]> => {
        return new Promise((resolve, reject) => {
            performRequest<[IWatchingChannel[], number]>(HTTPMethod.GET, `/watch/list`, (raw) => {
                return [raw as IWatchingChannel[], WATCHING_TIME]
            })
            .then(resolve)
            .catch(err => {
                if (err instanceof AxiosError) {
                    reject(err.status)
                }
            })
            .finally(() => resolve([[], RETRY_TIME]))
        })
    }

    return { 
        getUserData, 
        searchChannels,
        searchGames,
        getFollow, 
        getTrackedChannel, 
        getTrackedGame,
        addToTracking, 
        removeToTracking, 
        getActiveCampaign, 
        getTrackedCampaign,
        getWatchingChannel
    }
}
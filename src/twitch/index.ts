import axios from "axios";

import { AuthUser } from "./auth";

// @type
import { IBenefit, ICampaign, IChannel, IChannelExtended, IContextPoint, IDetailedCampaign, IDrop, IGame, IGameDirectory, IInventory, IOperationGQL, IPlaybackAccessToken, IUser } from "./@type";

// @constant
import { OperationGQL, LinkGQL, MAX_CONNECTION_RETRY, CACHE_TIME, OperationNameGQL } from "./@constant";

// utils
import { splitArrayIntoChunks } from "../utils";
import { Logger } from "../utils/logger";
import { Cache } from "../utils/cache";
import { Color, LogLevel } from "../utils/logger/@type";

const getGameBoxArt = (id: string): string => {
    return `https://static-cdn.jtvnw.net/ttv-boxart/${id}_IGDB-144x192.jpg`
}

export class Twitch {
    private log: Logger
    private userData: Cache<IUser>
    private campaignData: Cache<ICampaign[]>
    private followData: Cache<IChannel[]>

    public constructor() {
        this.log = new Logger({
            name: "Twitch",
            color: Color.MAGENTA,
            logLevel: LogLevel.DEBUG
        })

        // init cache
        this.userData = new Cache(this.updateUserData.bind(this), CACHE_TIME, {
            logger: new Logger({
                name: "USERDATA-CACHE",
                color: Color.CYAN,
                parent: this.log
            })
        })
        this.campaignData = new Cache(this.updateCampaigns.bind(this), CACHE_TIME, {
            logger: new Logger({
                name: "CAMPAIGN-CACHE",
                color: Color.CYAN,
                parent: this.log
            })
        })
        this.followData = new Cache(this.updateFollowChannels.bind(this), CACHE_TIME, {
            logger: new Logger({
                name: "FOLLOW-CACHE",
                color: Color.CYAN,
                parent: this.log
            })
        })
    }

    private async request(payload: IOperationGQL<any> | IOperationGQL<any>[]): Promise<any> {
        if (payload instanceof Array && payload.length === 0) {
            return []
        } 

        let retry = 0
        while (retry < MAX_CONNECTION_RETRY) {
            try {
                this.log.debug(`Perform request with payload: ${JSON.stringify(payload)}`)
                let resp = await axios.post(LinkGQL, JSON.stringify(payload), {
                    headers: AuthUser.headers(true)
                })
        
                if (resp.status === 200) {
                    return resp.data
                }

                return undefined
            } catch(err) {
                if (err instanceof Error) {
                    this.log.error(err)
                }

                retry++
            }   
        }

        return undefined
    }

    private async updateUserData(): Promise<IUser> {
        let userData: IUser = {
            id: -1,
            displayName: "",
            login: "",
            profileImage: ""
        }

        let resp = await this.request([OperationGQL.GetUserInfo(), OperationGQL.GetUserImage()])
        if (resp) {
            userData.id = resp[0]['data']['currentUser']['id']
            userData.displayName = resp[0]['data']['currentUser']['displayName']
            userData.login = resp[0]['data']['currentUser']['login']
            userData.profileImage = resp[1]['data']['currentUser']['profileImageURL']
        }

        return userData
    }

    private async updateCampaigns(): Promise<ICampaign[]> {
        let resp = await this.request(OperationGQL.Campaigns())

        if (resp) {
            return resp['data']['currentUser']['dropCampaigns'] as ICampaign[]
        }

        return []
    }

    private async updateFollowChannels(): Promise<IChannel[]> {
        let resp = await this.request(OperationGQL.FollowedChannels())

        if (resp) {
            let rawFollowedChannels = (resp['data']['personalSections'] as any[]).find(it => it['type'] === "RECS_FOLLOWED_SECTION")

            if (rawFollowedChannels) {
                return (rawFollowedChannels['items'] as any[]).filter(it => it['user'] !== null).map(item => ({
                    id: Number(item['user']['id']),
                    name: item['user']['displayName'],
                    profileImage: item['user']['profileImageURL'],
                    isLive: item['content']['__typename'] === "Stream",
                    isVerified: false
                }))
            }
        }

        return []
    }

    public async getExtendedChannel(channel: string | string[]): Promise<IChannelExtended[]> {
        if (typeof channel === "string") {
            channel = [channel]
        }

        let channelChunk = splitArrayIntoChunks(channel, 15)
        let results = await Promise.all(channelChunk.map(ch => this.request([...ch.map(it => OperationGQL.GetStreamInfo(it)), ...ch.map(it => OperationGQL.ChannelPointsContext(it))])))

        let resp: any[] = results.flat()
        if (resp) {
            let channelInfo = resp.filter(it => it['data']['user'] !== null && it['extensions']['operationName'] === OperationNameGQL.GetStreamInfo)
            let channelPoints = resp.filter(it => it['data']['community'] !== null && it['extensions']['operationName'] === OperationNameGQL.ChannelPointsContext)

            return channelInfo.map<IChannelExtended>((item, idx) => {
                let rawPoints = channelPoints.find(pts => Number(pts['data']['community']['id']) === Number(item['data']['user']['id']))

                let channel: IChannelExtended = {
                    id: Number(item['data']['user']['id']),
                    login: item['data']['user']['login'],
                    displayName: item['data']['user']['displayName'],
                    profileImage: item['data']['user']['profileImageURL'],
                    points: {
                        balance: Number(rawPoints['data']['community']['channel']['self']['communityPoints']['balance'])
                    }
                }

                if (rawPoints && rawPoints['data']['community']['channel']['communityPointsSettings']['image'] !== null) {
                    channel.points.pointsImage = rawPoints['data']['community']['channel']['communityPointsSettings']['image']['url4x']
                }

                if (item['data']['user']['stream'] !== null) {
                    channel.stream = {
                        id: Number(item['data']['user']['stream']['id']),
                        viewersCount: Number(item['data']['user']['stream']['viewersCount']),
                        title: item['data']['user']['broadcastSettings']['title'],
                        game: {
                            id: item['data']['user']['broadcastSettings']['game']['id'],
                            name: item['data']['user']['broadcastSettings']['game']['displayName'],
                            slug: item['data']['user']['broadcastSettings']['game']['slug']
                        }
                    }
                }

                return channel
            })
        }

        return []
    }

    public async searchChannels(query: string): Promise<IChannel[]> {
        let resp = await this.request(OperationGQL.SearchTray(query))
        
        if (resp) {
            let rawItem = resp['data']['searchSuggestions']['edges'] as {[key: string]: any}[]

            return rawItem.map<IChannel | undefined>(item => {
                if (item['node']['content'] === null)
                    return undefined

                return {
                    id: Number(item['node']['content']['id']),
                    name: item['node']['content']['login'] ,
                    isLive: Boolean(item['node']['content']['isLive']),
                    isVerified: Boolean(item['node']['content']['isVerified']),
                    profileImage: item['node']['content']['profileImageURL']
                }
            }).filter(it => it !== undefined)
        }

        return []
    }

    public async searchGame(query: string): Promise<IGame[]> {
        let resp = await this.request(OperationGQL.SearchTray(query, false))
        
        if (resp) {
            let rawItem = resp['data']['searchSuggestions']['edges'] as {[key: string]: any}[]

            let results = rawItem.map<IGame | undefined>(item => {
                if (item['node']['content'] === null || !('game' in item['node']['content']))
                    return undefined

                return {
                    id: item['node']['content']['id'],
                    slug: item['node']['content']['game']['slug'],
                    displayName: "",
                    boxArtURL: item['node']['content']['boxArtURL'].replace(/\d+x\d+/g, "144x192")
                }
            }).filter(it => it !== undefined)

            let gameDirs = await this.getGameDirectory(results.map(game => game.slug), 1)
            results.forEach((game, idx) => {
                game.displayName = gameDirs[idx].displayName
            })

            return results
        }

        return []
    }

    public async getGame(slug: string | string[]): Promise<IGame[]> {
        if (typeof slug === "string") {
            slug = [slug]
        }

        let slugChunk = splitArrayIntoChunks(slug, 15)

        let results = await Promise.all(slugChunk.map(chunk => this.request(chunk.map(it => OperationGQL.GameDirectory(it, 1)))))
        let resp: any[] = results.flat()
        return resp.map<IGame>((it, idx) => {
            return {
                id: it['data']['game']['id'],
                displayName: it['data']['game']['displayName'],
                slug: slug[idx],
                boxArtURL: getGameBoxArt(it['data']['game']['id'])
            }
        })
    }

    public async getPlaybackAccessToken(login: string): Promise<IPlaybackAccessToken | undefined> {
        let resp = await this.request(OperationGQL.PlaybackAccessToken(login))

        if (resp) {
            return {
                value: resp['data']['streamPlaybackAccessToken']['value'],
                signature: resp['data']['streamPlaybackAccessToken']['signature'],
                authorization: {
                    isForbidden: Boolean(resp['data']['streamPlaybackAccessToken']['authorization']['isForbidden']),
                    forbiddenReasonCode: resp['data']['streamPlaybackAccessToken']['authorization']['forbiddenReasonCode']
                }
            }
        }

        return undefined
    }

    public async getChannelPointContext(login: string | string[]): Promise<IContextPoint[]> {
        if (typeof login === "string") {
            login = [login]
        }

        let loginChunk = splitArrayIntoChunks(login, 15)

        let results = await Promise.all(loginChunk.map(chunk => this.request(chunk.map(it => OperationGQL.ChannelPointsContext(it)))))
        let resp: any[] = results.flat()

        return resp.map<IContextPoint>(it => {
            let context: IContextPoint = {
                channel: {
                    id: Number(it['data']['community']['id']),
                    login: it['data']['community']['login'],
                    displayName: it['data']['community']['displayName'],
                    profileImage: it['data']['community']['profileImageURL']
                },
                balance: it['data']['community']['channel']['self']['communityPoints']['balance']
            }
    
            if (it['data']['community']['channel']['self']['communityPoints']['availableClaim'] !== null) {
                context.availableClaim = {
                    id: it['data']['community']['channel']['self']['communityPoints']['availableClaim']['id']
                }
            }
    
            return context
        })
    }

    public async getDetailedCampaign(campaignId: string | string[]): Promise<IDetailedCampaign[]> {
        if (typeof campaignId === "string") {
            campaignId = [campaignId]
        }

        let userdata = await this.userData.get()
        let campaignChunk = splitArrayIntoChunks(campaignId, 15)
        let results = await Promise.all(campaignChunk.map(chunk => this.request(chunk.map(it => OperationGQL.CampaignDetails(String(userdata.id), it)))))

        let resp: any[] = results.flat()
        return resp.filter(r => !('errors' in r)).map(r => {
            let raw = r['data']['user']['dropCampaign']

            let rawDrops = r['data']['user']['dropCampaign']['timeBasedDrops'] as any[]
            delete raw['timeBasedDrops']

            raw['drops'] = rawDrops.map<IDrop>(it => ({
                dropId: it['id'],
                requiredMinutesWatched: it['requiredMinutesWatched'],
                benefits: (it['benefitEdges'] as any[]).map<IBenefit>(benefit => ({
                    id: benefit['benefit']['id'],
                    imageURL: benefit['benefit']['imageAssetURL'],
                    name: benefit['benefit']['name']
                }))
            }))

            // add boxart
            let obj: IDetailedCampaign = raw as IDetailedCampaign
            obj.game.boxArtURL = getGameBoxArt(obj.game.id)

            return obj
        })
    } 

    public async getGameDirectory(slug: string | string[], limit?: number): Promise<IGameDirectory[]> {
        if (typeof slug === "string") {
            slug = [slug]
        }

        let slugChunk = splitArrayIntoChunks(slug, 15)
        let results = await Promise.all(slugChunk.map(chunk => this.request(chunk.map(it => OperationGQL.GameDirectory(it, limit)))))

        let resp: any[] = results.flat()
        return resp.map(r => r['data']['game'] as IGameDirectory)
    }

    public async getInventory(): Promise<IInventory | undefined> {
        let result = await this.request(OperationGQL.Inventory())
        if (result) {
            return result['data']['currentUser']['inventory'] as IInventory
        }

        return undefined
    }

    public async claimPoints(claimId: string | string[], channelId: number | number[]): Promise<boolean[]> {
        if (typeof claimId === "string") {
            claimId = [claimId]
        }
        if (typeof channelId === "number") {
            channelId = [channelId]
        }

        if (claimId.length !== channelId.length) {
            throw new Error(`Bad params: claim(${claimId.length}) !== channel(${channelId.length})`)
        }

        let merge = claimId.map<[string, number]>((claimId, idx) => [claimId, channelId[idx]])
        let claimChunk = splitArrayIntoChunks(merge, 15)

        let results = await Promise.all(claimChunk.map(chunk => this.request(chunk.map(it => OperationGQL.ClaimComunityPoints(it[0], String(it[1]))))))
        let resp: any[] = results.flat()
        return resp.map(r => r !== undefined && !('errors' in r))
    }

    public async claimDrops(instanceId: string | string[]): Promise<boolean[]> {
        if (typeof instanceId === "string") {
            instanceId = [instanceId]
        }

        let instanceIdChunk = splitArrayIntoChunks(instanceId, 15)
        let results = await Promise.all(instanceIdChunk.map(chunk => this.request(chunk.map(it => OperationGQL.ClaimDrop(it)))))
        let resp: any[] = results.flat()
        return resp.map(r => r !== undefined && !('errors' in r) && r['data']['claimDropRewards'] !== null)
    }

    public getUserData(): Promise<IUser> {
        return this.userData.get()
    }

    public getCampaigns(): Promise<ICampaign[]> {
        return this.campaignData.get()
    }

    public getFollowChannel(): Promise<IChannel[]> {
        return this.followData.get()
    }
}
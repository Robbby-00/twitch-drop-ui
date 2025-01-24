import { Mutex } from 'async-mutex';
import { existsSync, readFileSync, writeFileSync } from "fs";

// components
import { TW } from "..";
import { Watch } from "./watch";
import { Settings } from '../settings';

// constant
import { PATH_TRACKERFILE } from "../constant";

// @types
import { IChannelExtended, IDetailedCampaignPrioritize, IGame } from "../twitch/@type";
import { ITrackerObject, TargetPayload, IPayloadTracker, IWatchingChannel, ITrackerResult } from "./@types";
import { Color, LogLevel } from "../utils/logger/@type";
import { SettingKeys } from '../settings/@type';

// @decorators
import { mutex } from '../@decorator/mutex';

// utils
import { Logger } from "../utils/logger";
import { applyPriorityValue, getDayInMillis, searchCampaignChannels } from "../utils";
import { emitUpdate, UpdateType } from '../api/routers/ws';

const resourcesMutex = new Mutex()

enum ReasonTrack {
    Manual = "manual",
    Game = "game",
    LinkedAccount = "linked-account"
}

interface CutstomCamapign {
    reason: ReasonTrack[],
    campaign: IDetailedCampaignPrioritize
}

export class Tracker {
    private static log: Logger = new Logger({
        name: "Tracker",
        color: Color.YELLOW,
        logLevel: LogLevel.DEBUG
    })
    public static nextUpdate: number = Date.now() + (Settings.getValue(SettingKeys.UPDATE_INTERVAL) * 1000)
    private static pointChannels: IChannelExtended[] = []
    private static dropCampaign: CutstomCamapign[] = []
    private static trackingGame: IGame[] = []
    private static watchers: Watch[] = []

    private static toObject(): ITrackerObject {
        return {
            pointChannels: this.pointChannels.map(it => it.login),
            dropCampaign: this.dropCampaign.filter(it => it.reason.includes(ReasonTrack.Manual)).map(it => it.campaign.id),
            tarckingGame: this.trackingGame.map(it => it.slug)
        }
    }

    @mutex(resourcesMutex)
    private static async updateData(overrideChannel?: string[], overrideCampaign?: string[], overrideGame?: string[]): Promise<void> {
        let startTime = Date.now()
        let channelLogin: string[] = overrideChannel ?? this.pointChannels.map(it => it.login)
        let manualCampaignId: string[] = overrideCampaign ?? this.dropCampaign.filter(it => it.reason.includes(ReasonTrack.Manual)).map(it => it.campaign.id)
        let gameSlug: string[] = overrideGame ?? this.trackingGame.map(it => it.slug)
        
        // update games
        let gameCampaignId: string[] = []
        if (gameSlug.length > 0) {
            this.trackingGame = await TW.getGame(gameSlug)
            
            let campaigns = await TW.getCampaigns()
            campaigns.forEach(campaign => {
                if (this.trackingGame.find(game => game.id === campaign.game.id)) {
                    gameCampaignId.push(campaign.id)
                }
            })
        }

        // add auto connected campaign
        let linkedAccountCampaignId: string[] = []
        if (Settings.getValue(SettingKeys.AUTO_CONNECTED_CAMPAIGN)) {
            let campaigns = await TW.getCampaigns()
            campaigns.forEach(campaign => {
                if (campaign.self.isAccountConnected) {
                    linkedAccountCampaignId.push(campaign.id)
                }
            })
        }

        // request update
        let updatedChannels = await TW.getExtendedChannel([...new Set(channelLogin)])
        let updatedCampaign = await TW.getDetailedCampaign([...new Set(manualCampaignId.concat(gameCampaignId).concat(linkedAccountCampaignId))])

        // remove expired campaign (more than 1 days)
        updatedCampaign = updatedCampaign.filter(c => Date.parse(c.endAt) + getDayInMillis() > Date.now())

        // add drop details to updatedCampaign
        let inventory = await TW.getInventory()
        if (inventory) {
            // update drop minutes watched
            if (inventory.dropCampaignsInProgress) {
                for (let invCampaign of inventory.dropCampaignsInProgress) {
                    let campaign = updatedCampaign.find(campaign => campaign.id === invCampaign.id)
                    if (campaign) {
                        campaign.drops = campaign.drops.map(drop => {
                            let rawInvDrop = invCampaign.timeBasedDrops.find(it => it.id === drop.dropId)
                            if (rawInvDrop) {
                                drop.minutesWatched = rawInvDrop.self.currentMinutesWatched
                                drop.isClaimed = rawInvDrop.self.isClaimed
                                if (rawInvDrop.self.dropInstanceID !== null) {
                                    drop.dropInstanceID = rawInvDrop.self.dropInstanceID
                                }
                            }
                            
                            return drop
                        })
                    }
                }
            }else this.log.warn("Failed to update drop watch time!")
            
            if (inventory.gameEventDrops) {
                for (let collectedReward of inventory.gameEventDrops) {
                    let dropCount = collectedReward.totalCount
                    for (let campaign of updatedCampaign) {
                        for (let drop of campaign.drops) {
                            for (let benefit of drop.benefits) {
                                if (benefit.id === collectedReward.id) {
                                    drop.isClaimed = true
                                    dropCount--
                                }

                                if (dropCount <= 0) break
                            }
                        }
                    }
                }
            }else this.log.warn("Failed to update drop claimed!")
        }else this.log.warn("Failed to retrive inventory!")

        // add priority
        let updatedCampaignPrioritize = updatedCampaign.map<IDetailedCampaignPrioritize>(applyPriorityValue)

        // update channelsPoint
        this.pointChannels = updatedChannels.filter(channel => channelLogin.includes(channel.login))

        // update campaigns
        this.dropCampaign = updatedCampaignPrioritize.map<CutstomCamapign>(campaign => {
            let reason: ReasonTrack[] = []

            if (manualCampaignId.includes(campaign.id)) {
                reason.push(ReasonTrack.Manual)
            }

            if (gameCampaignId.includes(campaign.id)) {
                reason.push(ReasonTrack.Game)
            }

            if (linkedAccountCampaignId.includes(campaign.id)) {
                reason.push(ReasonTrack.LinkedAccount)
            }

            return {
                reason,
                campaign
            }
        })

        // update watchers
        this.watchers.forEach(w => {
            let upChannel = updatedChannels.find(ch => ch.id === w.channel.id)
            if (upChannel) {
                w.channel = upChannel
            }

            if (w.campaign.length > 0) {
                w.campaign = w.campaign.map(c => {
                    return updatedCampaign.find(uc => uc.id === c.id) ?? c
                })
            }
        })
        this.updateWatchers()
        
        this.log.info(`Updated data in ${Date.now() - startTime}ms`)

        emitUpdate(UpdateType.TRACK_CHANNEL)
        emitUpdate(UpdateType.TRACK_CAMPAIGN)
        emitUpdate(UpdateType.TRACK_GAME)
    }

    @mutex(resourcesMutex)
    private static async onWatcherShutdown(target: Watch) {
        let idx = this.watchers.findIndex(w => w.channel.id === target.channel.id)
        if (idx > -1) {
            this.log.debug(`Removed watcher on channel: ${this.watchers[idx].channel.displayName}`)
            this.watchers.splice(idx, 1)
            
            this.updateWatchers()
        }
    }

    @mutex(resourcesMutex)
    private static async updateWatchers() {
        this.log.info("Updating Watchers...")

        let channelNTWPoint = this.pointChannels.filter(it => it.stream)
        let channelNTWCampaign: [IChannelExtended, IDetailedCampaignPrioritize][] = []

        // get campaign to watch
        let campaignToWatch = this.dropCampaign.map(cc => cc.campaign).filter(c => c.status === "ACTIVE" && !c.drops.every(drop => drop.isClaimed))

        // sort campaign based on remaining time and drop length
        campaignToWatch.sort((a, b) => a.priority - b.priority)

        // set to watch first available campaign
        let watchingCampaign = 0
        for (let campaign of campaignToWatch) {
            let watcher = this.watchers.find(w => w.hasLinkedCampaign(campaign))
            if (watcher && watcher.channel.stream?.game.id === campaign.game.id) {
                // already watching it

                channelNTWCampaign.push([watcher.channel, campaign])
                watchingCampaign++
            }else {
                let channel = await searchCampaignChannels(campaign)
                if (channel) {
                    // set to watch channel
    
                    channelNTWCampaign.push([channel, campaign])
                    watchingCampaign++
                } else this.log.info(`No channel found for "${campaign.name}" campaign`)
            }

            // reached max concurrent campaign
            if (!(watchingCampaign < Settings.getValue(SettingKeys.MAX_CONCURRENT_CAMPAIGN))) break
        }

        // filter channelNTWPoint, based on max concurrent watcher
        channelNTWPoint = channelNTWPoint.slice(0, Settings.getValue(SettingKeys.MAX_CONCURRENT_WATCHER) - watchingCampaign)

        // reset watchers link
        this.watchers.forEach(w => w.resetLink())

        // update watchers
        for (let channel of channelNTWPoint) {
            let watcher = this.watchers.find(it => it.channel.id === channel.id)
            if (watcher) {
                // already watch channel, link channel point to it
                
                this.log.debug(`Link channel point with watcher of ${watcher.channel.displayName}`)
                watcher.pointsClaim = true
            }else {
                // start to watch new channel

                this.log.debug(`Start watching: ${channel.displayName} [reason: ChannelPoint]`)
                let watcher = new Watch(channel, () => this.onWatcherShutdown(watcher), { points: true })
                this.watchers.push(watcher)
                watcher.watch()
            }
        }

        for (let [channel, campaign] of channelNTWCampaign) {
            let watcher = this.watchers.find(it => it.channel.id === channel.id)
            if (watcher) {
                // already watch channel, link campaign to it
                
                this.log.debug(`Link campaign with watcher of ${watcher.channel.displayName}`)
                watcher.addLinkedCampaign(campaign)
            }else {
                // start to watch new channel

                this.log.debug(`Start watching: ${channel.displayName} [reason: Campaign]`)
                let watcher = new Watch(channel, () => this.onWatcherShutdown(watcher), { campaign: campaign })
                this.watchers.push(watcher)
                watcher.watch()
            }
        }

        // stop and remove useless watcher (without event callback)
        this.watchers = this.watchers.filter(w => {
            let removed = w.isUseless()

            if (removed) w.stop(true)

            return !removed
        })

        emitUpdate(UpdateType.WATCHING_CHANNEL)
    }

    private static async claimAll() {
        this.log.info("Checking available reward...")
        
        const channelToCheckPoint = this.watchers.filter(w => w.pointsClaim)

        // claim points if available
        if (channelToCheckPoint.length > 0) {
            let pointContexts = await TW.getChannelPointContext(channelToCheckPoint.map(w => w.channel.login))
            let avaiablePoints = pointContexts.map<[string, number] | undefined>(pc => pc.availableClaim ? [pc.availableClaim.id, pc.channel.id] as [string, number] : undefined).filter(pc => pc !== undefined)
    
            let resp = await TW.claimPoints(avaiablePoints.map(ap => ap[0]), avaiablePoints.map(ap => ap[1]))
            resp.forEach((claimed, idx) => this.log.info(`${claimed ? "Succesfully" : "Failed to"} claim points for ${pointContexts[idx].channel.displayName}`))
        }
    
        // claim drop if available
        let dropToClaim: string[] = []
        for (let { campaign } of this.dropCampaign) {
            let claimable = campaign.drops.map<string | undefined>(drop => !drop.isClaimed ? drop.dropInstanceID : undefined)
            dropToClaim.push(...claimable.filter<string>(dropInstanceID => dropInstanceID !== undefined))
        }

        (await TW.claimDrops(dropToClaim)).forEach((res, idx) => {
            let dropInstanceID = dropToClaim[idx]
            let [userId, campaignId, dropId] = dropInstanceID.split("#")

            let selectedCampaign = this.dropCampaign.find(cc => cc.campaign.id === campaignId)?.campaign
            if (selectedCampaign) {
                let selectedDrop = selectedCampaign.drops.find(drop => drop.dropId === dropId)
                if (selectedDrop) {
                    selectedDrop.isClaimed = true
                    this.log.info(`Claimed reward for ${selectedCampaign.name} - ${selectedDrop.dropId}`)
                    return
                }
            }

            this.log.warn(`Failed to find a match for this drop: ${dropInstanceID}`)
        })
    }

    private static async startUpdateSystem() {
        this.log.info("Started update system")

        var timeoutUpdate: NodeJS.Timeout | undefined
        var resolve: (value?: unknown) => void | undefined
        const forceUpdate = () => {
            if (timeoutUpdate) {
                clearTimeout(timeoutUpdate)
            }
            
            this.updateData().then(resolve)
        }

        Settings.on(SettingKeys.AUTO_CONNECTED_CAMPAIGN, forceUpdate)
        Settings.on(SettingKeys.MAX_CONCURRENT_CAMPAIGN, forceUpdate)
        Settings.on(SettingKeys.MAX_CONCURRENT_WATCHER, forceUpdate)

        while (true) {
            await new Promise(res => {
                resolve = res
                timeoutUpdate = setTimeout(() => {
                    this.updateData().then(res)
                }, this.nextUpdate - Date.now())
            })
            this.nextUpdate = Date.now() + (Settings.getValue(SettingKeys.UPDATE_INTERVAL) * 1000)
        }
    }

    private static async startClaimSystem() {
        this.log.info("Started claim system")

        await this.claimAll()
        while (true) {
            await new Promise(resolve => setTimeout(async () => {
                this.claimAll().then(resolve)
            }, Settings.getValue(SettingKeys.CLAIM_INTERVAL) * 1000))
        }
    }

    public static dump(): void {
        this.log.info(`Dumping data to ${PATH_TRACKERFILE}`)
        writeFileSync(PATH_TRACKERFILE, JSON.stringify(this.toObject()), { encoding: "utf-8" })
    }

    public static async load(): Promise<void> {
        if (existsSync(PATH_TRACKERFILE)) {
            this.log.info(`Load data from ${PATH_TRACKERFILE}`)

            let raw = readFileSync(PATH_TRACKERFILE, { encoding: "utf-8" })
            try {
                let rawData = JSON.parse(raw) as ITrackerObject

                await this.updateData(rawData.pointChannels, rawData.dropCampaign, rawData.tarckingGame)
            }catch (err) {
                this.log.warn(`Failed to load file at ${PATH_TRACKERFILE}, with error: ${err}`)
            }

        } else this.log.warn(`File not exist at ${PATH_TRACKERFILE}`)

        this.startClaimSystem()
        this.startUpdateSystem()
    }

    /*
        ADD
    */
    
    public static async add(data: IPayloadTracker): Promise<boolean> {
        let state: ITrackerResult

        switch (data.type) {
            case TargetPayload.Point:
                state = await this.addChannel(data.payload)
                if (state === ITrackerResult.Successfully) {
                    emitUpdate(UpdateType.TRACK_CHANNEL)
                }

                break
            case TargetPayload.Campaign:
                state = await this.addCampaign(data.payload)
                if (state === ITrackerResult.Successfully) {
                    emitUpdate(UpdateType.TRACK_CAMPAIGN)
                }

                break
            case TargetPayload.Game:
                state = await this.addGame(data.payload)
                if (state === ITrackerResult.Successfully) {
                    emitUpdate(UpdateType.TRACK_GAME)
                }

                break
        } 

        if (state === ITrackerResult.Successfully) {
            // if changed something dump data
            this.dump()
            this.updateWatchers()
        }
        
        return state !== ITrackerResult.NotFound
    }

    @mutex(resourcesMutex)
    private static async addChannel(channelId: string): Promise<ITrackerResult> {
        if (this.pointChannels.find(it => it.login === channelId) !== undefined) {
            // channel already in the list
            return ITrackerResult.AlreadyExist
        }

        let resChannel = await TW.getExtendedChannel(channelId)
        if (resChannel.length === 0) {
            // channel not found
            return ITrackerResult.NotFound
        }

        // add channel to list
        this.pointChannels.push(resChannel[0])
        return ITrackerResult.Successfully
    }

    @mutex(resourcesMutex)
    private static async addCampaign(campaignId: string): Promise<ITrackerResult> {
        let selectedCustomCampaign = this.dropCampaign.find(it => it.campaign.id === campaignId)
        if (selectedCustomCampaign !== undefined) {
            // campaign already in the list
            if (!selectedCustomCampaign.reason.includes(ReasonTrack.Manual)) {
                selectedCustomCampaign.reason.push(ReasonTrack.Manual)
            }
            
            return ITrackerResult.AlreadyExist
        }
        
        let detailedCampaign = await TW.getDetailedCampaign(campaignId)
        if (detailedCampaign.length === 0) {
            // campaign not found
            return ITrackerResult.NotFound
        }

        // add campaign to list
        this.dropCampaign.push({
            reason: [ReasonTrack.Manual],
            campaign: applyPriorityValue(detailedCampaign[0])
        })
        return ITrackerResult.Successfully
    }

    @mutex(resourcesMutex)
    private static async addGame(slug: string): Promise<ITrackerResult> {
        if (this.trackingGame.find(it => it.slug ===slug) !== undefined) {
            // game already in the list
            return ITrackerResult.AlreadyExist
        }

        let resGame = await TW.getGame(slug)
        if (resGame.length === 0) {
            // game not found
            return ITrackerResult.NotFound
        }

        // add game to list
        this.trackingGame.push(resGame[0])
        
        // add campaigns
        let campaignIdToAdd = (await TW.getCampaigns()).filter(c => c.game.id === resGame[0].id).map(c => c.id)
        let detailedCampaign = await TW.getDetailedCampaign(campaignIdToAdd)
        detailedCampaign.forEach(dc => {
            let customCampaign = this.dropCampaign.find(cc => cc.campaign.id === dc.id)
            if (customCampaign && !customCampaign.reason.includes(ReasonTrack.Game)) {
                customCampaign.reason.push(ReasonTrack.Game)
            }else {
                this.dropCampaign.push({
                    reason: [ReasonTrack.Game],
                    campaign: applyPriorityValue(dc)
                })
            }
        })

        return ITrackerResult.Successfully
    }


    /*
        REMOVE
    */

    public static async remove(data: IPayloadTracker): Promise<boolean> {
        let state: ITrackerResult

        switch (data.type) {
            case TargetPayload.Point:
                state = await this.removeChannel(data.payload)
                if (state === ITrackerResult.Successfully) {
                    emitUpdate(UpdateType.TRACK_CHANNEL)
                }

                break
            case TargetPayload.Campaign:
                state = await this.removeCampaign(data.payload)
                if (state === ITrackerResult.Successfully) {
                    emitUpdate(UpdateType.TRACK_CAMPAIGN)
                }

                break
            case TargetPayload.Game:
                state = await this.removeGame(data.payload)
                if (state === ITrackerResult.Successfully) {
                    emitUpdate(UpdateType.TRACK_GAME)
                }

                break
        }

        if (state === ITrackerResult.Successfully) {
            // if changed something dump data
            this.dump()
            this.updateWatchers()
        }

        return state !== ITrackerResult.NotFound
    }

    @mutex(resourcesMutex)
    private static async removeChannel(channelId: string): Promise<ITrackerResult> {
        let idxChannel = this.pointChannels.findIndex(it => it.login === channelId)
        if (idxChannel > -1) {
            // remove channel
            this.pointChannels.splice(idxChannel, 1)

            return ITrackerResult.Successfully
        }

        // channel not found
        return ITrackerResult.NotFound
    }

    @mutex(resourcesMutex)
    private static async removeCampaign(campaignId: string): Promise<ITrackerResult> {
        let idxCampaign = this.dropCampaign.findIndex(cc => cc.campaign.id === campaignId)
        if (idxCampaign > -1) {
            // remove campaign
            this.dropCampaign[idxCampaign].reason = this.dropCampaign[idxCampaign].reason.filter(r => r !== ReasonTrack.Manual)
            if (this.dropCampaign[idxCampaign].reason.length === 0) {
                this.dropCampaign.splice(idxCampaign, 1)
            }
            
            return ITrackerResult.Successfully
        }

        // campaign not found
        return ITrackerResult.NotFound
    }

    @mutex(resourcesMutex)
    private static async removeGame(slug: string): Promise<ITrackerResult> {
        let idxGame = this.trackingGame.findIndex(it => it.slug === slug)
        if (idxGame > -1) {
            // remove game
            let removed = this.trackingGame.splice(idxGame, 1)
            if (removed.length > 0) {
                // remove all linked campaign
                let idxToSplice: number[] = []
                this.dropCampaign.forEach((cc, idx) => {
                    if (cc.campaign.game.id === removed[0].id) {
                        cc.reason = cc.reason.filter(r => r !== ReasonTrack.Game)
                        if (cc.reason.length === 0) {
                            idxToSplice.push(idx)
                        }
                    }
                })

                for (let idx of idxToSplice) {
                    this.dropCampaign.splice(idx, 1)
                }
            }

            return ITrackerResult.Successfully
        }

        // game not found
        return ITrackerResult.NotFound
    }

    /*
        GET
    */
    public static get getPointChannels(): IChannelExtended[] {
        return this.pointChannels
    }

    public static get getDropCampaign(): IDetailedCampaignPrioritize[] {
        return this.dropCampaign.map(cc => cc.campaign)
    }

    public static get getTrackingGame(): IGame[] {
        return this.trackingGame
    }

    public static get getWatchingChannel(): IWatchingChannel[] {
        return this.watchers.map<IWatchingChannel>(watcher => ({
            channel: watcher.channel,
            calimPoints: watcher.pointsClaim,
            campaign: watcher.campaign
        }))
    }
}
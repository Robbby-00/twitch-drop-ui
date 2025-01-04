import { IOperationGQL } from "../@type";
import { IVarAvailableDrops, IVarCampaignDetails, IVarCampaigns, IVarChannelPointsContext, IVarClaimComunityPoints, IVarClaimDrop, IVarCurrentDrop, IVarFollowedChannels, IVarGameDirectory, IVarGetStreamInfo, IVarInventory, IVarPlaybackAccessToken, IVarSearchTray, IVarSlugRedirect } from "../@type/gql";

export const LinkGQL = "https://gql.twitch.tv/gql"

export enum OperationNameGQL {
    FollowedChannels = "PersonalSections",
    SearchTray = "SearchTray_SearchSuggestions",
    GetUserInfo = "VerifyEmail_CurrentUser",
    GetUserImage = "UserMenuCurrentUser",
    GetStreamInfo = "VideoPlayerStreamInfoOverlayChannel",
    ClaimComunityPoints = "ClaimCommunityPoints",
    ClaimDrop = "DropsPage_ClaimDropRewards",
    ChannelPointsContext = "ChannelPointsContext",
    Inventory = "Inventory",
    CurrentDrop = "DropCurrentSessionContext",
    Campaigns = "ViewerDropsDashboard",
    CampaignDetails = "DropCampaignDetails",
    AvailableDrops = "DropsHighlightService_AvailableDrops",
    PlaybackAccessToken = "PlaybackAccessToken",
    GameDirectory = "DirectoryPage_Game",
    SlugRedirect = "DirectoryGameRedirect"
}

export enum Sha256GQL {
    FollowedChannels = "4c3776186239b845f100e5d989a4823f8586c899fb5e7cd856efabd2405b998c",
    SearchTray = "2749d8bc89a2ddd37518e23742a4287becd3064c40465d8b57317cabd0efe096",
    GetUserInfo = "f9e7dcdf7e99c314c82d8f7f725fab5f99d1df3d7359b53c9ae122deec590198",
    GetUserImage = "3cff634f43c5c78830907a662b315b1847cfc0dce32e6a9752e7f5d70b37f8c0",
    GetStreamInfo = "198492e0857f6aedead9665c81c5a06d67b25b58034649687124083ff288597d",
    ClaimComunityPoints = "46aaeebe02c99afdf4fc97c7c0cba964124bf6b0af229395f1f6d1feed05b3d0",
    ClaimDrop = "a455deea71bdc9015b78eb49f4acfbce8baa7ccbedd28e549bb025bd0f751930",
    ChannelPointsContext = "374314de591e69925fce3ddc2bcf085796f56ebb8cad67a0daa3165c03adc345",
    Inventory = "09acb7d3d7e605a92bdfdcc465f6aa481b71c234d8686a9ba38ea5ed51507592",
    CurrentDrop = "4d06b702d25d652afb9ef835d2a550031f1cf762b193523a92166f40ea3d142b",
    Campaigns = "5a4da2ab3d5b47c9f9ce864e727b2cb346af1e3ea8b897fe8f704a97ff017619",
    CampaignDetails = "039277bf98f3130929262cc7c6efd9c141ca3749cb6dca442fc8ead9a53f77c1",
    AvailableDrops = "9a62a09bce5b53e26e64a671e530bc599cb6aab1e5ba3cbd5d85966d3940716f",
    PlaybackAccessToken = "ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9",
    GameDirectory = "c7c9d5aad09155c4161d2382092dc44610367f3536aac39019ec2582ae5065f9",
    SlugRedirect = "1f0300090caceec51f33c5e20647aceff9017f740f223c3c532ba6fa59f6b6cc",
}

export class OperationGQL {
    /**
     * Builds the basic structure for an operation with a given name and SHA-256 hash.
     * @param name - The name of the operation.
     * @param sha - The SHA-256 hash for the operation.
     * @returns The operation object with the provided name and hash.
     */
    private static _buildOperations(name: OperationNameGQL, sha: Sha256GQL): IOperationGQL<any> {
        return {
            operationName: name,
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: sha
                }
            }
        }
    }

     /**
     * Queries followed channels.
     * @returns The operation for querying followed channels.
     */
     public static FollowedChannels(): IOperationGQL<IVarFollowedChannels> {
        return {
            ...this._buildOperations(OperationNameGQL.FollowedChannels, Sha256GQL.FollowedChannels),
            variables: {
                creatorAnniversariesFeature: false,
                withFreeformTags: false,
                input: {
                    recommendationContext: {
                        platform: "web",
                        clientApp: "twilight"
                    },
                    sectionInputs: ["RECS_FOLLOWED_SECTION"]
                }
            }
        }
    }

    /**
     * Queries games/channels by name.
     * @returns The operation for querying games/channels.
     */
    public static SearchTray(query: string, offlineChannel: boolean = true): IOperationGQL<IVarSearchTray> {
        return {
            ...this._buildOperations(OperationNameGQL.SearchTray, Sha256GQL.SearchTray),
            variables: {
                queryFragment: query,
                includeIsDJ: false,
                withOfflineChannelContent: offlineChannel
            }
        }
    }
    
    /**
     * Retrieves user information.
     * @returns The operation for fetching user information.
     */
    public static GetUserInfo(): IOperationGQL<{}> {
        return {
            ...this._buildOperations(OperationNameGQL.GetUserInfo, Sha256GQL.GetUserInfo),
            variables: {}
        }
    }

    /**
     * Retrieves user profile image.
     * @returns The operation for fetching user profile image.
     */
    public static GetUserImage(): IOperationGQL<{}> {
        return {
            ...this._buildOperations(OperationNameGQL.GetUserImage, Sha256GQL.GetUserImage),
            variables: {}
        }
    }

    /**
     * Retrieves stream information for a specified channel.
     * @param channel - The name of the channel.
     * @returns The operation for fetching stream information.
     */
    public static GetStreamInfo(channel: string): IOperationGQL<IVarGetStreamInfo> {
        return {
            ...this._buildOperations(OperationNameGQL.GetStreamInfo, Sha256GQL.GetStreamInfo),
            variables: {
                channel: channel
            }
        }
    }

    /**
     * Claims community points for a given claim ID and channel ID.
     * @param clamId - The claim ID.
     * @param channelId - The channel ID.
     * @returns The operation for claiming community points.
     */
    public static ClaimComunityPoints(clamId: string, channelId: string): IOperationGQL<IVarClaimComunityPoints> {
        return {
            ...this._buildOperations(OperationNameGQL.ClaimComunityPoints, Sha256GQL.ClaimComunityPoints),
            variables: {
                input: {
                    claimID: clamId,
                    channelID: channelId
                }
            }
        }
    }

    /**
     * Claims a drop for a given drop ID.
     * @param dropId - The ID of the drop.
     * @returns The operation for claiming a drop.
     */
    public static ClaimDrop(dropId: string): IOperationGQL<IVarClaimDrop> {
        return {
            ...this._buildOperations(OperationNameGQL.ClaimDrop, Sha256GQL.ClaimDrop),
            variables: {
                input: {
                    dropInstanceID: dropId
                }
            }
        }
    }

    /**
     * Retrieves the current state of points (balance, claims) for a specified channel.
     * @param channelLogin - The login name of the channel.
     * @returns The operation for fetching channel points context.
     */
    public static ChannelPointsContext(channelLogin: string): IOperationGQL<IVarChannelPointsContext> {
        return {
            ...this._buildOperations(OperationNameGQL.ChannelPointsContext, Sha256GQL.ChannelPointsContext),
            variables: {
                channelLogin: channelLogin
            }
        } 
    }

    /**
     * Retrieves all in-progress campaigns.
     * @returns The operation for fetching inventory.
     */
    public static Inventory(): IOperationGQL<IVarInventory> {
        return {
            ...this._buildOperations(OperationNameGQL.Inventory, Sha256GQL.Inventory),
            variables: {
                fetchRewardCampaigns: false
            }
        } 
    }

    /**
     * Retrieves the current state of drops (e.g., current progress) for a specified channel.
     * @param channelId - The ID of the channel.
     * @returns The operation for fetching the current drop state.
     */
    public static CurrentDrop(channelId: string): IOperationGQL<IVarCurrentDrop> {
        return {
            ...this._buildOperations(OperationNameGQL.CurrentDrop, Sha256GQL.CurrentDrop),
            variables: {
                channelID: channelId,
                channelLogin: ""
            }
        } 
    }

    /**
     * Retrieves all available campaigns.
     * @returns The operation for fetching campaigns.
     */
    public static Campaigns(): IOperationGQL<IVarCampaigns> {
        return {
            ...this._buildOperations(OperationNameGQL.Campaigns, Sha256GQL.Campaigns),
            variables: {
                fetchRewardCampaigns: false
            }
        } 
    }

    /**
     * Retrieves extended information about a specified campaign.
     * @param channelLogin - The login name of the channel.
     * @param dropId - The ID of the drop.
     * @returns The operation for fetching campaign details.
     */
    public static CampaignDetails(channelLogin: string, dropId: string): IOperationGQL<IVarCampaignDetails> {
        return {
            ...this._buildOperations(OperationNameGQL.CampaignDetails, Sha256GQL.CampaignDetails),
            variables: {
                channelLogin: channelLogin,
                dropID: dropId
            }
        } 
    }

    /**
     * Retrieves available drops for a specified channel.
     * @param channelId - The ID of the channel.
     * @returns The operation for fetching available drops.
     */
    public static AvailableDrops(channelId: string): IOperationGQL<IVarAvailableDrops> {
        return {
            ...this._buildOperations(OperationNameGQL.AvailableDrops, Sha256GQL.AvailableDrops),
            variables: {
                channelID: channelId
            }
        } 
    }

    /**
     * Retrieves a stream playback access token for a specified channel.
     * @param channelLogin - The login name of the channel.
     * @returns The operation for fetching the playback access token.
     */
    public static PlaybackAccessToken(channelLogin: string): IOperationGQL<IVarPlaybackAccessToken> {
        return {
            ...this._buildOperations(OperationNameGQL.PlaybackAccessToken, Sha256GQL.PlaybackAccessToken),
            variables: {
                isLive: true,
                isVod: false,
                login: channelLogin,
                platform: "web",
                playerType: "site",
                vodID: ""
            }
        } 
    }

    /**
     * Retrieves live channels for a specified game.
     * @param slugGame - The slug of the game.
     * @param sort - The sorting method, either "RELEVANCE" or "VIEWER_COUNT".
     * @returns The operation for fetching the game directory.
     */
    public static GameDirectory(slugGame: string, limit: number = 30, sort: "RELEVANCE" | "VIEWER_COUNT" = "RELEVANCE"): IOperationGQL<IVarGameDirectory> {
        return {
            ...this._buildOperations(OperationNameGQL.GameDirectory, Sha256GQL.GameDirectory),
            variables: {
                limit: limit,
                slug: slugGame,
                imageWidth: 50,
                includeIsDJ: false,
                options: {
                    broadcasterLanguages: [],
                    freeformTags: null,
                    includeRestricted: ["SUB_ONLY_LIVE"],
                    recommendationsContext: {
                        platform: "web"
                    },
                    sort: sort,
                    systemFilters: [],
                    tags: [],
                    requestID: "JIRA-VXP-2397"
                },
                sortTypeIsRecency: false
            }
        } 
    }

    /**
     * Converts a game name into a game slug.
     * @param nameGame - The name of the game.
     * @returns The operation for slug redirection.
     */
    public static SlugRedirect(nameGame: string): IOperationGQL<IVarSlugRedirect> {
        return {
            ...this._buildOperations(OperationNameGQL.SlugRedirect, Sha256GQL.SlugRedirect),
            variables: {
                name: nameGame
            }
        } 
    }
}
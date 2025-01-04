export interface IGame {
    id: string
    displayName: string
    slug: string
    boxArtURL: string
}

export interface IGameDirectory {
    id: string
    displayName: string
    name: string
    streams: {
        edges: {
            cursor: string
            node: {
                broadcaster: {
                    id: string
                    displayName: string
                    login: string
                    primaryColorHex: string | null
                    profileImageURL: string
                    roles: {
                        isParticipatingDJ: boolean
                        isPartner: boolean
                    }
                }
            }
        }[]
    }
}
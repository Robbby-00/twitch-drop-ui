export interface IContextPoint {
    channel: {
        id: number
        login: string
        displayName: string
        profileImage: string
    }
    availableClaim?: {
        id: string
    }
    balance: number
}
export interface IBenefit {
    id: string
    imageURL: string
    name: string
}

export interface IDrop {
    dropId: string
    benefits: IBenefit[]
    requiredMinutesWatched: number
    minutesWatched?: number
    isClaimed?: boolean
    dropInstanceID?: string
}
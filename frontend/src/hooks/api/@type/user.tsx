export interface IUser {
    id: string
    login: string
    displayName: string
    profileImage: string
}

export const DEFAULT_USER: IUser = {
    id: "",
    login: "",
    displayName: "",
    profileImage: ""
}
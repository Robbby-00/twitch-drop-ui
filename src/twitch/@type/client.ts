export interface IClientInfo {
    url: string
    userAgent: string
}

export interface IClientType {
    Web: IClientInfo
    MobileWeb: IClientInfo
    AndroidApp: IClientInfo
    SmartBox: IClientInfo
}
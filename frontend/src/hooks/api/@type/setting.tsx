export interface ICategory {
    key: string
    displayName: string
}

export interface IOptions {
    displayName: string
    value: any
}

export interface ISetting {
    key: string
    categoryKey: string
    displayName: string
    desc: string
    value: any
    defaultValue: any
    options?: IOptions[]
    needRestart: boolean
    __type: string
}
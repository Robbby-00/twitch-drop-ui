import { SettingKeys } from "../@constant/keys"
import { IOptions } from "./options"
import { ISettingTypes } from "./types"

export interface ISettingExposed {
    key: SettingKeys
    categoryKey: string
    displayName: string
    desc: string
    value: any
    defaultValue: any
    options?: IOptions[]
    needRestart: boolean
    __type: ISettingTypes
}
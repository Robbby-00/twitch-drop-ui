import assert from "assert"

// @types
import { ICategory, IOptions, ISettingExposed, SettingKeys, ISettingTypes } from "./@type"

export interface ISettingProps {
    key: SettingKeys
    category: ICategory
    displayName: string
    desc: string
    value: any
    defaultValue: any
    options?: IOptions[]
    evaluate: (v: any) => boolean
    needRestart: boolean
    __type: ISettingTypes
}

export class Setting {
    key: SettingKeys
    category: ICategory
    displayName: string
    desc: string
    value: any
    defaultValue: any
    options?: IOptions[]
    evaluate: (v: any) => boolean
    needRestart: boolean
    __type: ISettingTypes

    constructor(props: ISettingProps) {
        this.key = props.key
        this.category = props.category
        this.displayName = props.displayName
        this.desc = props.desc
        this.value = props.value
        this.defaultValue = props.defaultValue
        this.options = props.options
        this.evaluate = props.evaluate
        this.needRestart = props.needRestart
        this.__type = props.__type
    }

    assert() {
        assert.equal(this.evaluate(this.value), true, `Assert Failed on ${this.key}`)

        if (this.defaultValue) assert.equal(this.evaluate(this.value), true, `Assert Failed on ${this.key}`)

        if (this.options) {
            for (let [idx, opt] of this.options.entries()) {
                assert.equal(this.evaluate(opt.value), true, `Assert Failed on ${this.key}`)
            }
        }
    }

    toObject(): ISettingExposed {
        let { assert, evaluate, toObject, category, ...rest } = this
        
        return {
            categoryKey: category.key,
            ...rest
        }
    }
}
import path from "path"

// @types
import { SettingKeys, ISettingTypes } from "../@type"
import { IOptions } from "../@type"
import { appereanceCategory, trackerCategory, watcherCategory } from "./category"
import { Setting } from "../instance"

export const LIST_SETTING = new Map<string, Setting>()

const addSetting = (setting: Setting): void => {
    LIST_SETTING.set(setting.key, setting)
}

const evaluateOptions = (v: any, options: IOptions[]): boolean => {
    return options.some(opt => opt.value === v)
}

const evaluatePath = (v: string): boolean => {
    const invalidChars = process.platform === 'win32'
    ? /[<>:"|?*]/   // Windows
    : /[\0]/        // Unix/Linux

    // invalid chars
    if (invalidChars.test(v)) return false

    try {
        path.parse(v)
        return true
    }catch (err) {
        return false
    }
}

/*
    Appereance
*/
addSetting(new Setting({
    key: SettingKeys.THEME,
    category: appereanceCategory,
    displayName: "Theme",
    desc: "Choose your preferred theme to personalize the appearance of the application. This setting allows you to create a more comfortable and visually appealing user experience that matches your style.",
    value: "auto",
    defaultValue: "auto",
    options: [{
        displayName: "System",
        value: "auto"
    },{
        displayName: "Dark",
        value: "dark"
    }, {
        displayName: "Light",
        value: "light"
    }],
    evaluate: function (v: any) {
        // check type
        if (typeof v !== this.__type) return false

        return evaluateOptions(v, this.options!)
    },
    needRestart: false,
    __type: ISettingTypes.STRING
}))

/*
    Tracker
*/
addSetting(new Setting({
    key: SettingKeys.AUTO_CONNECTED_CAMPAIGN,
    category: trackerCategory,
    displayName: "Auto Insert Connected Campaign",
    desc: "Automatically adds any campaigns for which you have an account that is already linked/associated.",
    value: false,
    defaultValue: false,
    evaluate: function (v: any) {
        // check type
        return typeof v === this.__type
    },
    needRestart: false,
    __type: ISettingTypes.BOOLEAN
}))
addSetting(new Setting({
    key: SettingKeys.UPDATE_INTERVAL,
    category: trackerCategory,
    displayName: "Update Twitch Data Interval",
    desc: "Set how often the application updates stream, campaign, and drop data to ensure you stay up to date.",
    value: 120,
    defaultValue: 120,
    options: [{
        displayName: "30s",
        value: 30,
    }, {
        displayName: "1m",
        value: 60,
    }, {
        displayName: "2m",
        value: 120
    }, {
        displayName: "5m",
        value: 300,
    }, {
        displayName: "10m",
        value: 600,
    }],
    evaluate: function (v: any) {
        // check type
        if (typeof v !== this.__type) return false

        return evaluateOptions(v, this.options!)
    },
    needRestart: false,
    __type: ISettingTypes.NUMBER
}))
addSetting(new Setting({
    key: SettingKeys.CLAIM_INTERVAL,
    category: trackerCategory,
    displayName: "Claim Drop/Point Interval",
    desc: "Set the frequency at which drops and channel points are automatically claimed, ensuring you don’t miss out on rewards.",
    value: 300,
    defaultValue: 300,
    options: [{
        displayName: "1m",
        value: 60,
    }, {
        displayName: "2m",
        value: 120
    }, {
        displayName: "5m",
        value: 300,
    }, {
        displayName: "10m",
        value: 600,
    }, {
        displayName: "20m",
        value: 1200,
    }],
    evaluate: function (v: any) {
        // check type
        if (typeof v !== this.__type) return false

        return evaluateOptions(v, this.options!)
    },
    needRestart: false,
    __type: ISettingTypes.NUMBER
}))

addSetting(new Setting({
    key: SettingKeys.MAX_CONCURRENT_CAMPAIGN,
    category: trackerCategory,
    displayName: "Concurrent Campaign Stream",
    desc: "Set the maximum number of campaign streams to watch at the same time. This allows you to manage your resources efficiently while keeping track of multiple campaigns. <br/><br/> <strong>Note:</strong> It is recommended to keep this setting at 1, as tests have shown that Twitch limits drops to one stream at a time.",
    value: 1,
    defaultValue: 1,
    evaluate: function (v: any) {
        // check type
        if (typeof v !== this.__type) return false

        return v > 0
    },
    needRestart: false,
    __type: ISettingTypes.NUMBER
}))
addSetting(new Setting({
    key: SettingKeys.MAX_CONCURRENT_WATCHER,
    category: trackerCategory,
    displayName: "Concurrent Stream",
    desc: "Set the maximum number of streams to watch at the same time. This setting overrides the \"Concurrent Campaign Streams\" setting if it's set to a higher value.",
    value: 1,
    defaultValue: 1,
    evaluate: function (v: any) {
        // check type
        if (typeof v !== this.__type) return false

        return v > 0
    },
    needRestart: false,
    __type: ISettingTypes.NUMBER
}))

/*
    Watcher
*/
addSetting(new Setting({
    key: SettingKeys.WATCH_INTERVAL,
    category: watcherCategory,
    displayName: "Watching Rate",
    desc: "Set the interval at which the bot requests a new live header to simulate watching a stream. This helps maintain an active presence without overloading the system.",
    value: 10,
    defaultValue: 10,
    evaluate: function (v: any) {
        // check type
        if (typeof v !== this.__type) return false

        return v > 0
    },
    needRestart: false,
    __type: ISettingTypes.NUMBER
}))
addSetting(new Setting({
    key: SettingKeys.MAX_WATCH_ERROR,
    category: watcherCategory,
    displayName: "Watching Error",
    desc: "Specify the number of consecutive errors that must occur before a stream is considered offline. This setting helps ensure that the bot doesn't incorrectly mark a stream as offline due to temporary issues.",
    value: 3,
    defaultValue: 3,
    evaluate: function (v: any) {
        // check type
        if (typeof v !== this.__type) return false

        return v > 0
    },
    needRestart: false,
    __type: ISettingTypes.NUMBER
}))

// assert settings
LIST_SETTING.forEach(setting => setting.assert())
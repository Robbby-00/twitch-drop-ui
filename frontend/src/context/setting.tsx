import { createContext, ReactNode, useEffect, useState } from "react";

// @types
import { ICategory, ISetting } from "../hooks/api/@type/setting";

// hooks
import { useApi } from "../hooks/api";

export interface IContextSetting extends ISetting {
    toApplyValue: any
}

interface ContextType {
    isLoading: boolean
    isApplying: boolean
    isResetting: boolean
    categories: ICategory[]
    settings: IContextSetting[]
    updateSettings: () => void
    getValue: (keySetting: string) => any | undefined
    updateToApplyValue: (keySetting: string, value: any) => void
    apply: (keyCategories: string) => void
    reset: (keyCategories: string) => void
}

export const SettingContext = createContext<ContextType>({
    isLoading: true,
    isApplying: false,
    isResetting: false,
    categories: [],
    settings: [],
    updateSettings: () => {},
    getValue: () => {},
    updateToApplyValue: () => {},
    apply: () => {},
    reset: () => {},
})

export function SettingProvider(props: { children?: ReactNode }) {

    const { children } = props

    // hooks
    const { getSettingCategories, getSettings, applySetting } = useApi()

    // state
    const [ isLoading, setIsLoading ] = useState<boolean>(true)
    const [ isApplying, setIsApplying ] = useState<boolean>(false)
    const [ isResetting, setIsResetting ] = useState<boolean>(false)
    const [ categories, setCategories ] = useState<ICategory[]>([])
    const [ settings, setSettings ] = useState<IContextSetting[]>([])

    const updateSettings = () => {
        // start loading
        setIsLoading(true)

        Promise.all([getSettingCategories(), getSettings()]).then(([cs, ss]) => {
            setCategories(cs)
            setSettings(oldSettings => ss.map<IContextSetting>(s => ({
                ...s,
                toApplyValue: oldSettings.find(os => os.key === s.key)?.toApplyValue ?? s.value
            })))

            // end loading
            setIsLoading(false)
        })
    }

    const getValue = (keySetting: string): any | undefined => {
        const target = settings.find(s => s.key === keySetting)

        return target?.value
    }

    const updateToApplyValue = (keySetting: string, value: any): void => {
        setSettings(ss => {
            let idx = ss.findIndex(s => s.key === keySetting)
            if (idx > -1) {
                ss[idx].toApplyValue = value

                return [...ss]
            }

            return ss
        })
    }

    const apply = (keyCategory: string): void => {
        setIsApplying(true)
        let toUpdate = settings.filter(s => s.categoryKey === keyCategory && s.value !== s.toApplyValue)

        if (toUpdate.length > 0) {
            Promise.all(toUpdate.map(s => applySetting(s.key, s.toApplyValue))).then(updated => {
                let effectiveUpdated = (updated.filter(updated => updated !== undefined) as ISetting[])

                if (effectiveUpdated.length > 0) {
                    setSettings(oldSettings => {
                        effectiveUpdated.forEach(eu => {
                            let idx = oldSettings.findIndex(os => os.key === eu.key)
                            if (idx > -1) {
                                oldSettings[idx].value = eu.value
                                oldSettings[idx].toApplyValue = eu.value
                            }
                        })
                        
                        setIsApplying(false)
                        return [
                            ...oldSettings
                        ]
                    })
                }
            })
        }else setIsApplying(false)
    }

    const reset = (keyCategory: string): void => {
        setIsResetting(true)
        let toUpdate = settings.filter(s => s.categoryKey === keyCategory && s.value !== s.defaultValue)

        if (toUpdate.length > 0) {
            Promise.all(toUpdate.map(s => applySetting(s.key, s.defaultValue))).then(updated => {
                let effectiveUpdated = (updated.filter(updated => updated !== undefined) as ISetting[])

                if (effectiveUpdated.length > 0) {
                    setSettings(oldSettings => {
                        effectiveUpdated.forEach(eu => {
                            let idx = oldSettings.findIndex(os => os.key === eu.key)
                            if (idx > -1) {
                                oldSettings[idx].value = eu.value
                                oldSettings[idx].toApplyValue = eu.value
                            }
                        })
                        
                        setIsResetting(false)
                        return [
                            ...oldSettings
                        ]
                    })
                }
            })
        }else setIsResetting(false)
    }

    // on mount
    useEffect(updateSettings, [])

    return <SettingContext.Provider value={{
        isLoading,
        isApplying,
        isResetting,
        categories,
        settings,
        updateSettings,
        getValue,
        updateToApplyValue,
        apply,
        reset
    }}>{children}</SettingContext.Provider>
}
import { useContext, useEffect, useState } from "react"

// context
import { SettingContext } from "../context/setting";

export function useTheme() {

    const matchMedia = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );

    // conetxt
    const { settings, getValue } = useContext(SettingContext)

    // state
    const [theme, setTheme] = useState<string>(localStorage.getItem("theme") ?? "dark")

    const updateTheme = () => {
        let themeSetting = getValue("theme")

        if (themeSetting === "auto") {
            setTheme(matchMedia.matches ? "dark" : "light")
        }else setTheme(themeSetting)
    }

    useEffect(() => {
        updateTheme()
        matchMedia.addEventListener("change", updateTheme)

        return () => matchMedia.removeEventListener("change", updateTheme)
    }, [settings])

    useEffect(() => {
        if (theme) {
            localStorage.setItem("theme", theme)
        }
    }, [theme])

    return theme
}
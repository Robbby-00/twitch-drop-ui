import { useCallback, useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

// contexts
import { OverlayContext } from "../../context/overlay"

// components
import { SettingsPopup } from "./popups/settings"

export function PopupManager(props: {}) {
    const {} = props

    // context
    const { show, hide, on, off } = useContext(OverlayContext)
    
    // hooks
    const location = useLocation()
    const navigate = useNavigate()

    // state
    const [ showing, setShowing ] = useState<boolean>(false)

    const onHide = useCallback(() => {
        // remove #hash
        navigate(`${location.pathname}`)
    }, [location, navigate])

    useEffect(() => {
        on("hide", onHide)
        
        return () => off("hide", onHide)
    }, [on, off, onHide])

    useEffect(() => {
        switch (location.hash) {
            case "#settings":
                if (!showing) {
                    setShowing(true)
                    show(<SettingsPopup />)
                }
                break
            default:
                if (showing) {
                    setShowing(false)
                    hide()
                }
                break
        }

    }, [showing, location, show, hide])

    return <></>
}
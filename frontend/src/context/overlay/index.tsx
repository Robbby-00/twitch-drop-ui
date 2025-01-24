import { createContext, ReactNode, useState } from "react"

// utils
import { EventCallback, EventEmitter } from "../../utils/event-emitter"

// style
import "./overlay.css"

interface ContextType {
    unload: () => void
    preLoad: (item: ReactNode) => void
    show: (item?: ReactNode) => void
    hide: () => void
    on: <K extends keyof OverlayEvent>(event: K, callback: EventCallback<OverlayEvent[K]>) => void
    off: <K extends keyof OverlayEvent>(event: K, callback: EventCallback<OverlayEvent[K]>) => void
}

export const OverlayContext = createContext<ContextType>({
    unload: () => {},
    preLoad: () => {},
    show: () => {},
    hide: () => {},
    on: () => {},
    off: () => {}
})

export type OverlayEvent = {
    hide: boolean,
    show: boolean
}

const overlayEmitter = new EventEmitter<OverlayEvent>()

export function OverlayProvider(props: { children?: ReactNode }) {

    const { children } = props
    const [ element, setElement ] = useState<ReactNode>(<></>)
    const [ isVisible, setIsVisible ] = useState<boolean>(false)

    const unload = () => {
        setElement(<></>)
    }

    const preLoad = (item: ReactNode) => {
        setElement(item)
    }

    const show = (item?: ReactNode) => {
        if (item) {
            setElement(item)
        }
        setIsVisible(true)
        overlayEmitter.emit("show", true)
    }

    const hide = () => {
        setIsVisible(false)
        overlayEmitter.emit("hide", true)
    }

    const on = <K extends keyof OverlayEvent>(event: K, callback: EventCallback<OverlayEvent[K]>): void => {
        overlayEmitter.on(event, callback)
    }

    const off = <K extends keyof OverlayEvent>(event: K, callback: EventCallback<OverlayEvent[K]>): void => {
        overlayEmitter.off(event, callback)
    }

    const handleClick = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (evt.currentTarget === evt.target) {
            // Hide overlay only when click on the background
            hide()
        }
    }

    return <OverlayContext.Provider value={{ unload, preLoad, show, hide, on, off }}>
        <div className="overlay" data-show={isVisible} onClick={handleClick}>
            {element}
        </div>
        {children}
    </OverlayContext.Provider>
}
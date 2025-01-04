import { createContext, ReactNode, useState } from "react"

import "./overlay.css"

interface ContextType {
    unload: () => void
    preLoad: (item: ReactNode) => void
    show: (item?: ReactNode) => void
    hide: () => void
}


export const OverlayContext = createContext<ContextType>({
    unload: () => {},
    preLoad: () => {},
    show: () => {},
    hide: () => {}
})

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

    const show = () => {
        setIsVisible(true)
    }

    const hide = () => {
        setIsVisible(false)
    }

    const handleClick = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (evt.currentTarget === evt.target) {
            // Hide overlay only when click on the background
            hide()
        }
    }

    return <OverlayContext.Provider value={{ unload, preLoad, show, hide }}>
        <div className="overlay" data-show={isVisible} onClick={handleClick}>
            {element}
        </div>
        {children}
    </OverlayContext.Provider>
}
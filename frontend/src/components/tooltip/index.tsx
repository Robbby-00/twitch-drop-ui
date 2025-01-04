import { ReactNode, useState } from "react";

// style
import "./tooltip.css"
import { useDebounce } from "../../hooks/debounce";

type PositionType = "left" | "right" | "bottom" | "top"

export function Tooltip(props: { children: ReactNode, content: string | JSX.Element, position?: PositionType }) {
    
    const { children, content, position } = props

    const [ isVisible, setIsVisible ] = useState<boolean>(false)
    const { debounceValue } = useDebounce<boolean>(isVisible, 150)

    return <div 
        className="container-tooltip"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
    >
        { children }
        <div 
            className="tooltip" 
            data-isvisible={debounceValue} 
            data-position={position ?? "bottom"}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}>
            {content}
        </div>
    </div>
}
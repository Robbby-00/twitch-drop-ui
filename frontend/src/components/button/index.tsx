import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

// style
import "./button.css"

export enum ButtonStyle {
    FILL="fill",
    EMPTY="empty"
}

interface ButtonProps {
    style: ButtonStyle
    text?: string
    classname?: string
    icon?: IconDefinition
    onClick?: () => void
    disable?: boolean
    clickable?: boolean
    dataAttributes?: {[key: string]: string}
}

export function Button(props: ButtonProps) {
    const { style, text, classname, icon, onClick, disable, clickable, dataAttributes } = props

    const handleClick = () => {
        if (!disable && onClick) {
            onClick()
        }
    }

    return <div className={`button ${style} ${classname ?? ""}`} onClick={handleClick} data-disable={disable ?? false} data-clickable={clickable ?? true} {...dataAttributes}>
        { icon !== undefined ? <FontAwesomeIcon icon={icon} /> : null }
        { text ? <span>{text}</span> : "" }
    </div>
}
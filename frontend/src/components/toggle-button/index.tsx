import { useEffect, useState } from "react"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

// components
import { Button, ButtonStyle } from "../button"

// style
import "./toggle-button.css"

interface ToggleButtonProps {
    icon: IconDefinition
    onToggleChange: (value: boolean) => void
}

export function ToggleButton(props: ToggleButtonProps) {
    const { icon, onToggleChange } = props

    const [ state, setState ] = useState<boolean>(false)

    useEffect(() => {
        onToggleChange(state)
    }, [state])

    const handleClick = () => {
        setState(value => !value)
    }

    return <Button style={state ? ButtonStyle.FILL : ButtonStyle.EMPTY} classname="toggle" icon={icon} onClick={handleClick} />
}
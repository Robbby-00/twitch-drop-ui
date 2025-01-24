import { useEffect, useState } from "react"

// components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// icon 
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"

// @types
import { IOptions } from "../../../hooks/api/@type/setting"

// style
import "../input-global.css"
import "./input-select.css"


export function InputSelect(props: { value: any, options: IOptions[], active?: any, onChange?: (value: any) => void }) {
    const { value, options, active, onChange } = props

    const [ isExpand, setIsExpand ] = useState<boolean>(false)
    const [ selectedIdx, setSelectedIdx ] = useState<number>(0)

    useEffect(() => {
        setSelectedIdx(options.findIndex(opt => opt.value === value) ?? 0)
    }, [value])

    useEffect(() => {
        if (isExpand) {
            setTimeout(() => window.addEventListener("click", handleGlobalClick, { once: true }), 2)
        }

        return () => window.removeEventListener("click", handleGlobalClick)
    }, [isExpand])

    const handleGlobalClick = (_: any) => {
        setIsExpand(false)
    }

    const handleClickExpand = (_: React.MouseEvent<HTMLDivElement>) => {
        setIsExpand(exp => !exp)
    }

    const handleClickOption = (_: React.MouseEvent<HTMLSpanElement>, idx: number) => {
        setSelectedIdx(idx)
        setIsExpand(false)

        if (onChange) {
            onChange(options[idx].value)
        }
    }

    return <div className="select input-custom" data-isexpand={isExpand} onClick={handleClickExpand}>
        <div className="select-item">
            <span className="selected-value">{options[selectedIdx].displayName}</span>
            <FontAwesomeIcon icon={faChevronDown} />
        </div>
        <div className="options" onClick={(evt) => {
            evt.preventDefault()
            evt.stopPropagation()
        }}>
            { options.map((opt, idx) => <div className="item" key={idx} data-selected={opt.value === options[selectedIdx].value} data-active={opt.value === active} onClick={(evt) => handleClickOption(evt, idx)}>
                {opt.displayName}
            </div>) }
        </div>
    </div>
}
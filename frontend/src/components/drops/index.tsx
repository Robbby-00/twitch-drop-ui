import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// @types
import { IBenefit } from "../../hooks/api/@type/drop"

// icons
import { faCheck, faClock } from "@fortawesome/free-solid-svg-icons"

// style
import "./drops.css"
import { formatMinutesToHour } from "../../utils"


export function Drop(props: { benefit: IBenefit, totalMinutes: number, isClaimed?: boolean, minutesWatched?: number }) {
    const { benefit, totalMinutes, isClaimed, minutesWatched } = props

    const minWatched = minutesWatched ?? 0
    const progress = Math.min(100, (minWatched / totalMinutes) * 100)
    

    const renderTick = () => {
        return <div className="container-claimed-tick">
            <FontAwesomeIcon icon={faCheck} />
            <span>Claimed</span>
        </div>
    }

    const renderRemainingTime = () => {
        return <div className="container-remaining-time">
            <FontAwesomeIcon icon={faClock} />
            <span>{formatMinutesToHour(totalMinutes - minWatched)}</span>
        </div>
    }

    return <div className="container-drop" data-claimed={isClaimed ?? false} style={{ '--progress': `${progress ?? 0}%` } as React.CSSProperties}>
        { isClaimed ? renderTick() : renderRemainingTime() }
        <div className="container-image">
            <img src={benefit.imageURL} />
        </div>
        <div className="name">{benefit.name}</div>
        { progress !== 0 && !isClaimed ? <div className="progress-bar">
            <div className="bar"></div>
        </div> : null }
    </div>
}
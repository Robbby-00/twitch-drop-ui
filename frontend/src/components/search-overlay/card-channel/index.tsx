import { useState } from "react"

// components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ProfileImage } from "../../profile-image"

// @types
import { IChannel } from "../../../hooks/api/@type/channel"

// icons
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons"

// style
import "./card-channel.css"


export function CardChannel(props: { channel: IChannel, isTrack: boolean, onAddButtonClick?: () => Promise<void> }) {
    
    const { channel, isTrack, onAddButtonClick } = props

    const [ disableButton, setDisableButton ] = useState<boolean>(false)
 
    const handleAddButtonClick = () => {
        if (!disableButton && onAddButtonClick) {
            setDisableButton(true)
            onAddButtonClick().then(() => {
                setDisableButton(false)
            })
        }
    }

    return <div className="container-channel">
        <div className="info">
            <ProfileImage profileImage={channel.profileImage} isLive={channel.isLive} />
            <div className="name">{channel.name}</div>
        </div>
        <div className="add-button" onClick={handleAddButtonClick} data-disabled={disableButton} data-istrack={isTrack}>
            { isTrack ? <FontAwesomeIcon icon={faCheck} className="icon"/> : <FontAwesomeIcon icon={faPlus} className="icon"/> }
        </div>
    </div>
}
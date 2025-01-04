import { useState } from "react"

// components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// @types
import { ICampaign } from "../../../hooks/api/@type/campaign"

// icon
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons"

// utils
import { formatDateTime } from "../../../utils"

import "./card-campaign.css"

export function CardCampaign(props: { campaign: ICampaign, isTrack: boolean, onAddButtonClick?: () => Promise<void> }) {
    
    const { campaign, isTrack, onAddButtonClick } = props
    
    const [ disableButton, setDisableButton ] = useState<boolean>(false)
    
    const handleAddButtonClick = () => {
        if (!disableButton && onAddButtonClick) {
            setDisableButton(true)
            onAddButtonClick().then(() => {
                setDisableButton(false)
            })
        }
    }

    return <div className="container-campaign">
        <div className="info">
            <img className="box-art" src={campaign.game.boxArtURL} />
            <div className="container-data">
                <div className="name">{campaign.name}</div>
                <div className="tags">
                    <div className="tag game">
                        <a href="#">{campaign.game.displayName}</a>
                    </div>
                    <div className="tag status">
                        <div className="container" data-status={campaign.status}>{campaign.status.toLowerCase()}</div>
                    </div>
                    <div className="tag expired">
                        <div className="container">
                            <span className="text">Expire:</span>
                            {formatDateTime(campaign.endAt)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="add-button" onClick={handleAddButtonClick} data-disabled={disableButton} data-istrack={isTrack}>
            { isTrack ? <FontAwesomeIcon icon={faCheck} className="icon"/> : <FontAwesomeIcon icon={faPlus} className="icon"/> }
        </div>
    </div>
}
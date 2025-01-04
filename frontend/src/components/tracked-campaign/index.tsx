import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

// context
import { DataContext } from "../../context/data";

// components
import { Tooltip } from "../tooltip";
import { ProfileImage } from "../profile-image";
import { Button, ButtonStyle } from "../button";

// @types
import { ICampaign } from "../../hooks/api/@type/campaign";
import { IChannelExtended } from "../../hooks/api/@type/channel";

// utils
import { formatDateTime } from "../../utils";

// icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";

// style
import "./tracked-campaign.css"
import { Drop } from "../drops";

export function TrackedCampaign(props: { campaign: ICampaign, editMode: boolean, onDelete?: () => void }) {

    const { campaign, editMode, onDelete } = props

    // context
    const { watchingChannel } = useContext(DataContext)

    // hooks
    const location = useLocation()
    const naviagate = useNavigate()

    // state
    const [ watching, setWatching ] = useState<IChannelExtended | undefined>(undefined)
    const [ expanded, setExpanded ] = useState<boolean>(false)

    useEffect(() => {
        let channelWatching = watchingChannel.find(ch => ch.campaign.some(c => c.id === campaign.id))?.channel
        setWatching(channelWatching)
    }, [campaign, watchingChannel])

    useEffect(() => {
        setExpanded(location.hash === `#${campaign.id}`)
    }, [campaign, location])

    const handleToggleExpanded = () => {
        if (!expanded) {
            naviagate(`${location.pathname}#${campaign.id}`)
        }else naviagate(`${location.pathname}`)
    }

    const renderWatchedChannel = () => {
        let watch = watching as IChannelExtended

        return <div className="content">
            <ProfileImage profileImage={watch.profileImage} isLive={watch.stream !== undefined}/>
            <a href={`https://www.twitch.tv/${watch.login}`} target="_blank">
                <span className="name">{watch.displayName}</span>
            </a>
        </div>
    }

    const renderEditsButton = () => {
        return <div className="edits-button">
            <Button style={ButtonStyle.EMPTY} classname="remove" icon={faTrash} onClick={onDelete}/>
        </div>
    }

    return <div className="container-tracked-campaign" data-expanded={expanded}>
        <div className="header">
            <div className="info">
                <img className="box-art" src={campaign.game.boxArtURL} />
                <div className="container-data">
                    <div className="name">
                        {campaign.name}
                        {watching ? <Tooltip content={renderWatchedChannel()} position="right">
                            <FontAwesomeIcon icon={faEye} />
                        </Tooltip> : null}
                    </div>
                    <div className="tags">
                        <div className="tag game">
                            {campaign.game.displayName}
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
            { editMode ? renderEditsButton() : <div className="expand-btn" onClick={handleToggleExpanded}>
                <FontAwesomeIcon icon={faChevronDown} />
            </div> }
        </div>
        <div className="spacer" />
        <div className="expanded-area">
            { campaign.drops.map((drop, idxDrop) => drop.benefits.map((benefit, idxBenfit) => {
                return <Drop key={(idxDrop * 1000) + idxBenfit} benefit={benefit} isClaimed={drop.isClaimed} minutesWatched={drop.minutesWatched} totalMinutes={drop.requiredMinutesWatched}/>
            })).flat() }
        </div>
    </div>
}
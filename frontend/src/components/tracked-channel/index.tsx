import { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// context
import { DataContext } from "../../context/data";

// components
import { ProfileImage } from "../profile-image";

// @types
import { IChannelExtended } from "../../hooks/api/@type/channel";

// icons
import { faEye, faTrash, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { ReactComponent as PointsIcon } from "../../@asset/icon/points.svg"

// style
import "./tracked-channel.css"
import { Button, ButtonStyle } from "../button";

const formatViewerCount = (value: number): string => {
    let numStr = value.toString();
    
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const formatPoints = (value: number): string => {
    if (value >= 1_000_000) {
        return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } 
    
    if (value >= 1_000) {
        return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
        
    return value.toString();
}

export function TrackedChannel(props: { channel: IChannelExtended, editMode: boolean, onDelete?: () => void }) {

    const { channel, editMode, onDelete } = props

    // context
    const { watchingChannel } = useContext(DataContext)

    // state
    const [ isWatching, setWatching ] = useState<boolean>(false)

    useEffect(() => {
        setWatching(watchingChannel.some(ch => ch.channel.id === channel.id))
    }, [channel, watchingChannel])

    const renderEditsButton = () => {
        return <div className="edits-button">
            <Button style={ButtonStyle.EMPTY} classname="remove" icon={faTrash} onClick={onDelete}/>
        </div>
    }

    return <div className="container-tracked-channel">
        <div className="info">
            <ProfileImage profileImage={channel.profileImage} isLive={channel.stream !== undefined} />
            <div className="container-data">
                <div className="name">
                    {channel.displayName}
                    {isWatching ? <a href={`https://www.twitch.tv/${channel.login}`} target="_blank">
                        <FontAwesomeIcon icon={faEye} />
                    </a> : null}
                </div>
                { 
                    channel.stream !== undefined ?  
                    <div className="tags">
                        <div className="viewer">
                            <FontAwesomeIcon icon={faUserAlt} />
                            <span>{ formatViewerCount(channel.stream.viewersCount) }</span>
                        </div>
                        <div className="game">
                            <a href={`https://www.twitch.tv/directory/category/${channel.stream.game.slug}`} target="_blank">{ channel.stream.game.name }</a>
                        </div>
                    </div>
                : "" }
            </div>
        </div>
        { editMode ? renderEditsButton() : <div className="points">
            <span>{formatPoints(channel.points.balance)}</span>
            { channel.points.pointsImage ? <img src={channel.points.pointsImage} /> : <PointsIcon /> }
        </div> }
    </div>
}
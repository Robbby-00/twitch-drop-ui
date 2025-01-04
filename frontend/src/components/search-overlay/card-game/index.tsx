import { useState } from "react"

// components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// @types
import { IGame } from "../../../hooks/api/@type/game"

// icons
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons"

// style
import "./card-game.css"



export function CardGame(props: { game: IGame, isTrack: boolean, onAddButtonClick?: () => Promise<void> }) {
    
    const { game, isTrack, onAddButtonClick } = props

    const [ disableButton, setDisableButton ] = useState<boolean>(false)
 
    const handleAddButtonClick = () => {
        if (!disableButton && onAddButtonClick) {
            setDisableButton(true)
            onAddButtonClick().then(() => {
                setDisableButton(false)
            })
        }
    }

    return <div className="container-game">
        <div className="info">
            <img src={game.boxArtURL} />
            <div className="name">{game.displayName}</div>
        </div>
        <div className="add-button" onClick={handleAddButtonClick} data-disabled={disableButton} data-istrack={isTrack}>
            { isTrack ? <FontAwesomeIcon icon={faCheck} className="icon"/> : <FontAwesomeIcon icon={faPlus} className="icon"/> }
        </div>
    </div>
}
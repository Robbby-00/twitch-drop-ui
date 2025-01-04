// @types
import { IGame } from "../../hooks/api/@type/game"

// components
import { Button, ButtonStyle } from "../button"

// icons
import { faTrash } from "@fortawesome/free-solid-svg-icons"

import "./tracked-game.css"

export function TrackedGame(props: { game: IGame, editMode: boolean, onDelete?: () => void }) {

    const { game, editMode, onDelete } = props

    const renderEditsButton = () => {
        return <div className="edits-button">
            <Button style={ButtonStyle.EMPTY} classname="remove" icon={faTrash} onClick={onDelete}/>
        </div>
    }

    return <div className="container-tracked-game">
        <div className="info">
            <img src={game.boxArtURL} />
            <div className="container-data">
                <div className="name">
                    <a href={`https://www.twitch.tv/directory/category/${game.slug}`} target="_blank" >
                        {game.displayName}
                    </a>
                </div>
            </div>
        </div>
        { editMode ? renderEditsButton() : null }
    </div>
}
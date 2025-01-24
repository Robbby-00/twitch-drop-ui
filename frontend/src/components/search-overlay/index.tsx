import { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// context
import { DataContext } from "../../context/data";

// components
import { LoaderSpinner } from "../loaders/spinner";
import { CardChannel } from "./card-channel";
import { CardCampaign } from "./card-campaign";
import { CardGame } from "./card-game";

// hooks
import { ContentType, useApi } from "../../hooks/api";
import { useDebounce } from "../../hooks/debounce";

// @types
import { IChannel } from "../../hooks/api/@type/channel";
import { ICampaign } from "../../hooks/api/@type/campaign";
import { IGame } from "../../hooks/api/@type/game";

// icons
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

// style
import "./search-overlay.css"
import { OverlayContext } from "../../context/overlay";

function instanceOfChannel(object: any): object is IChannel {
    return 'profileImage' in object;
}

function instanceOfCampaign(object: any): object is ICampaign {
    return 'game' in object;
}

function instanceOfGame(object: any): object is IGame {
    return 'boxArtURL' in object;
}

export function SearchOverlay(props: { type: ContentType }) {

    const { type } = props

    const { searchChannels, searchGames, getFollow, addToTracking, removeToTracking } = useApi()
    const { trackChannel, trackCampaign, trackGame, activeCampaign } = useContext(DataContext)
    const { on, off } = useContext(OverlayContext)
    
    const [ inputText, setInputText ] = useState<string>("")
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const { debounceValue, forceValue } = useDebounce<string>(inputText, 500)
    const [ defaultValue, setDefault ] = useState<IChannel[] | ICampaign[] | IGame[]>([])
    const [ result, setResult ] = useState<IChannel[] | ICampaign[] | IGame[]>([])

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        // reset search bar
        setInputText("")
        forceValue("")
        
        switch (type) {
            case ContentType.Channel:
                getFollow().then(channel => setDefault(channel))
                break
            case ContentType.Campaign:
                setDefault(activeCampaign.filter(c => c.status === "ACTIVE"))
                break
            case ContentType.Game:
                setDefault([])
                break
        }
    }, [activeCampaign, type])

    useEffect(() => {
        if (debounceValue !== "") {
            let searchValueLowerCase = debounceValue.toLowerCase()

            setIsLoading(true)
            switch (type) {
                case ContentType.Channel:
                    if (defaultValue.length > 0 && !instanceOfChannel(defaultValue[0])) break

                    searchChannels(searchValueLowerCase).then(setResult)
                    break
                case ContentType.Campaign:
                    if (defaultValue.length > 0 && !instanceOfCampaign(defaultValue[0])) break

                    setResult((defaultValue as ICampaign[]).filter(it => 
                        it.name.toLowerCase().includes(searchValueLowerCase) || 
                        it.game.displayName.toLowerCase().includes(searchValueLowerCase)
                    ))
                    break
                case ContentType.Game:
                    if (defaultValue.length > 0 && !instanceOfGame(defaultValue[0])) break

                    searchGames(searchValueLowerCase).then(setResult)
                    break
            }
        } else setResult(defaultValue)
    }, [type, debounceValue, defaultValue])

    useEffect(() => {
        setIsLoading(false)
    }, [result])

    useEffect(() => {
        on("show", handleFoucus)

        return () => off("show", handleFoucus)
    }, [on, off])

    const handleFoucus = () => {
        inputRef.current?.focus()
    }

    const handleAddButton = async (data: IChannel | ICampaign | IGame, isTrack: boolean): Promise<void> => {
        let value: string = ""
        switch (type) {
            case ContentType.Channel:
                value = (data as IChannel).name.toLowerCase()
                break
            case ContentType.Campaign:
                value = (data as ICampaign).id
                break
            case ContentType.Game:
                value = (data as IGame).slug
                break
        }

        if (!isTrack) {
            await addToTracking(type, value)
        }else {
            await removeToTracking(type, value)
        }
    }

    const renderResults = () => {
        const emptyResult = <div className="no-result">No Results</div>

        switch (type) {
            case ContentType.Channel:
                if (result.length > 0 && instanceOfChannel(result[0])) {
                    return (result as IChannel[]).filter(item => item.name !== undefined).map((item, idx) => {
                        const isTrack = trackChannel.some(ch => ch.id === item.id)
                        return <CardChannel key={idx} channel={item} isTrack={isTrack} onAddButtonClick={() => handleAddButton(item, isTrack)}/>
                    })
                } else return emptyResult
            case ContentType.Campaign:
                if (result.length > 0 && instanceOfCampaign(result[0])) {
                    return (result as ICampaign[]).map((item, idx) => {
                        const isTrack = trackCampaign.some(c => c.id === item.id)
                        return <CardCampaign key={idx} campaign={item} isTrack={isTrack} onAddButtonClick={() => handleAddButton(item, isTrack)} />
                    })
                }else return emptyResult
            case ContentType.Game:
                if (result.length > 0 && instanceOfGame(result[0])) {
                    return (result as IGame[]).map((item, idx) => {
                        const isTrack = trackGame.some(gm => gm.slug === item.slug)
                        return <CardGame key={idx} game={item} isTrack={isTrack} onAddButtonClick={() => handleAddButton(item, isTrack)}/>
                    })
                } else return emptyResult
        }
    }

    return <div className="search-overlay">
        <div className="search-bar">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input ref={inputRef} id="search" placeholder="Search" value={inputText} onChange={(e) => setInputText(e.target.value)}/>
        </div>
        <div className="container-results">
            { isLoading ? <LoaderSpinner /> : renderResults() }
        </div>
    </div>
}
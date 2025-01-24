import { ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// @constant
import { sections, Section } from '../../@constant/sections';

// context
import { DataContext } from '../../context/data';

// components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// logo
import { ReactComponent as LogoIcon } from "../../@asset/icon/twitch.svg"

// icon
import { faChevronDown, faShareFromSquare } from '@fortawesome/free-solid-svg-icons';

// style
import "./header.css"


export function Header() {

    const { user } = useContext(DataContext)
    const navigate = useNavigate()
    const location = useLocation()

    // states
    const [ showDropDown, setShowDropDown ] = useState<boolean>(false)

    // refs
    const dropDownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (showDropDown) {
            window.addEventListener("click", handleWindowClick)
        }

        return () => window.removeEventListener("click", handleWindowClick)
    }, [showDropDown])

    const handleSectionChange = (item: Section) => {
        if (!location.pathname.startsWith(`/${item.pathName}`)) {
            navigate(`/${item.pathName}`)
        }
    }

    const renderSectionText = (item: Section, idx: number): ReactNode => {
        return <div key={idx} className='section' data-selected={location.pathname.startsWith(`/${item.pathName}`)} onClick={() => handleSectionChange(item)}>
            {item.displayName}
        </div>
    }

    const handleOpenAccount = useCallback(() => {
        window.open(`https://www.twitch.tv/${user.login}`, "_blank")
    }, [user])

    const handleWindowClick = (evt: MouseEvent) => {
        setShowDropDown(false)
        
        evt.preventDefault()
        evt.stopPropagation()
    }

    const handleUserAccountClick = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (dropDownRef.current && !dropDownRef.current.contains(evt.target as Node)) {
            setShowDropDown(show => !show)
        }

        evt.preventDefault()
        evt.stopPropagation()
    }

    return <div className='container-header'>
        <div className='left-side'>
            <a href='https://www.twitch.tv/' target='_blank'>
                <LogoIcon className='logo'/>
            </a>
            <div className='sections'>
                {sections.map(renderSectionText)}
            </div>
        </div>
        <div className='user-account' onClick={handleUserAccountClick} data-showdropdown={showDropDown}>
            { user.id !== "" ? <>
                <img src={user.profileImage} />
            </> : null }
            <FontAwesomeIcon icon={faChevronDown} />
            <div ref={dropDownRef} className='dropdown'>
                <div className='user'>
                    { user.id !== "" ? <>
                        <img src={user.profileImage} />
                        <span className='name'>{user.displayName}</span>
                    </> : null }
                </div>
                <div className='spacer' />
                <div className='item' onClick={handleOpenAccount}>
                    Account
                    <FontAwesomeIcon icon={faShareFromSquare} />
                </div>
                <div className='item' onClick={() => {
                    setShowDropDown(false)
                    navigate(`${location.pathname}#settings`)
                }}>
                    Settings
                </div>
            </div>
        </div>
    </div>
}
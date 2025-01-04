import { ReactNode, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// @constant
import { sections, Section } from '../../@constant/sections';

// context
import { DataContext } from '../../context/data';

// logo
import { ReactComponent as LogoIcon } from "../../@asset/icon/twitch.svg"

// style
import "./header.css"

export default function Header() {

    const { user } = useContext(DataContext)
    const navigate = useNavigate()
    const location = useLocation()

    const handleSectionChange = (item: Section) => {
        if (!location.pathname.startsWith(`/${item.pathName}`)) {
            navigate(`/${item.pathName}`)
        }
    }

    const buildUser = (): ReactNode => {
        if (user.id !== "") {
            return <>
                <span className='name'>{user.displayName}</span>
                <img src={user.profileImage} />
            </>
        }

        return <></>
    }

    const buildSectionText = (item: Section, idx: number): ReactNode => {
        return <div key={idx} className='section' data-selected={location.pathname.startsWith(`/${item.pathName}`)} onClick={() => handleSectionChange(item)}>
            {item.displayName}
        </div>
    }

    return <div className='container-header'>
        <div className='left-side'>
            <a href='https://www.twitch.tv/' target='_blank'>
                <LogoIcon className='logo'/>
            </a>
            <div className='sections'>
                {sections.map(buildSectionText)}
            </div>
        </div>
        <div className='user-account'>{buildUser()}</div>
    </div>
}
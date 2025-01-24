// style
import { useCallback, useContext, useEffect, useState } from "react"
import Markdown from "react-markdown"

// context
import { SettingContext } from "../../../../context/setting"
import { DataContext } from "../../../../context/data"

// components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { LoaderSkeleton, SKELETON_TRANSITION_TIME } from "../../../loaders/skeleton"
import { Button, ButtonStyle } from "../../../button"
import { SettingEntry } from "./setting-entry"

// logo
import { faGithub } from "@fortawesome/free-brands-svg-icons"

// style
import "./settings.css"



export function SettingsPopup() {

    // context
    const { changelog, version } = useContext(DataContext)
    const { isLoading, isApplying, isResetting, categories, settings, apply, reset } = useContext(SettingContext)

    // state
    const [ endTransition, setEndTransition ] = useState<boolean>(false)
    const [ selectedIdx, setSelectedIdx ] = useState<number>(0)
    const [ showChangelog, setShowChangelog ] = useState<boolean>(false)

    useEffect(() => {
        if (!isLoading) {
            setTimeout(() => setEndTransition(true), SKELETON_TRANSITION_TIME)
        }
    }, [isLoading])

    // callbacks
    const isResettable = useCallback<() => boolean>(() => {
        return settings.filter(s => s.categoryKey === categories[selectedIdx].key).some(s => s.defaultValue && s.value !== s.defaultValue)
    }, [categories, settings, selectedIdx])

    const hasValueToApply = useCallback<() => boolean>(() => {
        return settings.filter(s => s.categoryKey === categories[selectedIdx].key).some(s => s.value !== s.toApplyValue)
    }, [categories, settings, selectedIdx])

    // handles
    const handleSelectCategory = (idx: number) => {
        setShowChangelog(false)
        setSelectedIdx(idx)
    }

    const handleApply = () => {
        apply(categories[selectedIdx].key)
    }

    const handleReset = () => {
        reset(categories[selectedIdx].key)
    }

    // renders
    const renderLoaderSkeletons = () => {
        return <>
            <div className="left-side">
                <div className="categories">
                    <LoaderSkeleton style={{ width: "100%", height: "42px", borderRadius: "8px" }} show={isLoading} />
                    <LoaderSkeleton style={{ width: "100%", height: "42px", borderRadius: "8px" }} show={isLoading} />
                    <LoaderSkeleton style={{ width: "100%", height: "42px", borderRadius: "8px" }} show={isLoading} />
                    <LoaderSkeleton style={{ width: "100%", height: "42px", borderRadius: "8px" }} show={isLoading} />
                    <LoaderSkeleton style={{ width: "100%", height: "42px", borderRadius: "8px" }} show={isLoading} />
                </div>
                <div className="footer">
                    <LoaderSkeleton style={{ width: "96px", height: "16px", borderRadius: "4px" }} show={isLoading} />
                    <LoaderSkeleton style={{ width: "42px", height: "16px", borderRadius: "4px" }} show={isLoading} />
                </div>
            </div>
            <div className="spacer" />
            <div className="section">
                <div className="title">
                    <LoaderSkeleton style={{ width: "256px", height: "44px", borderRadius: "8px" }} show={isLoading} />
                </div>
                <div className="settings">
                    <LoaderSkeleton className="setting-entry" style={{ height: "64px", borderRadius: "12px" }} show={isLoading} />
                    <LoaderSkeleton className="setting-entry" style={{ height: "64px", borderRadius: "12px" }} show={isLoading} />
                    <LoaderSkeleton className="setting-entry" style={{ height: "64px", borderRadius: "12px" }} show={isLoading} />
                </div>
                <div className="buttons">
                    <LoaderSkeleton style={{ width: "148px", height: "42px", borderRadius: "8px" }} show={isLoading} />
                    <LoaderSkeleton style={{ width: "148px", height: "42px", borderRadius: "8px" }} show={isLoading} />
                </div> 
            </div>
        </>
    }

    const renderSettings = () => {
        if (showChangelog) {
            return <Markdown className="changelog">{changelog}</Markdown>
        }

        let filteredSetting = settings.filter(s => s.categoryKey === categories[selectedIdx].key)
        return filteredSetting.map((fs, idx) => <SettingEntry key={idx} setting={fs} />)
    }

    return <div className="container-settings">
        { isLoading || !endTransition ? renderLoaderSkeletons() : <>
            <div className="left-side">
                <div className="categories">
                    { categories.map((cat, idx) => <div 
                        key={idx} 
                        className="item" 
                        data-selected={!showChangelog && selectedIdx === idx}
                        onClick={() => handleSelectCategory(idx)}>{cat.displayName}</div>) }
                </div>
                <div className="footer">
                    <div className="left-side">
                        <span className="changelog" onClick={() => setShowChangelog(true)} >CHANGELOG</span>
                        <span>{ version !== "" ? version : "v?.?.?" }</span>
                    </div>
                    <div className="right-side">
                        <a href="https://github.com/Robbby-00/twitch-drop-ui" target="_blank">
                            <FontAwesomeIcon icon={faGithub} />
                        </a>
                    </div>
                </div>
            </div>
            <div className="spacer" />
            <div className="section">
                <div className="title">
                    { showChangelog ? "Changelog" : categories[selectedIdx]?.displayName }
                </div>
                <div className="settings">
                    { renderSettings() }
                </div>
                { !showChangelog ? <div className="buttons">
                    <Button style={ButtonStyle.FILL} classname="reset" text="Reset" disable={!isResettable() || isApplying || isResetting} loading={isResetting} onClick={handleReset}/>
                    <Button style={ButtonStyle.FILL} text="Apply" disable={!hasValueToApply() || isApplying || isResetting} loading={isApplying} onClick={handleApply}/>
                </div> : null }
            </div>
        </>}
    </div>
}
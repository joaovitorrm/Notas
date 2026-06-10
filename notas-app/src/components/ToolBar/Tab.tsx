import { useEffect, useRef, useState } from "react";
import { TabData } from "../../types";

import styles from "./tabs.module.css"

type TabProps = {
    tab: TabData;
    active: boolean;
    saveTab: (t: TabData) => void;
    setActiveTab: Function;
    onContextMenu: (e: React.MouseEvent, x: number, y: number, id: string) => void;
}

export default function Tab({ tab, active, saveTab, setActiveTab, onContextMenu }: TabProps) {

    const [title, setTitle] = useState<string>(tab.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.select();
        }
    }, [isEditing])

    useEffect(() => {
        saveTab({...tab, title});
    }, [title])

    return (
        <div 
            title={title} 
            className={`${styles["tab"]} ${active ? styles["active"] : ""}`} 
            onDoubleClick={() => setIsEditing(true)} 
            onBlur={() => setIsEditing(false)}
            onClick={() => setActiveTab(tab.id)}
            onContextMenu={(e) => {onContextMenu(e, e.clientX, e.clientY, tab.id)}}
        >
            <span>{isEditing ? <input type="text" ref={inputRef} value={title} onChange={((e) => setTitle(e.target.value))}></input> : <>{title}</>}</span>
        </div>
    )
}
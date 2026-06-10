import { TabData } from '../../types/Tab';
import Tab from './Tab';

import styles from "./Tabs.module.css";

type TabsProps = {
    tabs: TabData[];
    activeId: string;
    saveTab: (t: TabData) => void;
    createTab: Function;
    setActiveTab: Function;
    onContextMenu: (e: React.MouseEvent, x: number, y: number, id: string) => void;
}

export default function Tabs({tabs, activeId, saveTab, createTab, setActiveTab, onContextMenu} : TabsProps) {
    return (
        <div className={styles["tabs"]}>
            {tabs.map((t) => (<Tab active={activeId === t.id} tab={t} key={t.id} saveTab={saveTab} setActiveTab={setActiveTab} onContextMenu={onContextMenu}/>))}
            <div className={styles["add-page"]} onClick={() => createTab()}>+</div>
        </div>
    )
}
import { TabData } from '../../types/Tab';
import Tab from './Tab';

import styles from "./Tabs.module.css";

type TabsProps = {
    tabs: TabData[]
    activeId: string
}

export default function Tabs({tabs, activeId} : TabsProps) {
    return (
        <div className={styles["tabs"]}>
            {tabs.map((t) => (<Tab active={activeId === t.id} tab={t} key={t.id}/>))}
        </div>
    )
}
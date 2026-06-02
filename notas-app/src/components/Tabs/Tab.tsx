import { TabData } from "../../types";

import styles from "./tabs.module.css"

type TabProps = {
    tab : TabData
    active: boolean
}

export default function Tab({tab, active} : TabProps) {
    return (
        <div className={`${styles["tab"]} ${active ? styles["active"] : ""}`}>
            {tab.title}
        </div>
    )
}
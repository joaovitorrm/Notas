import { useEffect, useState } from "react";
import { MouseData } from "../../types/Mouse";
import styles from "./ContextMenu.module.css";

import trashIcon from "../../assets/trash.png";
import palletIcon from "../../assets/pallete.png";

type ContextMenuData = {
    mouse: MouseData
}

export default function ContextMenu({ mouse }: ContextMenuData) {

    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseDown = (e : MouseEvent) => {
            setPos({ x: e.clientX, y: e.clientY })
        }
        mouse.on("mousedown", handleMouseDown);
        return () => {
            mouse.off("mousedown", handleMouseDown)
        }
    }, [])

    return (
        <div
            className={styles["context-main-container"]}
            style={{ left: pos.x, top: pos.y }}
        >
            <span className={styles["trash"]}><img src={trashIcon}/></span>
            <span className={styles["pallet"]}><img src={palletIcon}/></span>
        </div>
    )
}
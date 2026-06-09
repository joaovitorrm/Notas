import { useEffect, useRef } from "react";
import styles from "./ContextMenu.module.css";
import { MouseData } from "../../types/Mouse";

export type ContextMenuAction = {
    icon: string;
    gridPos: string;
    onClick: () => void;
}

export type ContextMenuData = {
    x: number;
    y: number;
    mouse: MouseData;
    actions: ContextMenuAction[];
}

export default function ContextMenu({ x, y, mouse, actions, onClose }: ContextMenuData & { onClose: () => void }) {

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !mouse) return;
        const rect = containerRef.current.getBoundingClientRect();

        const isOutside =
            mouse.x < rect.left ||
            mouse.x > rect.right ||
            mouse.y < rect.top ||
            mouse.y > rect.bottom;

        if (isOutside) onClose();
    }, [mouse.x, mouse.y]);

    return (
        <div
            className={styles["context-main-container"]}
            style={{ left: `max(6rem, ${x}px)`, top: y }}
            ref={containerRef}
        >
            <div className={styles["hitbox"]} onMouseLeave={onClose} />
            {actions.map((action, i) => (
                <span key={i} style={{ gridArea: action.gridPos }} onClick={() => { action.onClick(); onClose(); }}>
                    <img src={action.icon} />
                </span>
            ))}
        </div>
    )
}
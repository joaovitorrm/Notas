import { useEffect, useRef } from "react";
import styles from "./ContextMenu.module.css";
import { MouseData } from "../../types/Mouse";

export type ContextMenuAction = {
    icon: string;
    label?: string;
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

        const handleMouseOut = (e: MouseEvent) => {
            const isOutside =
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom;

            if (isOutside) onClose();
        }

        mouse.on("mousemove", handleMouseOut);
        return () => {
            mouse.off("mousemove", handleMouseOut)
        }

    }, [x, y]);

    return (
        <div
            className={styles["context-main-container"]}
            style={{ left: `max(6rem, ${x}px)`, top: y }}
            ref={containerRef}
        >
            <div className={styles["hitbox"]} onMouseLeave={onClose} />
            {actions.map((action, i) => (
                <span key={i} style={{ gridArea: action.gridPos }} onClick={() => { action.onClick(); onClose(); }}>
                    {action.icon === "" ? <p>{action.label!}</p> : <img src={action.icon} />}
                </span>
            ))}
        </div>
    )
}
import { useState, useEffect, useRef, useCallback } from "react";
import { MouseCallback, MouseData, MouseHandlerType } from "../types/Mouse";

interface MousePosition {
    x: number;
    y: number;
}

export type MouseHandler = {
    callback: MouseCallback;
    type: MouseHandlerType
}

export function useMousePosition() {
    const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

    const events = useRef<MouseHandler[]>([]);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            events.current.forEach((e) => {
                if (e.type === "mousemove") e.callback(event);
            });

            setPosition({
                x: event.clientX,
                y: event.clientY,
            });
        };

        const handleMouseDown = (event: MouseEvent) => {
            events.current.forEach((e) => {
                if (e.type === "mousedown") e.callback(event);
            });
            setIsMouseDown(true);
        };

        const handleMouseUp = (event: MouseEvent) => {
            events.current.forEach((e) => {
                if (e.type === "mouseup") e.callback(event);
            });
            setIsMouseDown(false);
        };

        const handleContextMenu = (event: MouseEvent) => {
            const contextListeners = events.current.filter(e => e.type === "contextmenu")

            if (contextListeners.length > 0) {
                event.preventDefault()
                contextListeners.forEach(e => e.callback(event))
            }
        }

        window.addEventListener("contextmenu", handleContextMenu);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const on = useCallback((t: MouseHandlerType, f: MouseCallback) => {
        events.current.push({ type: t, callback: f });
    }, []);

    const off = useCallback((t: MouseHandlerType, f: MouseCallback) => {
        events.current = events.current.filter(
            (e) => !(e.type === t && e.callback === f)
        );
    }, []);

    return { x: position.x, y: position.y, isDown: isMouseDown, on, off } as MouseData;
}
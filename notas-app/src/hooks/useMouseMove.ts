import { useCallback, useEffect, useRef } from "react";
import { MouseCallback, MouseData, MouseHandler, MouseHandlerType, MousePosition } from "../types/Mouse";

export function useMousePosition() {
    const position = useRef<MousePosition>({ x: 0, y: 0 });
    const isMouseDown = useRef<boolean>(false);
    const events = useRef<MouseHandler[]>([]);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            position.current = { x: event.clientX, y: event.clientY };
            events.current.forEach((e) => {
                if (e.type === "mousemove") e.callback(event);
            });
        };

        const handleMouseDown = (event: MouseEvent) => {
            isMouseDown.current = true;
            events.current.forEach((e) => {
                if (e.type === "mousedown") e.callback(event);
            });
        };

        const handleMouseUp = (event: MouseEvent) => {
            isMouseDown.current = false;
            events.current.forEach((e) => {
                if (e.type === "mouseup") e.callback(event);
            });
        };

        const handleContextMenu = (event: MouseEvent) => {
            const contextListeners = events.current.filter(e => e.type === "contextmenu");
            if (contextListeners.length > 0) {
                event.preventDefault();
                contextListeners.forEach(e => e.callback(event));
            }
        };

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

    const getPosition = useCallback(() => position.current, []);
    const getIsDown = useCallback(() => isMouseDown.current, []);

    return { getPosition, getIsDown, on, off } as MouseData;
}
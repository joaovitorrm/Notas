export type MouseData = {
    x: number,
    y: number,
    isDown: boolean,
    on: (type: MouseHandlerType, f: MouseCallback) => void,
    off: (type: MouseHandlerType, f: MouseCallback) => void;
}

export type MouseHandlerType = "mousedown" | "mouseup" | "mousemove" | "contextmenu";
export type MouseCallback = (event: MouseEvent) => void;
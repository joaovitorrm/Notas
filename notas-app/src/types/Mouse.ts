export type MouseData = {
    getPosition: () => { x: number; y: number };
    getIsDown: () => boolean;
    on: (t: MouseHandlerType, f: MouseCallback) => void;
    off: (t: MouseHandlerType, f: MouseCallback) => void;
};

export type MousePosition = {x: number, y: number}

export type MouseHandler = {
    callback: MouseCallback;
    type: MouseHandlerType
}

export type MouseHandlerType = "mousedown" | "mouseup" | "mousemove" | "contextmenu";
export type MouseCallback = (event: MouseEvent) => void;
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { ContextMenuData } from "../components/ContextMenu/ContextMenu";
import Postit from "../components/Postit/Postit";
import { ItemData } from "../types";
import { MouseData } from "../types/Mouse";

import palletIcon from "../assets/pallete.png";
import trashIcon from "../assets/trash-can.png";
import { useColorPicker } from "../hooks/useColorPicker";
import { ViewHandle } from "../types/viewHandle";

type PostitsData = {
    openContextMenu: (e: React.MouseEvent, x: number, y: number, actions: ContextMenuData["actions"]) => void;
    items: ItemData[];
    tabId: string;
    mouse: MouseData;
    deleteItem: (id: string) => void;
    saveItem: (i: ItemData) => void;
    updateItem: (i: ItemData) => void;
    updateAndSaveItem: (i: ItemData) => void;
    addAndSaveItem: (i: ItemData) => void;
    addItem: (i: ItemData) => void;
}

const Postits = forwardRef<ViewHandle, PostitsData>(({
    openContextMenu,
    items,
    tabId,
    mouse,
    deleteItem,
    saveItem,
    updateAndSaveItem,
    addAndSaveItem,
    updateItem,
    addItem
}, ref) => {

    const { color, ColorPickerInput, openPicker, setColor } = useColorPicker();
    const [synchedPostitColor, setSynchedPostitColor] = useState<string>("");

    const handlePostitContextMenu = useCallback((e: React.MouseEvent, x: number, y: number, item: ItemData) => {
        openContextMenu(e, x, y, [
            { icon: palletIcon, gridPos: "a", onClick: () => { setColor(item.backgroundColor); openPicker(x, y); setSynchedPostitColor(item.id) } },
            { icon: trashIcon, gridPos: "b", onClick: () => deleteItem(item.id) },
        ]);
    }, [openPicker, deleteItem, setColor]);

    const addNote = useCallback(async (posX: number = 20, posY: number = 20) => {

        const newNote: ItemData = {
            id: crypto.randomUUID(),
            tabId,
            backgroundColor: "hsl(0, 100%, 50%)",
            titleColor: "hsl(0, 0%, 100%)",
            descriptionColor: "hsl(0, 0%, 100%)",
            descriptionFont: "sans-serif",
            titleFont: "sans-serif",
            isMinimized: false,
            description: "",
            sortOrder: 1,
            title: "",
            posX,
            posY
        }

        addAndSaveItem(newNote)
    }, [tabId]);

    useImperativeHandle(ref, () => ({ addNote }), [addNote]);

    useEffect(() => {
        if (!synchedPostitColor) return;
        const foundItem = items.find((i) => synchedPostitColor === i.id);
        if (!foundItem) return;
        const updated = { ...foundItem, backgroundColor: color };
        updateAndSaveItem(updated);
    }, [color, synchedPostitColor])

    return (
        <div className='main-view' onContextMenu={(e) => {
            const { x, y } = mouse.getPosition()
            openContextMenu(e, x, y, [{
                icon: "", label: "➕", gridPos: "a", onClick: () => addNote(x, y)
            }])
        }}>

            {ColorPickerInput}

            {items.map(i => (
                <Postit
                    item={i}
                    key={i.id}
                    mouse={mouse}
                    onDelete={deleteItem}
                    onUpdate={saveItem}
                    onContextMenu={(e, x, y) => handlePostitContextMenu(e, x, y, i)}
                />
            ))}
        </div>
    )
})

export default Postits
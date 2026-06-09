import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Postit.module.css";
import TopBar from './TopBar';
import { ItemData } from "../../types";
import { MouseData } from "../../types/Mouse";

type PostitProps = {
    item: ItemData;
    onDelete: (id: string) => void;
    onUpdate: (i: ItemData) => void;
    onContextMenu: (x: number, y: number) => void;
    mouse: MouseData
}

type Position = { x: number; y: number }


export default function Postit(props: PostitProps) {

    const [title, setTitle] = useState(props.item.title);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const inputTitleRef = useRef<HTMLTextAreaElement>(null);

    const [description, setDescription] = useState(props.item.description)
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const inputDescriptionRef = useRef<HTMLTextAreaElement>(null);

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isPostitHover, setIsPostitHover] = useState<boolean>(false);
    const [isMinimized, setIsMinimized] = useState<boolean>(false);
    const zIndex = useRef<number>(1);

    const [pos, setPos] = useState<Position>({ x: props.item.posX, y: props.item.posY })
    const dragOffset = useRef<Position>({ x: 0, y: 0 })

    const getUpdate = (): ItemData => {
        return { ...props.item, posX: pos.x, posY: pos.y, title, description };
    }

    useEffect(() => {
        if (isEditingTitle) {
            inputTitleRef.current?.select();
        } else {
            props.onUpdate(getUpdate());
        }
    }, [isEditingTitle])

    useEffect(() => {
        if (isEditingDescription) {
            inputDescriptionRef.current?.select();
        } else {
            props.onUpdate(getUpdate());
        }
    }, [isEditingDescription])

    const copy = useCallback(async (text: string) => {
        document.body.classList.add(styles["cursor-copy"]);
        await navigator.clipboard.writeText(text);
        setTimeout(() => {
            document.body.classList.remove(styles["cursor-copy"]);
        }, 200)
    }, []);

    const handleClose = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>, type: "title" | "description") => {
        if (type === "title") {
            if (e.key === "Enter" || e.key === "Escape") {
                setIsEditingTitle(false);
                e.preventDefault();
                setIsEditingDescription(true);
            };
        } else {
            if (e.key === "Enter" || e.key === "Escape") setIsEditingDescription(false);
        }
    }, []);

    const handleMinimize = useCallback(() => {
        setIsMinimized((prev) => !prev);
    }, [])

    const handleHoverEnter = useCallback(() => {
        zIndex.current = 2;
        setIsPostitHover(true);
    }, [])

    const handleHoverLeave = useCallback(() => {
        zIndex.current = 1;
        setIsPostitHover(false);
    }, [])

    const onMouseDown = (e: React.MouseEvent) => {
        // salva onde dentro do postit o clique aconteceu
        dragOffset.current = {
            x: e.clientX - pos.x,
            y: e.clientY - pos.y,
        }

        zIndex.current = 3;
        setIsDragging(true);

        let currentPos = { ...pos } // ← rastreia a posição atual

        const onMouseMove = (e: MouseEvent) => {
            currentPos = {
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y,
            }
            setPos(currentPos)
        }

        const onMouseUp = () => {
            props.mouse.off('mousemove', onMouseMove);
            props.mouse.off('mouseup', onMouseUp);
            zIndex.current = 1;
            props.onUpdate({ ...props.item, posX: currentPos.x, posY: currentPos.y, title, description }) // ← usa currentPos
            setIsDragging(false);
        }

        props.mouse.on("mousemove", onMouseMove);
        props.mouse.on('mouseup', onMouseUp);
    }

    return (
        <div 
            key={props.item.id} 
            className={`${styles["postit"]} ${isMinimized && styles["minimized"]}`} 
            onMouseEnter={() => handleHoverEnter()} 
            onMouseLeave={() => handleHoverLeave()}
            onContextMenu={(e) => {e.preventDefault(); props.onContextMenu(e.clientX, e.clientY)}}
            style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                zIndex: zIndex.current,
                backgroundColor: props.item.color
            }}
        >
            {(isPostitHover || isDragging) && <TopBar onMinimize={handleMinimize} onMouseDown={onMouseDown} onDelete={() => props.onDelete(props.item.id)} />}

            {isEditingTitle ?
                <textarea
                    className={styles["title"]}
                    value={title}
                    onKeyDown={(e) => handleClose(e, "title")}
                    onChange={(e) => setTitle(e.target.value)}
                    ref={inputTitleRef}
                    onBlur={() => setIsEditingTitle(false)}>
                </textarea> :
                <h2
                    className={styles["title"]}
                    onDoubleClick={() => setIsEditingTitle(true)}>{title}
                </h2>
            }

            {!isMinimized &&
                (isEditingDescription ?
                    <textarea
                        className={styles["description"]}
                        value={description}
                        onKeyDown={(e) => handleClose(e, "description")}
                        onChange={e => setDescription(e.target.value)}
                        ref={inputDescriptionRef}
                        onBlur={() => setIsEditingDescription(false)}>
                    </textarea> :
                    <p
                        onDoubleClick={() => setIsEditingDescription(true)}
                        className={styles["description"]}>{description}
                    </p>
                )}

            {!isMinimized && description.length > 0 && <svg className={styles["copy"]} onClick={() => copy(description)} xmlns="http://www.w3.org/2000/svg" id="Layer_1" height="24" viewBox="0 0 24 24" width="24" data-name="Layer 1"><path d="m13 20a5.006 5.006 0 0 0 5-5v-8.757a3.972 3.972 0 0 0 -1.172-2.829l-2.242-2.242a3.972 3.972 0 0 0 -2.829-1.172h-4.757a5.006 5.006 0 0 0 -5 5v10a5.006 5.006 0 0 0 5 5zm-9-5v-10a3 3 0 0 1 3-3s4.919.014 5 .024v1.976a2 2 0 0 0 2 2h1.976c.01.081.024 9 .024 9a3 3 0 0 1 -3 3h-6a3 3 0 0 1 -3-3zm18-7v11a5.006 5.006 0 0 1 -5 5h-9a1 1 0 0 1 0-2h9a3 3 0 0 0 3-3v-11a1 1 0 0 1 2 0z" />
                <path xmlns="http://www.w3.org/2000/svg" d="m13 20a5.006 5.006 0 0 0 5-5v-8.757a3.972 3.972 0 0 0 -1.172-2.829l-2.242-2.242a3.972 3.972 0 0 0 -2.829-1.172h-4.757a5.006 5.006 0 0 0 -5 5v10a5.006 5.006 0 0 0 5 5zm-9-5v-10a3 3 0 0 1 3-3s4.919.014 5 .024v1.976a2 2 0 0 0 2 2h1.976c.01.081.024 9 .024 9a3 3 0 0 1 -3 3h-6a3 3 0 0 1 -3-3zm18-7v11a5.006 5.006 0 0 1 -5 5h-9a1 1 0 0 1 0-2h9a3 3 0 0 0 3-3v-11a1 1 0 0 1 2 0z" />
            </svg>}
        </div>
    )
}
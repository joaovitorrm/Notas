import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Postit.module.css";

type PostitProps = {
    postit: PostitData
}

export type PostitData = {
    title: string;
    description: string;
    onDelete: Function;
}

export default function Postit({ postit }: PostitProps) {

    const [title, setTitle] = useState(postit.title);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const inputTitleRef = useRef<HTMLTextAreaElement>(null);

    const [description, setDescription] = useState(postit.description)
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const inputDescriptionRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditingTitle) {
            inputTitleRef.current?.select();
        }
    }, [isEditingTitle])

    useEffect(() => {
        if (isEditingDescription) {
            inputDescriptionRef.current?.select();
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

    return (
        <div className={styles["postit"]}>
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
            {isEditingDescription ?
                <textarea
                    className={styles["description"]}
                    value={description}
                    onKeyDown={(e) => handleClose(e, "description")}
                    onChange={e => setDescription(e.target.value)}
                    ref={inputDescriptionRef}
                    onBlur={() => setIsEditingDescription(false)}
                ></textarea> :
                <p
                    onDoubleClick={() => setIsEditingDescription(true)}
                    className={styles["description"]}>{description}
                </p>
            }
            <span className={styles["copy"]} onClick={() => copy(description)}>📄</span>
        </div>
    )
}
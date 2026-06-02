import ThemeToggle from "./ThemeToggle";
import ViewTypeSelect from "./ViewType";

import styles from "./ToolBar.module.css";

type ToolBarProps = {
    onAdd : Function;
}

export default function ToolBar({onAdd} : ToolBarProps) {

    return (
        <div className={styles["toolbar"]}>
            <ThemeToggle/>
            <ViewTypeSelect/>

            <button className={styles["add-btn"]} onClick={() => onAdd()}>
                +
            </button>
        </div>
    )
}
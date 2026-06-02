import { useEffect, useState } from "react";

import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {

    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        document.documentElement.style.setProperty("color-scheme", theme);
    }, [theme]);

    return (
        <>
            <button className={styles["theme-toggle"]}
                onClick={() => setTheme((prev) => prev === "light" ? "dark" : "light")}
            >
                {theme === "light" ? "🌙" : "☀️"}
            </button>
        </>
    )
}
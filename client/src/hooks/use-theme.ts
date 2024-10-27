import {useEffect, useState} from "react";

interface UseThemeReturn {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {

        const storedTheme = localStorage.getItem("theme");

        const prefersDark = storedTheme === "dark" ||
            (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (prefersDark) {
            document.documentElement.classList.add("dark");
            setIsDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        const newIsDark = !html.classList.contains("dark");

        if (newIsDark) {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            html.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }

        setIsDarkMode(newIsDark);
    };

    return {
        isDarkMode,
        toggleTheme
    };
}
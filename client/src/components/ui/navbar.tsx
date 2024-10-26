import { useState, useEffect } from "react";

export const  Navbar = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Sayfa yüklendiğinde kullanıcı tercihine göre tema ayarlanıyor
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
            document.documentElement.classList.add("dark");
            setIsDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;

        if (html.classList.contains("dark")) {
            html.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDarkMode(false);
        } else {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDarkMode(true);
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-white  dark:bg-nav-color dark:invert-0 shadow-md z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex-1"></div>

                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    <img className={'h-10 invert dark:invert-0'} src="https://www.panteon.games/wp-content/themes/panteon/assets/img/logo.png" alt="Google" />
                </div>

                <div className="flex-1 flex justify-end">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                    >
                        {isDarkMode ? (
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                            </svg>
                        ) : (
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M12 2v2m0 16v2m10-10h-2m-16 0H2m15.66 6.34l1.42-1.42m-12.02 0l1.42 1.42m12.02-12.02l-1.42 1.42m-9.8 0L4.34 4.34M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}



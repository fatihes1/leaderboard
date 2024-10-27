import {useTheme} from "@/hooks/use-theme.ts";
import {Moon, Sun} from "lucide-react";

export const  Navbar = () => {
    const {isDarkMode, toggleTheme} = useTheme();

    return (
        <nav className="fixed top-0 left-0 w-full bg-white dark:bg-nav-color dark:invert-0 shadow-md z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex-1"></div>

                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    <img className={'h-6 md:h-10 invert dark:invert-0'} src="https://www.panteon.games/wp-content/themes/panteon/assets/img/logo.png" alt="Google" />
                </div>

                <div className="flex-1 flex justify-end">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-white dark:bg-nav-color border border-gray-200 dark:border-purple-600 text-black dark:text-gray-100 transition-colors"
                        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDarkMode ? (
                            <Sun className="w-4 md:w-6 h-4 md:h-6"/>
                        ) : (
                            <Moon className="w-4 md:w-6 h-4 md:h-6"/>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}



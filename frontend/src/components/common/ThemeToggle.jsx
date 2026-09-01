import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle(){
    const { theme, toggleTheme } = useTheme();
    return(
        <button 
            type="button"
            onClick={toggleTheme}
            aria-label="Toogle theme"
            className="p-2 rounded-full text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transistion-colors"
        >
            {theme === 'dark' ? (
                <Sun className="w5 h-5" />
            ): (
                <Moon className="w5 h-5" />
            )
            }
        </button>

    )
}
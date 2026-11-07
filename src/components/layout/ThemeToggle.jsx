import { useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage.js';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
}

// Let visitors switch between light and dark color schemes and remember their choice.
export default function ThemeToggle() {
  const [savedTheme, setSavedTheme] = useLocalStorage('pet-heaven-theme', getSystemTheme());
  const theme = savedTheme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute('content', theme === 'dark' ? '#121a1b' : '#fff8f0');
  }, [theme]);

  function toggleTheme() {
    setSavedTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <button
      aria-label={theme === 'dark' ? 'Turn off dark mode' : 'Turn on dark mode'}
      aria-pressed={theme === 'dark'}
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true" className="theme-toggle__icon">{theme === 'dark' ? '☀' : '☾'}</span>
      <span>Dark mode</span>
      <span className="theme-toggle__state">{theme === 'dark' ? 'On' : 'Off'}</span>
    </button>
  );
}

'use client'; 

import { useState, useEffect } from 'react';

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState('dark'); // Valor inicial padrão

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []); // Executa apenas uma vez, após o componente ser montado

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]); // Executa quando o tema muda

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
};
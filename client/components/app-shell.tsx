'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import Nav from '@/components/nav';
import CommandPalette from '@/components/command-palette';
import { ThemeContext, type Theme } from '@/lib/theme-context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [cmdkOpen, setCmdkOpen] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem('theme') ?? 'light') as Theme;
    setTheme(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.dataset.theme = next;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdkOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Nav onCmdK={() => setCmdkOpen(true)} />
      <main style={{ minHeight: '100vh' }}>{children}</main>
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: 'var(--text)',
            color: 'var(--bg)',
            borderRadius: '999px',
            padding: '9px 14px',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '13px',
            border: 'none',
          },
        }}
      />
      <CommandPalette open={cmdkOpen} onClose={() => setCmdkOpen(false)} />
    </ThemeContext.Provider>
  );
}

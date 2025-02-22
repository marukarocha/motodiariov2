'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { navLinks } from '@/lib/constants'
import { useAuth } from '../USER/Auth/AuthContext';
import { auth as authInstance } from '../../lib/db/firebaseServices';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark'); // Default theme set to dark
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await signOut(authInstance);
      localStorage.removeItem('uid'); // Clear UID on logout
      router.push('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex items-center justify-between h-16 mx-auto">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          Diário
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Theme Switcher and Logout Button */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Logout Button */}
          {currentUser && (
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 inset-x-0 bg-background md:hidden">
          <div className="px-4 py-2 space-y-2 border-t">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

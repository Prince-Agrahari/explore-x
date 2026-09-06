import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Button } from './ui';
import { cn } from '../utils/cn';

const Navbar = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setProfileOpen(false);
      }
    };
    const onPointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
      setProfileOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const linkClass = ({ isActive }) =>
    cn(
      'rounded-md px-3 py-2 text-sm transition-colors',
      isActive ? 'text-ink' : 'text-muted hover:text-ink'
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-sm">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6" aria-label="Primary">
        <Link to="/" className="flex items-center gap-2.5 text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-sm font-medium text-canvas" aria-hidden="true">
            X
          </span>
          <span className="font-display text-xl tracking-tight">Explore X</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                My trips
              </NavLink>
              <Button to="/create-trip" size="sm" className="ml-3">
                Plan new trip
              </Button>
              <div className="relative ml-2" ref={profileRef}>
                <button
                  type="button"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-controls="profile-menu"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="rounded-md px-3 py-2 text-sm text-ink hover:bg-sand"
                >
                  {user.displayName || 'Profile'}
                </button>
                {profileOpen && (
                  <div id="profile-menu" className="absolute right-0 mt-2 w-44 rounded-lg border border-line bg-surface py-1 shadow-card" role="menu">
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="block px-3 py-2 text-sm text-ink hover:bg-sand"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-sand"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <Button to="/signup" size="sm" className="ml-3">
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-ink md:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <FaTimes className="h-5 w-5" aria-hidden="true" /> : <FaBars className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {isMenuOpen && (
        <div id="mobile-menu" className="border-t border-line px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            <Link to="/" className="rounded-md px-2 py-2 text-ink hover:bg-sand" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="rounded-md px-2 py-2 text-ink hover:bg-sand" onClick={() => setIsMenuOpen(false)}>
                  My trips
                </Link>
                <Link to="/create-trip" className="rounded-md px-2 py-2 text-ink hover:bg-sand" onClick={() => setIsMenuOpen(false)}>
                  Plan new trip
                </Link>
                <Link to="/profile" className="rounded-md px-2 py-2 text-ink hover:bg-sand" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                <button type="button" onClick={handleLogout} className="rounded-md px-2 py-2 text-left text-ink hover:bg-sand">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-md px-2 py-2 text-ink hover:bg-sand" onClick={() => setIsMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/signup" className="rounded-md px-2 py-2 text-ink hover:bg-sand" onClick={() => setIsMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

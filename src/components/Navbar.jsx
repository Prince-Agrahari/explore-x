import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FaPlane, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and App Name */}
          <Link to="/" className="flex items-center space-x-2">
            <FaPlane className="text-white text-2xl" />
            <span className="text-white font-bold text-xl">AI Travel Planner</span>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-blue-200 px-3 py-2 rounded-md">
              Home
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-blue-200 px-3 py-2 rounded-md">
                  My Trips
                </Link>
                <Link to="/create-trip" className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md font-medium">
                  Plan New Trip
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-white hover:text-blue-200 px-3 py-2 rounded-md">
                    <FaUserCircle className="mr-2" />
                    {user.displayName || 'Profile'}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      My Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-blue-200 px-3 py-2 rounded-md">
                  Log in
                </Link>
                <Link to="/signup" className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md font-medium">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-500">
            <Link to="/" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md" onClick={toggleMenu}>
              Home
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md" onClick={toggleMenu}>
                  My Trips
                </Link>
                <Link to="/create-trip" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md" onClick={toggleMenu}>
                  Plan New Trip
                </Link>
                <Link to="/profile" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md" onClick={toggleMenu}>
                  My Profile
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left text-white hover:bg-blue-700 px-3 py-2 rounded-md"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md" onClick={toggleMenu}>
                  Log in
                </Link>
                <Link to="/signup" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md" onClick={toggleMenu}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
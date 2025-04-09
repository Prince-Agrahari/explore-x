import { FaPlane, FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Logo and About */}
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <FaPlane className="text-blue-400 text-2xl mr-2" />
              <span className="text-xl font-bold">AI Travel Planner</span>
            </div>
            <p className="text-gray-300 max-w-xs">
              Your AI-powered travel companion for creating personalized trip itineraries.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-blue-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/create-trip" className="text-gray-300 hover:text-blue-400 transition">
                  Plan a Trip
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-blue-400 transition">
                  My Trips
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <FaGithub className="text-2xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <FaTwitter className="text-2xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <FaInstagram className="text-2xl" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} AI Travel Planner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
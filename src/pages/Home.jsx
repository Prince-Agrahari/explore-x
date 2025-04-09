import { Link } from 'react-router-dom';
import { FaRobot, FaMapMarkedAlt, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your AI-Powered Travel Companion
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Plan your perfect trip with personalized AI recommendations based on your preferences, budget, and interests.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/create-trip" 
              className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-blue-50 transition"
            >
              Plan Your Trip
            </Link>
            <Link 
              to="/signup" 
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-blue-600 transition"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkedAlt className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Destination</h3>
              <p className="text-gray-600">
                Tell us where you want to go and when you're planning to travel.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCreditCard className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Set Your Budget</h3>
              <p className="text-gray-600">
                Define how much you want to spend and we'll tailor recommendations accordingly.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRobot className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Generates Plan</h3>
              <p className="text-gray-600">
                Our AI creates a personalized itinerary based on your preferences and interests.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save & Modify</h3>
              <p className="text-gray-600">
                Save your itineraries and modify them as needed for future reference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Plan Your Dream Trip?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of travelers who use AI Travel Planner to create personalized itineraries and make their travel dreams come true.
          </p>
          <Link 
            to="/create-trip" 
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            Start Planning Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 
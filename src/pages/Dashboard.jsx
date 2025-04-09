import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { FaPlus, FaMapMarkedAlt, FaCalendarAlt, FaEllipsisH } from 'react-icons/fa';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userId = auth.currentUser.uid;
        const tripsRef = collection(db, 'trips');
        const q = query(tripsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const tripsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTrips(tripsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load your trips. Please try again later.');
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const toggleDropdown = (tripId) => {
    if (activeDropdown === tripId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(tripId);
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate trip duration in days
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
        <Link 
          to="/create-trip" 
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" />
          New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaMapMarkedAlt className="text-6xl text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No trips planned yet</h2>
          <p className="text-gray-600 mb-6">Start planning your next adventure with our AI-powered trip planner!</p>
          <Link 
            to="/create-trip" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Plan Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center" 
                style={{ backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzN8fHRyYXZlbHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'})` }}
              ></div>
              
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{trip.destination}</h3>
                  <div className="relative">
                    <button 
                      onClick={() => toggleDropdown(trip.id)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <FaEllipsisH />
                    </button>
                    
                    {activeDropdown === trip.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <Link 
                          to={`/trips/${trip.id}`}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          View Details
                        </Link>
                        <Link 
                          to={`/trips/${trip.id}/edit`}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Edit Trip
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <FaCalendarAlt className="mr-2" />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {calculateDuration(trip.startDate, trip.endDate)} days • Budget: ${trip.budget}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {trip.interests && trip.interests.map((interest, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
                
                <Link 
                  to={`/trips/${trip.id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  View Itinerary
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 
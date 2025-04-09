import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { FaCalendarAlt, FaMapMarkedAlt, FaUserFriends, FaDollarSign, FaUtensils, FaCamera, FaBed, FaWalking, FaEllipsisH, FaArrowLeft, FaTrash, FaPencilAlt, FaDownload } from 'react-icons/fa';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripDoc = await getDoc(doc(db, 'trips', id));
        
        if (!tripDoc.exists()) {
          setError('Trip not found');
          setLoading(false);
          return;
        }
        
        const tripData = {
          id: tripDoc.id,
          ...tripDoc.data()
        };
        
        // Ensure the user has permission to view this trip
        if (tripData.userId !== auth.currentUser?.uid) {
          setError('You do not have permission to view this trip');
          setLoading(false);
          return;
        }
        
        setTrip(tripData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trip:', err);
        setError('Failed to load trip details. Please try again later.');
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleDeleteTrip = async () => {
    try {
      await deleteDoc(doc(db, 'trips', id));
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip. Please try again later.');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const downloadItinerary = () => {
    if (!trip) return;
    
    const itineraryText = generateItineraryText(trip);
    const blob = new Blob([itineraryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.destination.replace(/\s+/g, '-').toLowerCase()}-itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateItineraryText = (trip) => {
    let text = `TRAVEL ITINERARY: ${trip.destination.toUpperCase()}\n`;
    text += `${formatDate(trip.startDate)} to ${formatDate(trip.endDate)}\n\n`;
    
    text += `TRIP SUMMARY:\n`;
    text += `Destination: ${trip.destination}\n`;
    text += `Duration: ${calculateDuration(trip.startDate, trip.endDate)} days\n`;
    text += `Budget: $${trip.budget}\n`;
    text += `Travelers: ${trip.travelers}\n`;
    text += `Interests: ${trip.interests.join(', ')}\n\n`;
    
    if (trip.itinerary && trip.itinerary.days) {
      text += `DAILY ITINERARY:\n\n`;
      
      trip.itinerary.days.forEach(day => {
        text += `DAY ${day.dayNumber} - ${day.date}\n`;
        text += `------------------------\n`;
        
        if (day.morning) {
          text += `MORNING: ${day.morning.activity}\n`;
          text += `${day.morning.description}\n`;
          text += `Estimated Cost: $${day.morning.estimatedCost}\n\n`;
        }
        
        if (day.afternoon) {
          text += `AFTERNOON: ${day.afternoon.activity}\n`;
          text += `${day.afternoon.description}\n`;
          text += `Estimated Cost: $${day.afternoon.estimatedCost}\n\n`;
        }
        
        if (day.evening) {
          text += `EVENING: ${day.evening.activity}\n`;
          text += `${day.evening.description}\n`;
          text += `Estimated Cost: $${day.evening.estimatedCost}\n\n`;
        }
        
        if (day.accommodation) {
          text += `ACCOMMODATION: ${day.accommodation.name}\n`;
          text += `${day.accommodation.description}\n`;
          text += `Estimated Cost: $${day.accommodation.estimatedCost}\n\n`;
        }
        
        text += `\n`;
      });
    }
    
    if (trip.itinerary && trip.itinerary.generalTips && trip.itinerary.generalTips.length > 0) {
      text += `GENERAL TIPS:\n`;
      trip.itinerary.generalTips.forEach((tip, index) => {
        text += `${index + 1}. ${tip}\n`;
      });
      text += `\n`;
    }
    
    text += `Total Estimated Cost: $${trip.itinerary?.totalEstimatedCost || 'N/A'}\n\n`;
    text += `Generated by AI Travel Planner - Your personal AI travel companion`;
    
    return text;
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
        <div className="mt-4">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!trip || !trip.itinerary) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          This trip doesn't have a generated itinerary yet or the data is incomplete.
        </div>
        <div className="mt-4">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      {/* Top Bar with Trip Title and Actions */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link to="/dashboard" className="mr-4 text-gray-600 hover:text-gray-800">
            <FaArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{trip.destination}</h1>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <FaEllipsisH className="text-xl" />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button 
                onClick={downloadItinerary}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <FaDownload className="inline mr-2" /> Download Itinerary
              </button>
              <Link 
                to={`/trips/${id}/edit`}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <FaPencilAlt className="inline mr-2" /> Edit Trip
              </Link>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                <FaTrash className="inline mr-2" /> Delete Trip
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Trip Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Dates</p>
              <p className="font-medium">{formatDate(trip.startDate).split(',')[0]} - {formatDate(trip.endDate).split(',')[0]}</p>
              <p className="text-sm text-gray-600">{calculateDuration(trip.startDate, trip.endDate)} days</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaDollarSign className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Budget</p>
              <p className="font-medium">${trip.budget}</p>
              <p className="text-sm text-gray-600">Total estimated</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FaUserFriends className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Travelers</p>
              <p className="font-medium">{trip.travelers}</p>
              <p className="text-sm text-gray-600">People</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FaMapMarkedAlt className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Destination</p>
              <p className="font-medium">{trip.destination}</p>
              <p className="text-sm text-gray-600">{trip.accommodationType} stay</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-gray-600 mb-2">Your Interests</h3>
          <div className="flex flex-wrap gap-2">
            {trip.interests && trip.interests.map((interest, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Day Selector */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          <button
            onClick={() => setActiveDay(0)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeDay === 0
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          
          {trip.itinerary.days && trip.itinerary.days.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index + 1)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeDay === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>
      
      {/* Overview Tab */}
      {activeDay === 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {trip.itinerary.generalTips && trip.itinerary.generalTips.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">General Tips</h3>
                <ul className="space-y-2">
                  {trip.itinerary.generalTips.map((tip, index) => (
                    <li key={index} className="flex">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {trip.itinerary.accommodationSuggestions && trip.itinerary.accommodationSuggestions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <FaBed className="text-blue-600 mr-2" /> Accommodation Suggestions
                </h3>
                <ul className="space-y-2">
                  {trip.itinerary.accommodationSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {trip.itinerary.transportationOptions && trip.itinerary.transportationOptions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FaWalking className="text-blue-600 mr-2" /> Transportation Options
              </h3>
              <ul className="space-y-2">
                {trip.itinerary.transportationOptions.map((option, index) => (
                  <li key={index} className="flex">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{option}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Trip Cost Summary</h3>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-md">
              <span className="font-medium">Total Estimated Cost:</span>
              <span className="text-xl font-bold text-blue-600">${trip.itinerary.totalEstimatedCost || 'N/A'}</span>
            </div>
            <p className="mt-4 text-gray-600 text-sm">
              This is an estimate based on your preferences and may vary depending on actual bookings, seasonal changes, and availability.
            </p>
          </div>
        </div>
      )}
      
      {/* Daily Itinerary Tabs */}
      {activeDay > 0 && trip.itinerary.days && trip.itinerary.days[activeDay - 1] && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 text-white">
            <h3 className="text-xl font-semibold">
              Day {trip.itinerary.days[activeDay - 1].dayNumber} - {formatDate(trip.itinerary.days[activeDay - 1].date || '')}
            </h3>
          </div>
          
          <div className="p-6">
            {/* Morning Activity */}
            {trip.itinerary.days[activeDay - 1].morning && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                    <span className="text-yellow-600">AM</span>
                  </div>
                  Morning: {trip.itinerary.days[activeDay - 1].morning.activity}
                </h4>
                <p className="mb-2 text-gray-700">{trip.itinerary.days[activeDay - 1].morning.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-medium">${trip.itinerary.days[activeDay - 1].morning.estimatedCost}</span>
                </div>
              </div>
            )}
            
            {/* Afternoon Activity */}
            {trip.itinerary.days[activeDay - 1].afternoon && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <span className="text-blue-600">PM</span>
                  </div>
                  Afternoon: {trip.itinerary.days[activeDay - 1].afternoon.activity}
                </h4>
                <p className="mb-2 text-gray-700">{trip.itinerary.days[activeDay - 1].afternoon.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-medium">${trip.itinerary.days[activeDay - 1].afternoon.estimatedCost}</span>
                </div>
              </div>
            )}
            
            {/* Evening Activity */}
            {trip.itinerary.days[activeDay - 1].evening && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                    <span className="text-indigo-600">Eve</span>
                  </div>
                  Evening: {trip.itinerary.days[activeDay - 1].evening.activity}
                </h4>
                <p className="mb-2 text-gray-700">{trip.itinerary.days[activeDay - 1].evening.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-medium">${trip.itinerary.days[activeDay - 1].evening.estimatedCost}</span>
                </div>
              </div>
            )}
            
            {/* Accommodation */}
            {trip.itinerary.days[activeDay - 1].accommodation && (
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold flex items-center mb-2">
                  <FaBed className="text-gray-600 mr-2" />
                  Accommodation: {trip.itinerary.days[activeDay - 1].accommodation.name}
                </h4>
                <p className="mb-2 text-gray-700">{trip.itinerary.days[activeDay - 1].accommodation.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-medium">${trip.itinerary.days[activeDay - 1].accommodation.estimatedCost}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Delete Trip</h2>
            <p className="mb-6">Are you sure you want to delete this trip? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTrip}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails; 
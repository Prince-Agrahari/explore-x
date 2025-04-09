import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { generateItinerary } from '../utils/geminiService';
import { FaPlane, FaSpinner, FaCalendarAlt, FaMapMarkedAlt, FaDollarSign, FaUserFriends } from 'react-icons/fa';

const INTERESTS = [
  'History', 'Art', 'Museums', 'Food', 'Nightlife', 'Shopping', 
  'Nature', 'Adventure', 'Relaxation', 'Photography', 'Architecture', 'Local Culture',
  'Beaches', 'Hiking', 'Wildlife', 'Music', 'Sports', 'Family Activities'
];

const ACCOMMODATION_TYPES = ['Hotel', 'Hostel', 'Resort', 'Apartment', 'Guesthouse', 'Any'];
const TRANSPORTATION_TYPES = ['Public Transport', 'Rental Car', 'Walking/Biking', 'Guided Tours', 'Taxi/Rideshare', 'Any'];

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: 1,
    interests: [],
    accommodationType: 'Any',
    transportationType: 'Any',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interest) => {
    setFormData(prev => {
      const interests = [...prev.interests];
      if (interests.includes(interest)) {
        return { ...prev, interests: interests.filter(i => i !== interest) };
      } else {
        if (interests.length < 5) {
          return { ...prev, interests: [...interests, interest] };
        }
        return prev;
      }
    });
  };

  const validateStep1 = () => {
    if (!formData.destination) return "Please enter a destination";
    if (!formData.startDate) return "Please select a start date";
    if (!formData.endDate) return "Please select an end date";
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) return "Start date cannot be in the past";
    if (end < start) return "End date cannot be before start date";
    
    return null;
  };

  const validateStep2 = () => {
    if (!formData.budget || isNaN(formData.budget) || formData.budget <= 0) {
      return "Please enter a valid budget amount";
    }
    if (!formData.travelers || isNaN(formData.travelers) || formData.travelers < 1) {
      return "Please enter at least 1 traveler";
    }
    if (formData.interests.length === 0) {
      return "Please select at least one interest";
    }
    return null;
  };

  const nextStep = () => {
    let validationError = null;
    
    if (step === 1) {
      validationError = validateStep1();
    } else if (step === 2) {
      validationError = validateStep2();
    }
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate user is logged in
      if (!auth.currentUser) {
        throw new Error('You must be logged in to create a trip');
      }

      const userId = auth.currentUser.uid;
      
      // Generate AI itinerary
      const itineraryData = await generateItinerary({
        ...formData,
        budget: Number(formData.budget),
        travelers: Number(formData.travelers)
      });
      
      // Save trip to Firestore
      const tripData = {
        ...formData,
        userId,
        budget: Number(formData.budget),
        travelers: Number(formData.travelers),
        createdAt: new Date(),
        itinerary: itineraryData
      };
      
      const docRef = await addDoc(collection(db, 'trips'), tripData);
      
      // Redirect to trip details page
      navigate(`/trips/${docRef.id}`);
    } catch (err) {
      console.error('Error creating trip:', err);
      setError(err.message || 'Failed to create trip. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <FaPlane className="mr-3" /> Plan Your Trip
          </h1>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center w-full">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${step >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500'}`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${step >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500'}`}>
                2
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${step >= 3 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500'}`}>
                3
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Where are you going?</h2>
                
                <div className="mb-6">
                  <label htmlFor="destination" className="block text-gray-700 mb-2">Destination</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkedAlt className="text-gray-400" />
                    </div>
                    <input
                      id="destination"
                      name="destination"
                      type="text"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="e.g. Paris, France"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="startDate" className="block text-gray-700 mb-2">Start Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-gray-700 mb-2">End Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Preferences */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">What are your preferences?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="budget" className="block text-gray-700 mb-2">Total Budget (USD)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaDollarSign className="text-gray-400" />
                      </div>
                      <input
                        id="budget"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="1000"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="travelers" className="block text-gray-700 mb-2">Number of Travelers</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserFriends className="text-gray-400" />
                      </div>
                      <input
                        id="travelers"
                        name="travelers"
                        type="number"
                        value={formData.travelers}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Interests (select up to 5)</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestChange(interest)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          formData.interests.includes(interest)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Selected: {formData.interests.length}/5</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="accommodationType" className="block text-gray-700 mb-2">Accommodation Preference</label>
                    <select
                      id="accommodationType"
                      name="accommodationType"
                      value={formData.accommodationType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ACCOMMODATION_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="transportationType" className="block text-gray-700 mb-2">Transportation Preference</label>
                    <select
                      id="transportationType"
                      name="transportationType"
                      value={formData.transportationType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TRANSPORTATION_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Additional Notes & Confirmation */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Any special requests?</h2>
                
                <div className="mb-6">
                  <label htmlFor="notes" className="block text-gray-700 mb-2">Additional Notes or Requests (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Tell us about any special requirements or things you'd like us to consider..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  ></textarea>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">Trip Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div><span className="font-medium">Destination:</span> {formData.destination}</div>
                    <div><span className="font-medium">Dates:</span> {new Date(formData.startDate).toLocaleDateString()} to {new Date(formData.endDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Budget:</span> ${formData.budget}</div>
                    <div><span className="font-medium">Travelers:</span> {formData.travelers}</div>
                    <div className="col-span-2"><span className="font-medium">Interests:</span> {formData.interests.join(', ')}</div>
                    <div><span className="font-medium">Accommodation:</span> {formData.accommodationType}</div>
                    <div><span className="font-medium">Transportation:</span> {formData.transportationType}</div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Click "Generate Itinerary" to have our AI create a personalized travel plan based on your preferences. This might take a few moments.
                </p>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Generating Itinerary...
                    </span>
                  ) : (
                    'Generate Itinerary'
                  )}
                </button>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back
                </button>
              )}
              
              {step < 3 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip; 
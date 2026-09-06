import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { generateItinerary } from '../utils/geminiService';
import { isValidItinerary } from '../utils/itinerary';
import { EMPTY_TRIP_FORM, generationPayload } from '../utils/tripForm';
import TripWizard from '../components/TripWizard';
import { usePageTitle } from '../hooks/usePageTitle';

const CreateTrip = () => {
  usePageTitle('Plan a trip');
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to create a trip');
    }

    const itineraryData = await generateItinerary(generationPayload(formData));
    if (!isValidItinerary(itineraryData)) {
      throw new Error('The generated itinerary was not valid. Please try again.');
    }

    const docRef = await addDoc(collection(db, 'trips'), {
      ...generationPayload(formData),
      userId: auth.currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      itinerary: itineraryData,
    });

    navigate(`/trips/${docRef.id}`);
  };

  return (
    <TripWizard
      initialValues={EMPTY_TRIP_FORM}
      eyebrow="New itinerary"
      title="Plan your trip"
      description="Three short steps. Gemini writes the days after you confirm."
      submitLabel="Generate itinerary"
      onSubmit={handleSubmit}
    />
  );
};

export default CreateTrip;

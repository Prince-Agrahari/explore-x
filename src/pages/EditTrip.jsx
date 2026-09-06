import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { generateItinerary } from '../utils/geminiService';
import { isValidItinerary } from '../utils/itinerary';
import { generationPayload, tripToForm } from '../utils/tripForm';
import { Alert, Container } from '../components/ui';
import TripWizard from '../components/TripWizard';
import { usePageTitle } from '../hooks/usePageTitle';

const EditTrip = () => {
  usePageTitle('Edit trip');
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [originalStartDate, setOriginalStartDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadTrip = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!auth.currentUser) {
          throw new Error('You must be logged in to edit a trip');
        }

        const snapshot = await getDoc(doc(db, 'trips', id));
        if (!snapshot.exists()) {
          throw new Error('Trip not found');
        }

        const trip = snapshot.data();
        if (trip.userId !== auth.currentUser.uid) {
          throw new Error('You do not have permission to edit this trip');
        }

        if (cancelled) return;
        const form = tripToForm(trip);
        setInitialValues(form);
        setOriginalStartDate(form.startDate);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        const denied = err?.code === 'permission-denied';
        setError(denied ? 'You do not have permission to edit this trip' : (err.message || 'Failed to load this trip.'));
        setLoading(false);
      }
    };

    loadTrip();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (formData) => {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to edit a trip');
    }

    const latest = await getDoc(doc(db, 'trips', id));
    if (!latest.exists()) {
      throw new Error('Trip not found');
    }
    if (latest.data().userId !== auth.currentUser.uid) {
      throw new Error('You do not have permission to edit this trip');
    }

    const itineraryData = await generateItinerary(generationPayload(formData));
    if (!isValidItinerary(itineraryData)) {
      throw new Error('The generated itinerary was not valid. Please try again.');
    }

    await updateDoc(doc(db, 'trips', id), {
      ...generationPayload(formData),
      itinerary: itineraryData,
      updatedAt: new Date(),
    });

    navigate(`/trips/${id}`);
  };

  if (loading) {
    return (
      <Container width="form" className="py-16">
        <p className="text-sm text-muted" role="status" aria-live="polite">Loading trip</p>
      </Container>
    );
  }

  if (error || !initialValues) {
    return (
      <Container width="form" className="py-16">
        <Alert>{error || 'Trip not found'}</Alert>
        <Link to="/dashboard" className="mt-4 inline-flex text-sm text-accent">
          Back to dashboard
        </Link>
      </Container>
    );
  }

  return (
    <TripWizard
      key={id}
      initialValues={initialValues}
      originalStartDate={originalStartDate}
      eyebrow="Edit itinerary"
      title="Edit your trip"
      description="Change the details. Gemini will rewrite the days and keep this trip in place."
      submitLabel="Update itinerary"
      onSubmit={handleSubmit}
    />
  );
};

export default EditTrip;

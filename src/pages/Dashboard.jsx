import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { FaMapMarkedAlt } from 'react-icons/fa';
import { Alert, Button, Container, EmptyState, PageIntro, Skeleton } from '../components/ui';
import TripCard from '../components/TripCard';
import { greetingForNow } from '../utils/dates';
import { pickTravelImage } from '../utils/destinationImages';
import { usePageTitle } from '../hooks/usePageTitle';

const tripTime = (trip) => {
  const value = trip.createdAt;
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  return 0;
};

const Dashboard = () => {
  usePageTitle('My trips');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitSeed] = useState(() => pickTravelImage().url);
  const firstName = auth.currentUser?.displayName?.split(' ')[0] || 'traveler';

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }

        const userId = auth.currentUser.uid;
        const tripsRef = collection(db, 'trips');
        const q = query(tripsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const tripsData = querySnapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
          .sort((a, b) => tripTime(b) - tripTime(a));

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

  return (
    <Container className="py-12 sm:py-16">
      <PageIntro
        eyebrow="Your trips"
        title={`${greetingForNow()}, ${firstName}.`}
        description="A quiet place for every itinerary Explore X has planned for you."
        action={<Button to="/create-trip">Plan new trip</Button>}
      />

      {error && <Alert>{error}</Alert>}

      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
          {[0, 1, 2].map((item) => (
            <div key={item} className="overflow-hidden rounded-xl border border-line bg-surface">
              <Skeleton className="h-48 rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <EmptyState
          icon={FaMapMarkedAlt}
          title="No trips yet"
          body="Start with a destination and a few preferences. Explore X will draft the days."
          action={<Button to="/create-trip">Plan your first trip</Button>}
        />
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} visitSeed={visitSeed} />
          ))}
        </div>
      )}
    </Container>
  );
};

export default Dashboard;

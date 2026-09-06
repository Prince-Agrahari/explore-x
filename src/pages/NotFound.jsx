import { Button, Container } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';

const NotFound = () => {
  usePageTitle('Page not found');

  return (
    <Container width="form" className="py-20 text-center sm:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">This page is not on the itinerary.</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        Explore X cannot find that route. Head home or start planning a trip.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/">Back home</Button>
        <Button to="/create-trip" variant="secondary">Plan my trip</Button>
      </div>
    </Container>
  );
};

export default NotFound;

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Eyebrow, Section } from '../components/ui';
import SampleItineraryCard from '../components/SampleItineraryCard';
import SafeImage from '../components/SafeImage';
import { pickTravelImage } from '../utils/destinationImages';
import { usePageTitle } from '../hooks/usePageTitle';

const SAMPLE_CARD_IMAGE = {
  url: '/images/travel/munnar.jpg',
  alt: 'Tea hills in Munnar',
};

const steps = [
  {
    n: '01',
    title: 'Tell us where you are going',
    body: 'Choose a destination and dates. That becomes the spine of the trip.',
    image: { url: '/images/travel/goa.jpg', alt: 'Coastline in Goa' },
  },
  {
    n: '02',
    title: 'Set budget and taste',
    body: 'Share what you can spend, who is traveling, and what you want more of.',
    image: { url: '/images/travel/jaipur.jpg', alt: 'Palace architecture in Jaipur' },
  },
  {
    n: '03',
    title: 'Receive a day-by-day plan',
    body: 'Gemini drafts mornings, afternoons and evenings with costs, stays and notes.',
    image: { url: '/images/travel/kerala.jpg', alt: 'Backwaters in Kerala' },
  },
];

const reasons = [
  { title: 'Budget-aware planning', body: 'Every day is written against your spend, in Indian rupees.' },
  { title: 'Personalized interests', body: 'Food, hills, heritage or the sea — the plan follows what you asked for.' },
  { title: 'Day-by-day itinerary', body: 'Morning, afternoon and evening, instead of a loose list of ideas.' },
  { title: 'AI-generated recommendations', body: 'Gemini proposes stays, meals and notes you can keep or ignore.' },
  { title: 'Less planning effort', body: 'One form instead of a week of tabs, chats and half-saved maps.' },
  { title: 'Everything in one place', body: 'Save the trip, reopen it, and share a plan that already has costs.' },
];

const destinations = [
  { name: 'Goa', url: '/images/travel/goa.jpg', alt: 'Beaches in Goa' },
  { name: 'Kerala', url: '/images/travel/kerala.jpg', alt: 'Backwaters in Kerala' },
  { name: 'Ladakh', url: '/images/travel/ladakh.jpg', alt: 'Mountains in Ladakh' },
  { name: 'Kashmir', url: '/images/travel/kashmir.jpg', alt: 'Valleys in Kashmir' },
  { name: 'Rajasthan', url: '/images/travel/udaipur.jpg', alt: 'Lakeside palace in Udaipur' },
  { name: 'Sikkim', url: '/images/travel/sikkim.jpg', alt: 'Hills in Sikkim' },
  { name: 'Meghalaya', url: '/images/travel/meghalaya.jpg', alt: 'Hills in Meghalaya' },
  { name: 'Varanasi', url: '/images/travel/varanasi.jpg', alt: 'Ghats in Varanasi' },
];

const aiFlow = ['Your preferences', 'Explore X', 'Gemini AI', 'Personalized itinerary'];

const Reveal = ({ children, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  );
};

const Home = () => {
  usePageTitle();
  const [hero] = useState(() => pickTravelImage());

  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden bg-ink">
        <SafeImage
          src={hero.url}
          alt={hero.alt}
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
        <Container width="wide" className="relative flex min-h-[88vh] items-center py-20">
          <div className="max-w-2xl text-white">
            <p className="text-xs uppercase tracking-[0.22em] text-white/70">Your AI Travel Planner</p>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] sm:text-7xl">
              Plan less.
              <br />
              Travel more.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/80">
              Your personal AI travel planner that turns your destination, budget and interests into a
              personalized day-by-day itinerary.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button to="/create-trip">Plan my trip</Button>
              <Button href="#how-it-works" variant="ghost" className="border-white/30 bg-white text-ink">
                See how it works
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Section id="how-it-works" className="border-b border-line">
        <Container>
          <Reveal>
            <Eyebrow>How Explore X works</Eyebrow>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
              Three steps from a blank calendar to a usable plan.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.n} className={`delay-${index}`}>
                <article className="editorial-step group">
                  <div className="img-zoom aspect-[5/3] overflow-hidden rounded-sm">
                    <SafeImage src={step.image.url} alt={step.image.alt} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-5 font-display text-4xl text-accent">{step.n}</p>
                  <h3 className="mt-3 font-display text-2xl leading-snug">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{step.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="demo" className="border-b border-line bg-surface">
        <Container>
          <Reveal className="mx-auto max-w-xl">
            <Eyebrow>See a trip</Eyebrow>
            <SampleItineraryCard image={SAMPLE_CARD_IMAGE} className="mt-6" />
            <p className="mt-6 text-center text-sm leading-7 text-muted">
              Tell Explore X what you want — destination, dates, budget in ₹, and interests — and the AI creates
              your trip in this same day-by-day shape.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-b border-line">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <Reveal>
              <Eyebrow>Why travelers use it</Eyebrow>
              <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
                A command center, not a pile of tabs.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-muted">
                Budget and interests are first-class inputs, not afterthoughts. The trip lives in one place —
                ready to open again, share, or take on the road.
              </p>
            </Reveal>
            <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
              {reasons.map((reason, index) => (
                <Reveal key={reason.title} className={`delay-${index % 3}`}>
                  <article className="reason-cell bg-canvas p-6">
                    <p className="text-xs uppercase tracking-[0.16em] text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-3 font-display text-2xl leading-snug">{reason.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{reason.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-b border-line bg-surface">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <Eyebrow>How the AI plans</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Gemini writes the itinerary. You keep the decisions.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted">
              Explore X sends your destination, dates, budget and interests to Gemini, then returns structured
              days — not a chat transcript you have to decode later.
            </p>
          </Reveal>
          <Reveal className="mt-12">
            <ol className="ai-flow">
              {aiFlow.map((label, index) => (
                <li key={label} className="ai-flow-step">
                  <span className="ai-flow-label">{label}</span>
                  {index < aiFlow.length - 1 ? <span className="ai-flow-arrow" aria-hidden="true" /> : null}
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-b border-line">
        <Container>
          <Reveal>
            <Eyebrow>Across India</Eyebrow>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
              Built for the trips Indians actually take.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Coast, hills, desert, ghats — pick a place you already want, or let the planner start from a
              budget and a handful of interests.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <Link to="/create-trip" className="destination-feature group">
                <div className="img-zoom aspect-[16/10] overflow-hidden rounded-sm">
                  <SafeImage src={destinations[2].url} alt={destinations[2].alt} className="h-full w-full object-cover" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-accent">Featured</p>
                    <h3 className="mt-1 font-display text-3xl">{destinations[2].name}</h3>
                  </div>
                  <span className="text-sm text-muted">Plan this trip →</span>
                </div>
              </Link>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
              {destinations.filter((_, i) => i !== 2).slice(0, 4).map((place, index) => (
                <Reveal key={place.name} className={`delay-${index}`}>
                  <Link to="/create-trip" className="destination-tile group">
                    <div className="img-zoom aspect-[4/3] overflow-hidden rounded-sm">
                      <SafeImage src={place.url} alt={place.alt} className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink">{place.name}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.16em] text-muted">
            {destinations.slice(5).map((place) => (
              <span key={place.name}>{place.name}</span>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ink text-white">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <Eyebrow className="text-white/55">Start planning</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">Your next trip starts here.</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/70">
              Tell us where you want to go, what you want to spend, and what you love. Explore X will build the
              plan.
            </p>
            <div className="mt-10">
              <Button to="/create-trip">Plan my trip</Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </div>
  );
};

export default Home;

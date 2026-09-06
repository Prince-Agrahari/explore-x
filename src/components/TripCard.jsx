import { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaEllipsisH } from 'react-icons/fa';
import { calculateDuration, formatShortDate } from '../utils/dates';
import { formatINR } from '../utils/currency';
import { getDestinationImage } from '../utils/destinationImages';
import SafeImage from './SafeImage';

const TripCard = ({ trip, visitSeed }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const image = getDestinationImage(trip.destination, trip.coverImage, visitSeed);
  const nights = calculateDuration(trip.startDate, trip.endDate);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  return (
    <article className="group overflow-hidden rounded-xl border border-line bg-surface shadow-card transition duration-200 md:hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={`/trips/${trip.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <SafeImage
            src={image}
            alt={`${trip.destination} itinerary`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-ink/70 px-4 py-3">
            <h2 className="font-display text-2xl text-white">{trip.destination}</h2>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-muted">
            <FaCalendarAlt aria-hidden="true" />
            <span>
              {formatShortDate(trip.startDate)} – {formatShortDate(trip.endDate)}
            </span>
          </p>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label={`Actions for ${trip.destination}`}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-md p-1.5 text-muted hover:bg-sand hover:text-ink"
            >
              <FaEllipsisH aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-line bg-surface py-1 shadow-card" role="menu">
                <Link to={`/trips/${trip.id}`} role="menuitem" className="block px-3 py-2 text-sm text-ink hover:bg-sand">
                  View details
                </Link>
                <Link to={`/trips/${trip.id}/edit`} role="menuitem" className="block px-3 py-2 text-sm text-ink hover:bg-sand">
                  Edit trip
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-ink">
          {nights} days · {formatINR(trip.budget)} budget
        </p>

        {trip.interests?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {trip.interests.slice(0, 3).map((interest) => (
              <span key={interest} className="rounded-md bg-sand px-2 py-1 text-xs text-muted">
                {interest}
              </span>
            ))}
          </div>
        )}

        <Link
          to={`/trips/${trip.id}`}
          className="mt-5 inline-flex text-sm font-medium text-accent hover:text-accent-dark"
        >
          View itinerary
        </Link>
      </div>
    </article>
  );
};

export default memo(TripCard);

import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-canvas">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-ink">Explore X</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-accent">Your AI Travel Planner</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
            Turn a destination, budget and interests into a day-by-day itinerary you can actually use.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Product</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/" className="text-ink hover:text-accent">
                Home
              </Link>
            </li>
            <li>
              <a href="/#how-it-works" className="text-ink hover:text-accent">
                How it works
              </a>
            </li>
            <li>
              <a href="/#demo" className="text-ink hover:text-accent">
                Demo
              </a>
            </li>
            <li>
              <Link to="/create-trip" className="text-ink hover:text-accent">
                Plan a trip
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="text-ink hover:text-accent">
                My trips
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Account</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/login" className="text-ink hover:text-accent">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/signup" className="text-ink hover:text-accent">
                Sign up
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-ink hover:text-accent">
                Profile
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-5 text-sm text-muted sm:px-6">
          © {currentYear} Explore X. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

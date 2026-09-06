import SafeImage from './SafeImage';

const SampleItineraryCard = ({ image, className = '' }) => (
  <aside className={`overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-lift ${className}`}>
    <SafeImage src={image.url} alt={image.alt} className="h-48 w-full object-cover" />
    <div className="p-6">
      <p className="text-xs uppercase tracking-[0.16em] text-accent">Sample itinerary</p>
      <h2 className="mt-2 font-display text-3xl">Munnar, 4 days</h2>
      <p className="mt-2 text-sm text-muted">Hills · Tea · Nature · ₹75,000</p>
      <ol className="mt-6 space-y-3 text-sm">
        <li className="border-b border-line pb-3">
          <span className="text-muted">Day 1 · Morning</span>
          <p className="mt-1 text-ink">Tea estate walk above town while the mist is still lifting.</p>
        </li>
        <li className="border-b border-line pb-3">
          <span className="text-muted">Day 1 · Afternoon</span>
          <p className="mt-1 text-ink">Eravikulam viewpoints, then a quiet drive through the cardamom hills.</p>
        </li>
        <li>
          <span className="text-muted">Day 1 · Evening</span>
          <p className="mt-1 text-ink">Homestay dinner, with the day’s costs already in the plan.</p>
        </li>
      </ol>
    </div>
  </aside>
);

export default SampleItineraryCard;

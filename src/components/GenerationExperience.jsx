import { useEffect, useState } from 'react';

const STAGES = [
  'Understanding your destination',
  'Personalizing your trip',
  'Building your itinerary',
  'Estimating costs',
  'Finalizing recommendations',
];

const GenerationExperience = ({ destination }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((current) => (current < STAGES.length - 1 ? current + 1 : current));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-line bg-surface px-6 py-14 text-center shadow-card sm:px-10">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Explore X is planning</p>
      <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
        Designing {destination || 'your trip'}
      </h2>
      <p className="mt-3 text-muted">
        Gemini is assembling a day-by-day itinerary from your dates, budget and interests.
      </p>

      <div className="mx-auto mt-10 max-w-sm text-left">
        {STAGES.map((label, index) => {
          const state = index < stage ? 'done' : index === stage ? 'active' : 'todo';
          return (
            <div key={label} className="flex items-start gap-3 py-2.5">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  state === 'todo'
                    ? 'border-line text-transparent'
                    : 'border-accent bg-accent text-white'
                }`}
                aria-hidden="true"
              >
                {state === 'done' ? '•' : ''}
              </span>
              <p className={state === 'todo' ? 'text-muted' : 'text-ink'}>
                {label}
                {state === 'active' && <span className="sr-only"> in progress</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenerationExperience;

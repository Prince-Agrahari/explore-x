import { cn } from '../utils/cn';

const STEPS = [
  { n: 1, label: 'Destination' },
  { n: 2, label: 'Preferences' },
  { n: 3, label: 'Details' },
];

const WizardProgress = ({ current }) => (
  <ol className="mb-10 grid grid-cols-3 gap-3" aria-label="Trip planning steps">
    {STEPS.map((step, index) => {
      const done = current > step.n;
      const active = current === step.n;
      return (
        <li key={step.n} className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
                done || active ? 'bg-accent text-white' : 'border border-line bg-surface text-muted'
              )}
            >
              {step.n}
            </span>
            <span className={cn('truncate text-sm', active ? 'font-medium text-ink' : 'text-muted')}>
              {step.label}
            </span>
          </div>
          <div className="mt-3 h-px bg-line">
            <div
              className="h-px bg-accent transition-all duration-300"
              style={{ width: done ? '100%' : active ? '40%' : index === 0 && current === 1 ? '10%' : '0%' }}
            />
          </div>
        </li>
      );
    })}
  </ol>
);

export default WizardProgress;

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

export function Section({ children, className = '', ...props }) {
  return (
    <section className={cn('py-20 sm:py-24', className)} {...props}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className = '' }) {
  return (
    <p className={cn('text-xs font-medium uppercase tracking-[0.18em] text-accent', className)}>
      {children}
    </p>
  );
}

export function Container({ children, className = '', width = 'default' }) {
  const widths = {
    narrow: 'max-w-xl',
    form: 'max-w-3xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
  };

  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6', widths[width], className)}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  to,
  href,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-dark',
    secondary: 'border border-line bg-surface text-ink hover:border-ink',
    ghost: 'bg-transparent text-ink hover:bg-sand',
    inverse: 'bg-surface text-ink hover:bg-sand',
    danger: 'bg-red-800 text-white hover:bg-red-900',
  };
  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };
  const cls = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-tight transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className
  );

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}

export function Field({
  id,
  label,
  hint,
  icon: Icon,
  as = 'input',
  className = '',
  children,
  ...props
}) {
  const Control = as;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
            <Icon aria-hidden="true" />
          </div>
        )}
        {as === 'select' ? (
          <select
            id={id}
            aria-describedby={hint && id ? `${id}-hint` : undefined}
            className={cn(
              'w-full min-w-0 rounded-lg border border-line bg-surface py-2.5 text-ink',
              'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
              Icon ? 'pl-10 pr-3.5' : 'px-3.5'
            )}
            {...props}
          >
            {children}
          </select>
        ) : (
          <Control
            id={id}
            aria-describedby={hint && id ? `${id}-hint` : undefined}
            className={cn(
              'w-full min-w-0 rounded-lg border border-line bg-surface text-ink placeholder:text-muted/70',
              'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
              as === 'textarea' ? 'min-h-28 px-3.5 py-3' : 'py-2.5',
              Icon ? 'pl-10 pr-3.5' : 'px-3.5'
            )}
            {...props}
          />
        )}
      </div>
        {hint && (
          <p id={id ? `${id}-hint` : undefined} className="mt-1.5 text-sm text-muted">
            {hint}
          </p>
        )}
    </div>
  );
}

export function Alert({ tone = 'error', children }) {
  const tones = {
    error: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    info: 'border-line bg-sand text-ink',
  };

  return (
    <div role="alert" className={cn('rounded-lg border px-4 py-3 text-sm', tones[tone])}>
      {children}
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-lift"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="font-display text-2xl text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted hover:bg-sand hover:text-ink"
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>
        <div className="mt-3 text-muted">{children}</div>
      </div>
    </div>
  );
}

export function Chip({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        active
          ? 'border-accent bg-accent text-white'
          : 'border-line bg-surface text-ink hover:border-ink'
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-6 py-16 text-center shadow-card">
      {Icon && (
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-accent">
          <Icon className="text-2xl" aria-hidden="true" />
        </div>
      )}
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{body}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={cn('animate-pulse rounded-lg bg-sand', className)} />;
}

export function PageIntro({ eyebrow, title, description, action }) {
  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl text-ink sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

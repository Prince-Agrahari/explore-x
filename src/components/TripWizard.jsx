import { useState } from 'react';
import { FaCalendarAlt, FaMapMarkedAlt, FaRupeeSign, FaUserFriends } from 'react-icons/fa';
import { Alert, Button, Chip, Container, Field } from './ui';
import WizardProgress from './WizardProgress';
import GenerationExperience from './GenerationExperience';
import { formatShortDate } from '../utils/dates';
import { formatINR } from '../utils/currency';
import {
  ACCOMMODATION_TYPES,
  INTERESTS,
  TRANSPORTATION_TYPES,
  minStartDate,
  validateStep1,
  validateStep2,
} from '../utils/tripForm';

const TripWizard = ({
  initialValues,
  originalStartDate,
  eyebrow,
  title,
  description,
  submitLabel,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interest) => {
    setFormData((prev) => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter((item) => item !== interest) };
      }
      if (prev.interests.length < 5) {
        return { ...prev, interests: [...prev.interests, interest] };
      }
      return prev;
    });
  };

  const nextStep = () => {
    const validationError = step === 1
      ? validateStep1(formData, { originalStartDate })
      : validateStep2(formData);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to save this trip. Please try again later.');
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <Container width="form" className="py-16">
        <GenerationExperience destination={formData.destination} />
      </Container>
    );
  }

  return (
    <Container width="form" className="py-12 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl text-ink">{title}</h1>
      <p className="mt-3 text-muted">{description}</p>

      <div className="mt-10 rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <WizardProgress current={step} />

        {error && (
          <div className="mb-6">
            <Alert>{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl text-ink">Where are you going?</h2>
                <p className="mt-2 text-sm text-muted">Use a city or region. Dates should match when you actually travel.</p>
              </div>
              <Field
                id="destination"
                name="destination"
                label="Destination"
                icon={FaMapMarkedAlt}
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g. Lisbon, Portugal"
                required
              />
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  id="startDate"
                  name="startDate"
                  type="date"
                  label="Start date"
                  icon={FaCalendarAlt}
                  value={formData.startDate}
                  onChange={handleChange}
                  min={minStartDate(originalStartDate)}
                  required
                />
                <Field
                  id="endDate"
                  name="endDate"
                  type="date"
                  label="End date"
                  icon={FaCalendarAlt}
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || minStartDate(originalStartDate)}
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl text-ink">How do you like to travel?</h2>
                <p className="mt-2 text-sm text-muted">Budget is for the whole trip. Choose up to five interests.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  id="budget"
                  name="budget"
                  type="number"
                  label="Total budget (INR)"
                  icon={FaRupeeSign}
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="150000"
                  min="1"
                  required
                />
                <Field
                  id="travelers"
                  name="travelers"
                  type="number"
                  label="Travelers"
                  icon={FaUserFriends}
                  value={formData.travelers}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <Chip
                      key={interest}
                      active={formData.interests.includes(interest)}
                      onClick={() => handleInterestChange(interest)}
                    >
                      {interest}
                    </Chip>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted">Selected {formData.interests.length}/5</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl text-ink">Stay, move, and notes</h2>
                <p className="mt-2 text-sm text-muted">These shape the recommendations. Notes are optional.</p>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Accommodation</p>
                <div className="flex flex-wrap gap-2">
                  {ACCOMMODATION_TYPES.map((type) => (
                    <Chip
                      key={type}
                      active={formData.accommodationType === type}
                      onClick={() => setFormData((prev) => ({ ...prev, accommodationType: type }))}
                    >
                      {type}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Transportation</p>
                <div className="flex flex-wrap gap-2">
                  {TRANSPORTATION_TYPES.map((type) => (
                    <Chip
                      key={type}
                      active={formData.transportationType === type}
                      onClick={() => setFormData((prev) => ({ ...prev, transportationType: type }))}
                    >
                      {type}
                    </Chip>
                  ))}
                </div>
              </div>
              <Field
                id="notes"
                name="notes"
                as="textarea"
                label="Notes"
                hint="Dietary needs, pace, or neighborhoods you want to stay near."
                value={formData.notes}
                onChange={handleChange}
                placeholder="We prefer walkable neighborhoods and one quieter day mid-trip."
              />
              <div className="rounded-lg border border-line bg-canvas p-4 text-sm">
                <p className="font-medium text-ink">Trip summary</p>
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-muted">Destination</dt>
                    <dd>{formData.destination}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Dates</dt>
                    <dd>
                      {formatShortDate(formData.startDate)} – {formatShortDate(formData.endDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Budget</dt>
                    <dd>{formatINR(formData.budget)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Travelers</dt>
                    <dd>{formData.travelers}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted">Interests</dt>
                    <dd>{formData.interests.join(', ')}</dd>
                  </div>
                </dl>
              </div>
              <Button type="submit" className="w-full" size="lg">
                {submitLabel}
              </Button>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <Button variant="secondary" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <span />
            )}
            {step < 3 && (
              <Button onClick={nextStep}>
                Next
              </Button>
            )}
          </div>
        </form>
      </div>
    </Container>
  );
};

export default TripWizard;

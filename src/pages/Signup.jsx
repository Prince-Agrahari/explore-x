import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { Alert, Button, Field } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';
import SafeImage from '../components/SafeImage';
import { AUTH_PANEL_IMAGE } from '../utils/destinationImages';

const Signup = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  usePageTitle('Sign up');

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName,
        email,
        createdAt: new Date(),
        trips: []
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Email signup error:', err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Email is already in use. Please try a different email or log in.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address. Please check your email and try again.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password.');
          break;
        default:
          setError('Unable to create your account. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        displayName: user.displayName,
        email: user.email,
        createdAt: new Date(),
        trips: []
      }, { merge: true });

      navigate('/dashboard');
    } catch (err) {
      console.error('Google signup error:', err);

      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please enable popups for this site.');
      } else {
        setError('Unable to sign up with Google. Please try again.');
      }

      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <SafeImage src={AUTH_PANEL_IMAGE} alt="Kashmir valley" priority className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <p className="font-display text-4xl">Create an account. Keep every itinerary in one place.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Get started</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Create your account</h1>
          <p className="mt-3 text-muted">Free to join. Your trips stay private to you.</p>

          {error && (
            <div className="mt-6">
              <Alert>{error}</Alert>
            </div>
          )}

          <form onSubmit={handleEmailSignup} className="mt-8 space-y-5">
            <Field
              id="displayName"
              label="Full name"
              type="text"
              icon={FaUser}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jordan Lee"
              autoComplete="name"
              required
            />
            <Field
              id="email"
              label="Email"
              type="email"
              icon={FaEnvelope}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Field
              id="password"
              label="Password"
              type="password"
              icon={FaLock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
            />
            <Field
              id="confirmPassword"
              label="Confirm password"
              type="password"
              icon={FaLock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.14em] text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button variant="secondary" onClick={handleGoogleSignup} disabled={loading} className="w-full">
            Continue with Google
          </Button>

          <p className="mt-8 text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent hover:text-accent-dark">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

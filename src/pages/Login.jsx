import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { Alert, Button, Field } from '../components/ui';
import SafeImage from '../components/SafeImage';
import { AUTH_PANEL_IMAGE } from '../utils/destinationImages';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = location.state?.from?.pathname || '/dashboard';
  usePageTitle('Log in');

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
              displayName: user.displayName,
              email: user.email,
              createdAt: new Date(),
              trips: []
            });
          }

          navigate(nextPath, { replace: true });
        }
      } catch (err) {
        console.error('Redirect result error:', err);
        setError('Unable to finish signing in. Please try again.');
      }
    };

    checkRedirectResult();
  }, [navigate, nextPath]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(nextPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up first.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        default:
          setError('Unable to log in. Check your details and try again.');
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            displayName: user.displayName,
            email: user.email,
            createdAt: new Date(),
            trips: []
          });
        }

        navigate(nextPath, { replace: true });
      } catch (popupError) {
        console.error('Popup error:', popupError);

        if (popupError.code === 'auth/popup-blocked') {
          setError('Popup was blocked. Redirecting to Google sign-in page...');
          setTimeout(() => {
            signInWithRedirect(auth, provider);
          }, 1500);
        } else {
          throw popupError;
        }
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Unable to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <SafeImage src={AUTH_PANEL_IMAGE} alt="Kashmir valley" priority className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <p className="font-display text-4xl">Pick up the trip you already started thinking about.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Welcome back</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Log in to Explore X</h1>
          <p className="mt-3 text-muted">Open your saved itineraries or plan the next one.</p>

          {error && (
            <div className="mt-6">
              <Alert>{error}</Alert>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="mt-8 space-y-5">
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
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.14em] text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button variant="secondary" onClick={handleGoogleLogin} disabled={loading} className="w-full">
            Continue with Google
          </Button>

          <p className="mt-8 text-sm text-muted">
            Don’t have an account?{' '}
            <Link to="/signup" className="font-medium text-accent hover:text-accent-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

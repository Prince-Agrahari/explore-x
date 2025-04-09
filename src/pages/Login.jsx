import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for redirect result on component mount
  useState(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // User successfully signed in after redirect
          const user = result.user;
          
          // Check if user document already exists in Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          // If the user document doesn't exist, create it
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
              displayName: user.displayName,
              email: user.email,
              createdAt: new Date(),
              trips: []
            });
          }
          
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Redirect result error:', err);
        setError(`Authentication error: ${err.message}`);
      }
    };
    
    checkRedirectResult();
  }, [navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
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
          setError(`Failed to log in: ${err.message}`);
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      // Configure Google provider with prompt parameter
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      try {
        // First try with popup
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user document already exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        // If the user document doesn't exist, create it
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            displayName: user.displayName,
            email: user.email,
            createdAt: new Date(),
            trips: []
          });
        }
        
        navigate('/dashboard');
      } catch (popupError) {
        console.error('Popup error:', popupError);
        
        // If popup is blocked, try redirect method instead
        if (popupError.code === 'auth/popup-blocked') {
          setError('Popup was blocked. Redirecting to Google sign-in page...');
          
          // Wait a moment before redirecting to allow the error message to be seen
          setTimeout(() => {
            signInWithRedirect(auth, provider);
          }, 1500);
        } else {
          throw popupError; // Re-throw if it's not a popup blocked error
        }
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(`Failed to sign in with Google: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleEmailLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      
      <div className="my-4 flex items-center justify-between">
        <span className="border-b w-1/5 md:w-1/4"></span>
        <span className="text-xs text-gray-500 uppercase">or login with</span>
        <span className="border-b w-1/5 md:w-1/4"></span>
      </div>
      
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex justify-center items-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75"
      >
        <FaGoogle className="text-red-500 mr-2" />
        Continue with Google
      </button>
      
      <p className="mt-8 text-sm text-center text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login; 
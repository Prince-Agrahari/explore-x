import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateTrip = lazy(() => import('./pages/CreateTrip'));
const EditTrip = lazy(() => import('./pages/EditTrip'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
    <p className="text-sm text-muted">Loading Explore X</p>
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [authIsReady, setAuthIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      {authIsReady ? (
        <BrowserRouter>
          <Navbar user={user} />
          <main id="main-content" className="flex-1">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
                <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute user={user}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-trip"
                  element={
                    <ProtectedRoute user={user}>
                      <CreateTrip />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trips/:id"
                  element={
                    <ProtectedRoute user={user}>
                      <TripDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trips/:id/edit"
                  element={
                    <ProtectedRoute user={user}>
                      <EditTrip />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute user={user}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </BrowserRouter>
      ) : (
        <div className="flex flex-1 items-center justify-center" role="status" aria-live="polite">
          <p className="text-sm text-muted">Loading Explore X</p>
        </div>
      )}
    </div>
  );
};

export default App;

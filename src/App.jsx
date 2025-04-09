import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import Profile from './pages/Profile';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [user, setUser] = useState(null);
  const [authIsReady, setAuthIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {authIsReady && (
        <BrowserRouter>
          <Navbar user={user} />
          <div className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
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
                path="/profile" 
                element={
                  <ProtectedRoute user={user}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
          <Footer />
        </BrowserRouter>
      )}
    </div>
  );
};

export default App;
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { FaUser, FaEnvelope, FaLock, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError('You must be logged in to view this page');
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          setFormData({
            ...formData,
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const currentUser = auth.currentUser;
      let updatesMade = false;
      
      // Update display name if changed
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: formData.displayName });
        await updateDoc(doc(db, 'users', currentUser.uid), { displayName: formData.displayName });
        updatesMade = true;
      }
      
      // Verify and update email if changed
      if (formData.email !== currentUser.email) {
        if (!formData.currentPassword) {
          setError('Current password is required to change email');
          return;
        }
        
        try {
          const credential = EmailAuthProvider.credential(currentUser.email, formData.currentPassword);
          await reauthenticateWithCredential(currentUser, credential);
          await updateEmail(currentUser, formData.email);
          await updateDoc(doc(db, 'users', currentUser.uid), { email: formData.email });
          updatesMade = true;
        } catch (err) {
          if (err.code === 'auth/wrong-password') {
            setError('Incorrect current password');
          } else if (err.code === 'auth/email-already-in-use') {
            setError('Email is already in use by another account');
          } else {
            setError('Failed to update email. Please try again later.');
          }
          return;
        }
      }
      
      // Update password if provided
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setError('Current password is required to set a new password');
          return;
        }
        
        if (formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters long');
          return;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        
        try {
          const credential = EmailAuthProvider.credential(currentUser.email, formData.currentPassword);
          await reauthenticateWithCredential(currentUser, credential);
          await updatePassword(currentUser, formData.newPassword);
          updatesMade = true;
          
          // Clear password fields after update
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }));
        } catch (err) {
          if (err.code === 'auth/wrong-password') {
            setError('Incorrect current password');
          } else {
            setError('Failed to update password. Please try again later.');
          }
          return;
        }
      }
      
      if (updatesMade) {
        setSuccess('Profile updated successfully');
      } else {
        setSuccess('No changes were made');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-12 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
              <FaCheck className="mr-2" />
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-gray-700 mb-2">Display Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>
              
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={passwordVisible ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Current Password"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Required to change email or password
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={passwordVisible ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="New Password"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={passwordVisible ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm New Password"
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  id="showPassword"
                  name="showPassword"
                  type="checkbox"
                  checked={passwordVisible}
                  onChange={() => setPasswordVisible(!passwordVisible)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showPassword" className="ml-2 block text-sm text-gray-700">
                  Show password
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { Alert, Button, Container, Field } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';

const Profile = () => {
  usePageTitle('Profile');
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
          setFormData((prev) => ({
            ...prev,
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
          }));
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const currentUser = auth.currentUser;
      let updatesMade = false;

      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: formData.displayName });
        await updateDoc(doc(db, 'users', currentUser.uid), { displayName: formData.displayName });
        updatesMade = true;
      }

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
          setFormData((prev) => ({
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
      <div className="flex min-h-[50vh] items-center justify-center" role="status">
        <p className="text-sm text-muted">Loading profile</p>
      </div>
    );
  }

  return (
    <Container width="form" className="py-12 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Account</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Profile settings</h1>
      <p className="mt-3 text-muted">
        {user?.email || formData.email} · Update how you appear in Explore X.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        {error && <Alert>{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        <section className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <h2 className="font-display text-2xl text-ink">Profile</h2>
          <p className="mt-2 text-sm text-muted">This name appears in your dashboard greeting.</p>
          <div className="mt-6 space-y-5">
            <Field
              id="displayName"
              name="displayName"
              label="Display name"
              icon={FaUser}
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="name"
            />
            <Field
              id="email"
              name="email"
              type="email"
              label="Email address"
              icon={FaEnvelope}
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <h2 className="font-display text-2xl text-ink">Password</h2>
          <p className="mt-2 text-sm text-muted">Required when changing email or setting a new password.</p>
          <div className="mt-6 space-y-5">
            <Field
              id="currentPassword"
              name="currentPassword"
              type={passwordVisible ? 'text' : 'password'}
              label="Current password"
              icon={FaLock}
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Current password"
              hint="Leave blank if you are only updating your name."
            />
            <Field
              id="newPassword"
              name="newPassword"
              type={passwordVisible ? 'text' : 'password'}
              label="New password"
              icon={FaLock}
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="New password"
            />
            <Field
              id="confirmPassword"
              name="confirmPassword"
              type={passwordVisible ? 'text' : 'password'}
              label="Confirm new password"
              icon={FaLock}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                id="showPassword"
                type="checkbox"
                checked={passwordVisible}
                onChange={() => setPasswordVisible(!passwordVisible)}
                className="h-4 w-4 accent-accent"
              />
              Show password
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Container>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FarmerProfile.css';

function FarmerProfile({ profile, fetchProfile }) { // Assuming you have a function to refetch profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    farmerLocation: '',
    additionalInfo: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        userName: profile.userName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        farmerLocation: profile.farmerLocation || '',
        additionalInfo: profile.additionalInfo || '',
      });
      setError(null);
    } else {
      setError('No profile data available.');
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage('Profile updated successfully.');
      setIsEditingProfile(false);
      if (fetchProfile) {
        fetchProfile(); // Refetch the profile to update the displayed data
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/user/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswordSuccess('Password changed successfully.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setIsChangingPassword(false);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    // Optionally reset form data to the profile values
    if (profile) {
      setFormData({
        userName: profile.userName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        farmerLocation: profile.farmerLocation || '',
        additionalInfo: profile.additionalInfo || '',
      });
    }
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="farmer-profile-container">
      <h2>My Profile</h2>
      {!isEditingProfile && !isChangingPassword && (
        <div className="farmer-profile-data">
          <p><strong>Name:</strong> {formData.userName}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Phone Number:</strong> {formData.phoneNumber}</p>
          <p><strong>Location:</strong> {formData.farmerLocation}</p>
          <p><strong>Additional Info:</strong> {formData.additionalInfo}</p>
          <div className="farmer-profile-buttons">
            <button onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
            <button onClick={() => setIsChangingPassword(true)}>Change Password</button>
          </div>
        </div>
      )}

      {isEditingProfile && (
        <form onSubmit={handleSubmit} className="farmer-profile-form">
          {successMessage && <p className="success-message">{successMessage}</p>}
          {error && <p className="error-message">{error}</p>}
          <div>
            <label>Name:</label><br />
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email:</label><br />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Phone Number:</label><br />
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              pattern="\d{10}"
              title="Phone number must be 10 digits"
            />
          </div>
          <div>
            <label>Location:</label><br />
            <input
              type="text"
              name="farmerLocation"
              value={formData.farmerLocation}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Additional Info:</label><br />
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
          <button type="button" className="cancel-button" onClick={handleCancelEdit}>
            Cancel
          </button>
        </form>
      )}

      {isChangingPassword && (
        <form onSubmit={handlePasswordSubmit} className="farmer-profile-form">
          {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
          {passwordError && <p className="error-message">{passwordError}</p>}
          <div>
            <label>Current Password:</label><br />
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div>
            <label>New Password:</label><br />
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div>
            <label>Confirm New Password:</label><br />
            <input
              type="password"
              name="confirmNewPassword"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit" disabled={passwordLoading}>
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
          <button type="button" className="cancel-button" onClick={handleCancelPasswordChange}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default FarmerProfile;
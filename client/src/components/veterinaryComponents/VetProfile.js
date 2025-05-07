import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VetProfile.css';

function VetProfile({ profile, fetchProfile }) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    vetId: '',
    userName: '',
    specialization: '',
    areaOfExpertise: '',
    email: '',
    phoneNumber: '',
    vetLocation: '',
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
        vetId: profile.vetId || '',
        userName: profile.userName || '',
        specialization: profile.specialization || '',
        areaOfExpertise: profile.areaOfExpertise || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        vetLocation: profile.vetLocation || '',
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
        fetchProfile();
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
    if (profile) {
      setFormData({
        vetId: profile.vetId || '',
        userName: profile.userName || '',
        specialization: profile.specialization || '',
        areaOfExpertise: profile.areaOfExpertise || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        vetLocation: profile.vetLocation || '',
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
    <div className="vet-profile-container">
      <h2>My Profile</h2>
      {!isEditingProfile && !isChangingPassword && (
        <div className="vet-profile-data">
          <p><strong>Veterinarian ID:</strong> {formData.vetId}</p>
          <p><strong>Name:</strong> {formData.userName}</p>
          <p><strong>Specialization:</strong> {formData.specialization}</p>
          <p><strong>Area of Expertise:</strong> {formData.areaOfExpertise}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Phone Number:</strong> {formData.phoneNumber}</p>
          <p><strong>Location:</strong> {formData.vetLocation}</p>
          <div className="vet-profile-buttons">
            <button onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
            <button onClick={() => setIsChangingPassword(true)}>Change Password</button>
          </div>
        </div>
      )}

      {isEditingProfile && (
        <form onSubmit={handleSubmit} className="vet-profile-form">
          {successMessage && <p className="success-message">{successMessage}</p>}
          {error && <p className="error-message">{error}</p>}
          <div>
            <label>Veterinarian ID:</label><br />
            <input
              type="text"
              name="vetId"
              value={formData.vetId}
              onChange={handleChange}
              required
              disabled
            />
          </div>
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
            <label>Specialization:</label><br />
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Area of Expertise:</label><br />
            <input
              type="text"
              name="areaOfExpertise"
              value={formData.areaOfExpertise}
              onChange={handleChange}
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
              name="vetLocation"
              value={formData.vetLocation}
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
        <form onSubmit={handlePasswordSubmit} className="vet-profile-form">
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

export default VetProfile;

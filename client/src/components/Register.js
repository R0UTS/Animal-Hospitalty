import React, { useState } from 'react';
import axios from 'axios';

import './RegisterPageUpdated.css';
import Navbar from './Navbar';

function RegisterPage() {
  const [role, setRole] = useState('farmer');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [farmerLocation, setFarmerLocation] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [areaOfExpertise, setAreaOfExpertise] = useState('');
  const [vetLocation, setVetLocation] = useState('');
  const [supportDocument, setSupportDocument] = useState(null);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleFarmerLocationChange = (e) => {
    setFarmerLocation(e.target.value);
  };

  const handleAdditionalInfoChange = (e) => {
    setAdditionalInfo(e.target.value);
  };

  const handleSpecializationChange = (e) => {
    setSpecialization(e.target.value);
  };

  const handleAreaOfExpertiseChange = (e) => {
    setAreaOfExpertise(e.target.value);
  };

  const handleVetLocationChange = (e) => {
    setVetLocation(e.target.value);
  };

  const handleSupportDocumentChange = (e) => {
    setSupportDocument(e.target.files[0]);
  };

  const validateForm = () => {
    const errors = {};
    if (!/^\d{10}$/.test(phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
    }
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }
    if (role === 'veterinarian') {
      if (!vetLocation) {
        errors.vetLocation = 'Location is required for veterinarians';
      }
      if (!supportDocument) {
        errors.supportDocument = 'Support document is required for veterinarians';
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors).join(', '));
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('userName', username);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('phoneNumber', phoneNumber);
      formData.append('farmerLocation', farmerLocation);
      formData.append('additionalInfo', additionalInfo);

      if (role === 'veterinarian') {
        formData.append('specialization', specialization);
        formData.append('areaOfExpertise', areaOfExpertise);
        formData.append('vetLocation', vetLocation);
        formData.append('supportDocument', supportDocument);
      }

      console.log('Sending registration data:', formData);
      const response = await axios.post('http://localhost:5000/api/user/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Registration response:', response.data);

      window.location.href = '/login';

    } catch (error) {
      console.error('Full registration error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);

      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="register-container">
        <div className="register-form">
          <h2>Register for Animal Hospitality</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="role">Role</label>
<select id="role" value={role} onChange={handleRoleChange} required>
  <option value="farmer">Farmer</option>
  <option value="veterinarian">Veterinarian</option>
  {/* Removed admin option for security */}
  {/* <option value="gov_admin">Government Admin</option> */}
</select>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Choose a username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Enter 10-digit phone number"
                pattern="[0-9]{10}"
                required
              />
            </div>

            {role === 'farmer' && (
              <>
                <div className="form-group">
                  <label htmlFor="farmerLocation">Farmer Location</label>
                  <input
                    type="text"
                    id="farmerLocation"
                    value={farmerLocation}
                    onChange={handleFarmerLocationChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="additionalInfo">Additional Information</label>
                  <input
                    type="text"
                    id="additionalInfo"
                    value={additionalInfo}
                    onChange={handleAdditionalInfoChange}
                  />
                </div>
              </>
            )}

            {role === 'veterinarian' && (
              <>
                <div className="form-group">
                  <label htmlFor="specialization">Specialization</label>
                  <input
                    type="text"
                    id="specialization"
                    value={specialization}
                    onChange={handleSpecializationChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="areaOfExpertise">Area of Expertise</label>
                  <input
                    type="text"
                    id="areaOfExpertise"
                    value={areaOfExpertise}
                    onChange={handleAreaOfExpertiseChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="vetLocation">Location (District of Work)</label>
                  <input
                    type="text"
                    id="vetLocation"
                    value={vetLocation}
                    onChange={handleVetLocationChange}
                    placeholder="Enter your district of work"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="supportDocument">Support Document / Certificate</label>
                  <input
                    type="file"
                    id="supportDocument"
                    onChange={handleSupportDocumentChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <div className="error-message">
                {error.split(', ').map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

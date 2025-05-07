import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPageUpdated.css';
import Navbar from './Navbar';
import loginPng from '../image/loginPng.png'
import PasswordRecovery from './PasswordRecovery';

function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLoginIdChange = (e) => {
    setLoginId(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loginId, password })
      });
      const data = await response.json();
      if (response.ok) {
        // Save token
        localStorage.setItem('token', data.token);
        // Save userId for animal operations
        if (data.user && data.user.id) {
          localStorage.setItem('userId', data.user.id);
        }
        // Save user role for route protection
        if (data.user && data.user.role) {
          localStorage.setItem('userRole', data.user.role);
        }

        // Redirect based on role
        switch (data.user.role) {
          case 'farmer':
            navigate('/farmer-dashboard');
            break;
          case 'veterinarian':
            navigate('/vet-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setErrorMessage(data.error || 'Login failed. Please try again.');
      }

    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.');
    }
  };


  const handleForgotPasswordClick = () => {
    setShowPasswordRecovery(true);
  };

  const handleReturnToLogin = () => {
    setShowPasswordRecovery(false); // Function to go back to login
  };

  const renderLoginForm = () => (
    <div className="login-form">
      <h2>Welcome to Animal Hospitality</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loginId">Email or Phone Number</label>
          <input
            type="text"
            id="loginId"
            value={loginId}
            onChange={handleLoginIdChange}
            placeholder="Enter your email or phone number"
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
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <div className="forgot-password">
        <a href="#" onClick={handleForgotPasswordClick}>
          Forgot Password?
        </a>
      </div>
      <div className="signup-link">
        <p>
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="login-container">
        <div className="login-image">
          {/* Replace with a relevant image */} 
          <img src={loginPng} alt="Livestock and Veterinarian" id='loginPng'/>
        </div>
        {showPasswordRecovery ? (
          <PasswordRecovery onReturnToLogin={handleReturnToLogin} />
        ) : (
          renderLoginForm()
        )}
      </div>
    </div>
  );
}

export default LoginPage;

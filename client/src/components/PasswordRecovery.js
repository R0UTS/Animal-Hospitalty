import React, { useState } from 'react';
import './PasswordRecovery.css'; // Import CSS for styling

function PasswordRecovery({ onReturnToLogin }) { // Get a callback function
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestOtp = () => {
    // Send OTP to the email
    // On success, setStep('verify')
  };

  const handleVerifyOtp = () => {
    // Verify OTP
    // On success, setStep('reset')
  };

  const handleResetPassword = () => {
    // Reset password
    // On success, show success message and redirect to login
  };

  const renderStep = () => {
    switch (step) {
      case 'request':
        return (
          <div>
            <h2>Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleRequestOtp}>Request OTP</button>
          </div>
        );
      case 'verify':
        return (
          <div>
            <h2>Verify OTP</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOtp}>Verify OTP</button>
          </div>
        );
      case 'reset':
        return (
          <div>
            <h2>Reset Password</h2>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handleResetPassword}>Reset Password</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="password-recovery-container">
      <button className="return-to-login" onClick={onReturnToLogin}>
        &#10006; {/* Unicode for the cross symbol */}
      </button>
      {renderStep()}
    </div>
  );
}

export default PasswordRecovery;
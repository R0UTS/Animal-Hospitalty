import React, { useState, useEffect } from 'react';
import FarmerDashboardHome from './FarmerDashboardHome';
import ReportEmergency from './ReportEmergency';
import FarmerProfile from './FarmerProfile';
import FarmerViewAnimals from './FarmerViewAnimals';
import FarmerMyReports from './FarmerMyReports';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerDashboard.css';

function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [farmerName, setFarmerName] = useState(''); // dynamic farmer name
  const [profileData, setProfileData] = useState(null); // store full profile data
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch farmer profile to get the name and profile data for display
    const fetchFarmerProfile = async () => {
      console.log('Fetching farmer profile...');

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setFarmerName('Farmer');
          setProfileData(null);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/user/profile', { // Updated URL
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Resolve only if status code is less than 500
          }
        });

        if (response.status === 200) {
          console.log('Profile data received:', response.data);
          setFarmerName(response.data.userName || 'Farmer');
          setProfileData(response.data);
        } else {
          console.error('Failed to fetch farmer profile, status:', response.status, 'data:', response.data);
          setFarmerName('Farmer');
          setProfileData(null);
        }
      } catch (error) {
        console.error('Failed to fetch farmer profile:', error);
        setFarmerName('Farmer');
        setProfileData(null);
      }
    };
    fetchFarmerProfile();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleReportEmergencyClick = () => {
    setActiveTab('reportEmergency');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="farmer-dashboard-container">
      <header className="farmer-dashboard-header">
        <div className="logo"><img src={'../animal-hospitality-logo.png'} alt="Animal Hospitality Logo" className="logo" /></div>
        <div className="farmer-profile">
          <span>{farmerName}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <nav className="farmer-dashboard-sidebar">
        <ul>
          <li
            className={activeTab === 'home' ? 'active' : ''}
            onClick={() => handleTabClick('home')}
          >
            Home
          </li>
          <li
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => handleTabClick('profile')}
          >
            My Profile
          </li>
          <li
            className={activeTab === 'reportEmergency' ? 'active' : ''}
            onClick={() => handleTabClick('reportEmergency')}
          >
            Report Emergency
          </li>
          <li
            className={activeTab === 'viewAnimals' ? 'active' : ''}
            onClick={() => handleTabClick('viewAnimals')}
          >
            View Animals
          </li>
          <li
            className={activeTab === 'myReports' ? 'active' : ''}
            onClick={() => handleTabClick('myReports')}
          >
            My Reports
          </li>
        </ul>
      </nav>
      <main className="farmer-dashboard-main-content">
        {activeTab === 'home' && (
          <FarmerDashboardHome onReportEmergencyClick={handleReportEmergencyClick} />
        )}
        {activeTab === 'reportEmergency' && <ReportEmergency />}
        {activeTab === 'profile' && <FarmerProfile profile={profileData} />}
        {activeTab === 'viewAnimals' && <FarmerViewAnimals />}
        {activeTab === 'myReports' && <FarmerMyReports />}
      </main>
      <footer className="farmer-dashboard-footer">
        <p>© 2025 Animal Hospital. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default FarmerDashboard;

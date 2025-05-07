import React, { useState, useEffect } from 'react';
import './FarmerDashboardHome.css'; // Import CSS

function FarmerDashboardHome({ onReportEmergencyClick }) {
  const [emergencies, setEmergencies] = useState([]);
  const [animals, setAnimals] = useState([]);

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/emergency?limit=5', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEmergencies(data);
        } else {
          console.error('Failed to fetch emergencies');
        }
      } catch (error) {
        console.error('Error fetching emergencies:', error);
      }
    };

    const fetchAnimals = async () => {
      try {
        const token = localStorage.getItem('token');
        // Decode userId from token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        const userId = JSON.parse(jsonPayload).userId;

        const response = await fetch(`/api/animal/farmer/${userId}?limit=6`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAnimals(data);
        } else {
          console.error('Failed to fetch animals');
        }
      } catch (error) {
        console.error('Error fetching animals:', error);
      }
    };

    fetchEmergencies();
    fetchAnimals();
  }, []);

  return (
    <div className="farmer-dashboard-home">
      <main className="dashboard-main-content">
        <section className="emergency-report-shortcut">
          <button className="report-emergency-button" onClick={onReportEmergencyClick}>
            <i className="fas fa-exclamation-triangle"></i> Report Emergency Now
          </button>
        </section>
        <section className="recent-reports">
          <h2>Recent Emergency Reports</h2>
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Date/Time</th>
                  <th>Animal(s)</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {emergencies.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No recent emergencies found.
                    </td>
                  </tr>
                ) : (
                  emergencies.map((emergency) => (
                    <tr key={emergency.emergencyId || emergency._id}>
                      <td>{emergency.emergencyId || emergency._id}</td>
                      <td>{new Date(emergency.createdAt).toLocaleString()}</td>
                      <td>
                        {Array.isArray(emergency.animals)
                          ? emergency.animals.map((a) => a.animalType || a).join(', ')
                          : emergency.animals}
                      </td>
                      <td>{emergency.description}</td>
                      <td>{emergency.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="animal-profiles">
          <h2>Quick Access to Animal Profiles</h2>
          <div className="animal-cards-container">
            {animals.length === 0 ? (
              <p>No animals found.</p>
            ) : (
              animals.map((animal) => (
                <div className="animal-card" key={animal.animalId}>
                  <h3>{animal.nickName || animal.Species}</h3>
                  <p>Species: {animal.Species}</p>
                  <p>Breed: {animal.breed}</p>
                  <a href={`/animal-profile/${animal.animalId}`}>View Profile</a>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default FarmerDashboardHome;

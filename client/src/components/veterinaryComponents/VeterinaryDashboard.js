
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this line to import useNavigate
import './VeterinaryDashboard.css';
import EmergencyList from './EmergencyList';
import EmergencyDetails from './EmergencyDetails';
import CommunicationInterface from './CommunicationInterface';
import VetProfile from './VetProfile';

function VeterinaryDashboard() {
    const [profile, setProfile] = useState(null);

    const [emergencies, setEmergencies] = useState([]);

    useEffect(() => {
        const fetchEmergencies = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/emergency/vet-emergencies', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Fetch emergencies failed:', response.status, errorText);
                    throw new Error(`Failed to fetch emergencies: ${response.status} ${errorText}`);
                }
        const data = await response.json();
        console.log('Fetched emergencies:', data); // Added debug log

        // Map backend emergencies to EmergencyList format
        const mappedEmergencies = data.map(emergency => {
            const animalType = emergency.animals && emergency.animals.length > 0 ? emergency.animals[0].animalType || 'Unknown' : 'Unknown';
            const description = emergency.description || '';
            const location = emergency.location || '';
            const createdAt = new Date(emergency.createdAt);
            const time = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = createdAt.toLocaleDateString();
            const status = emergency.status || 'Pending';

            return {
                reportId: emergency.emergencyId,
                location,
                animal: animalType,
                description,
                distance: 'N/A', // Distance calculation can be added later
                time: `${date} ${time}`,
                status,
            };
        });

        setEmergencies(mappedEmergencies);
            } catch (error) {
                console.error('Error fetching emergencies:', error);
            }
        };

        fetchEmergencies();
    }, []);

    const [selectedEmergency, setSelectedEmergency] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [pendingReportsCount, setPendingReportsCount] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                const data = await response.json();
                console.log("Fetched Profile Data:", data); // Log the fetched data

                // Use vetLocation directly from API response
                const mappedProfile = {
                    ...data,
                    vetLocation: data.vetLocation || '',
                };

                setProfile(mappedProfile);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();

        const pendingCount = emergencies.filter(e => e.status === "Pending").length;
        setPendingReportsCount(pendingCount);
    }, [emergencies]);

    const handleEmergencyClick = async (reportId) => {
        if (!reportId) {
            // Clear selected emergency and show list only
            setSelectedEmergency(null);
            setShowProfile(false);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/emergency/${reportId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Fetch emergency details failed:', response.status, errorText);
                throw new Error(`Failed to fetch emergency details: ${response.status} ${errorText}`);
            }
            const data = await response.json();

            // Map backend emergency details to EmergencyDetails format
            const animalType = data.animals && data.animals.length > 0 ? data.animals[0].animalType || 'Unknown' : 'Unknown';
            const description = data.description || '';
            const location = data.location || '';
            const createdAt = new Date(data.createdAt);
            const time = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = createdAt.toLocaleDateString();
            const status = data.status || 'Pending';

            const detailedEmergency = {
                reportId: data.emergencyId,
                location,
                animal: animalType,
                description,
                status,
                farmerPhone: data.farmerPhone || '',
                farmerEmail: data.farmerEmail || '',
                images: data.images || [],
                videos: data.videos || [],
            };

            setSelectedEmergency(detailedEmergency);
            setShowProfile(false);
        } catch (error) {
            console.error('Error fetching emergency details:', error);
        }
    };

    const handleProfileClick = () => {
        setSelectedEmergency(null);
        setShowProfile(true);
    };

    const navigate = useNavigate(); // Add this line to use navigation

    const handleLogout = () => {
        console.log("Logout clicked");
        localStorage.removeItem('token'); // Remove token from local storage
        navigate('/login'); // Redirect to login page
    };

    const handleUpdateStatus = (reportId, newStatus) => {
        const updatedEmergencies = emergencies.map(emergency =>
            emergency.reportId === reportId ? { ...emergency, status: newStatus } : emergency
        );
        setEmergencies(updatedEmergencies);
        setSelectedEmergency(prevEmergency =>
            prevEmergency && prevEmergency.reportId === reportId
                ? { ...prevEmergency, status: newStatus }
                : prevEmergency
        );
    };

    return (
        <div className="vet-dashboard-container">
            <header className="vet-dashboard-header">
                <img src={'../animal-hospitality-logo.png'} alt="Animal Hospitality Logo" className="logo" />
                <h1 className="welcome-message">Veterinary Dashboard - {profile ? profile.userName : 'Veterinarian'}</h1>
                <div className="header-icons">
                    <div className="notification-icon" title="Notifications">
                        <i className="fas fa-bell"></i>
                        {pendingReportsCount > 0 && (
                            <span className="notification-badge">{pendingReportsCount}</span>
                        )}
                    </div>
                    <button onClick={handleLogout} className="logout-button" title="Logout">
                        Logout
                    </button>
                </div>
            </header>

            <aside className="vet-dashboard-sidebar">
                <nav>
                    <ul>
                        <li>
                            <a
                                href="#"
                                className={!showProfile ? "active" : ""}
                                onClick={() => {
                                    handleEmergencyClick(null);
                                }}
                            >
                                Emergencies
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className={showProfile ? "active" : ""}
                                onClick={handleProfileClick}
                            >
                                My Profile
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            <main className="vet-dashboard-main-content" role="main">
                {!showProfile ? (
                    <>
                        <EmergencyList emergencies={emergencies} onEmergencyClick={handleEmergencyClick} />
                        {selectedEmergency && (
                            <EmergencyDetails
                                emergency={selectedEmergency}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        )}
                        {/* CommunicationInterface temporarily disabled as per user request */}
                        {/* {selectedEmergency && <CommunicationInterface />} */}
                    </>
                ) : (
                    <VetProfile profile={profile} />
                )}
            </main>
        </div>
    );

}

export default VeterinaryDashboard;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import UserManagement from './UserManagement';
import EmergencyStatistics from './EmergencyStatistics';
import Reporting from './Reporting';
import SystemConfiguration from './SystemConfiguration';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('userManagement'); // Default tab
    const navigate = useNavigate();

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'userManagement':
                return <UserManagement />;
            case 'emergencyStatistics':
                return <EmergencyStatistics />;
            case 'reporting':
                return <Reporting />;
            case 'systemConfiguration':
                return <SystemConfiguration />;
            default:
                return null;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <div className="admin-dashboard-container">
            <header className="admin-header">
                <div className="logo-container">
                    <img src={'../animal-hospitality-logo.png'} alt="Animal Hospitality Logo" className="admin-logo" />
                </div>
                <h1>Admin Panel</h1>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </header>

            <aside className="admin-sidebar">
                <nav>
                    <ul>
                        <li
                            className={activeTab === 'userManagement' ? 'active' : ''}
                            onClick={() => setActiveTab('userManagement')}
                        >
                            <button>User Management</button>
                        </li>
                        <li
                            className={activeTab === 'emergencyStatistics' ? 'active' : ''}
                            onClick={() => setActiveTab('emergencyStatistics')}
                        >
                            <button>Emergency Statistics</button>
                        </li>
                        <li
                            className={activeTab === 'reporting' ? 'active' : ''}
                            onClick={() => setActiveTab('reporting')}
                        >
                            <button>Reporting</button>
                        </li>
                        <li
                            className={activeTab === 'systemConfiguration' ? 'active' : ''}
                            onClick={() => setActiveTab('systemConfiguration')}
                        >
                            <button>System Configuration</button>
                        </li>
                    </ul>
                </nav>
            </aside>

            <main className="admin-main-content">
                {renderActiveTab()}
            </main>
        </div>
    );
}

export default AdminDashboard;

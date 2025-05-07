import React, { useState } from 'react';
import './SystemConfiguration.css';

const ODISHA_DISTRICTS = [
    'BHADRAK',
    'CUTTACK',
    'PURI',
    'KHORDHA',
    'KENDRAPARA',
    'JAJPUR'
];

function SystemConfiguration() {
    const [platformName, setPlatformName] = useState('Animal Hospitality');
    const [defaultTimezone, setDefaultTimezone] = useState('UTC');
    const [currency, setCurrency] = useState('USD');
    const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
    const [newRoleName, setNewRoleName] = useState('');
    const [roles, setRoles] = useState(['Admin', 'Support']);
    const [emergencyCategories, setEmergencyCategories] = useState(['Injury', 'Illness', 'Birthing']);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [locations, setLocations] = useState(ODISHA_DISTRICTS);
    const [newLocationName, setNewLocationName] = useState('');

    const handleAddRole = () => {
        if (newRoleName.trim()) {
            setRoles([...roles, newRoleName.trim()]);
            setNewRoleName('');
        }
    };

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            setEmergencyCategories([...emergencyCategories, newCategoryName.trim()]);
            setNewCategoryName('');
        }
    };

    const handleAddLocation = () => {
        if (newLocationName.trim()) {
            setLocations([...locations, newLocationName.trim().toUpperCase()]);
            setNewLocationName('');
        }
    };

    return (
        <div className="system-configuration-container">
            <h2>System Configuration</h2>

            <section className="basic-settings">
                <h3>Basic Settings</h3>
                <div className="setting-item">
                    <label htmlFor="platformName">Platform Name:</label>
                    <input type="text" id="platformName" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                </div>
                <div className="setting-item">
                    <label htmlFor="defaultTimezone">Default Timezone:</label>
                    <select id="defaultTimezone" value={defaultTimezone} onChange={(e) => setDefaultTimezone(e.target.value)}>
                        <option value="UTC">UTC</option>
                        <option value="America/Los_Angeles">America/Los_Angeles</option>
                        {/* Add more timezones */}
                    </select>
                </div>
                <div className="setting-item">
                    <label htmlFor="currency">Currency:</label>
                    <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        {/* Add more currencies */}
                    </select>
                </div>
                <div className="setting-item">
                    <label htmlFor="dateFormat">Date Format:</label>
                    <select id="dateFormat" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        {/* Add more date formats */}
                    </select>
                </div>
            </section>

            <section className="role-management">
                <h3>User Roles</h3>
                <ul>
                    {roles.map(role => (
                        <li key={role}>{role}</li>
                    ))}
                </ul>
                <div className="add-new">
                    <input type="text" placeholder="New Role Name" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
                    <button onClick={handleAddRole}>Add Role</button>
                </div>
            </section>

            <section className="emergency-categories">
                <h3>Emergency Categories</h3>
                <ul>
                    {emergencyCategories.map(category => (
                        <li key={category}>{category}</li>
                    ))}
                </ul>
                <div className="add-new">
                    <input type="text" placeholder="New Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                    <button onClick={handleAddCategory}>Add Category</button>
                </div>
            </section>

            <section className="location-management">
                <h3>Location Management</h3>
                <ul>
                    {locations.map(location => (
                        <li key={location}>{location}</li>
                    ))}
                </ul>
                <div className="add-new">
                    <input type="text" placeholder="New Location Name" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} />
                    <button onClick={handleAddLocation}>Add Location</button>
                </div>
            </section>

            {/* Add more configuration sections as needed */}
        </div>
    );
}

export default SystemConfiguration;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

const ODISHA_DISTRICTS = [
    'BHADRAK',
    'CUTTACK',
    'PURI',
    'KHORDHA',
    'KENDRAPARA',
    'JAJPUR'
];

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [farmerFilter, setFarmerFilter] = useState('all');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [errorProfile, setErrorProfile] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/user/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchUserProfile = async (userId) => {
        setLoadingProfile(true);
        setErrorProfile(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/user/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSelectedUser(response.data);
        } catch (error) {
            setErrorProfile('Failed to load user profile.');
            console.error('Error fetching user profile:', error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleAcceptVet = async (vetId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/user/users/${vetId}/status`, { status: 'Active' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            if (selectedUser && selectedUser._id === vetId) {
                fetchUserProfile(vetId);
            }
        } catch (error) {
            console.error('Error approving veterinarian:', error);
        }
    };

    const handleSuspendVet = async (vetId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/user/users/${vetId}/status`, { status: 'Suspended' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            if (selectedUser && selectedUser._id === vetId) {
                fetchUserProfile(vetId);
            }
        } catch (error) {
            console.error('Error suspending veterinarian:', error);
        }
    };

    const handleRejectVet = async (vetId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/user/users/${vetId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            if (selectedUser && selectedUser._id === vetId) {
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Error rejecting veterinarian:', error);
        }
    };

    const handleApproveDocument = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/user/users/${userId}/document-status`, { supportDocumentStatus: 'Approved' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUserProfile(userId);
            fetchUsers();
        } catch (error) {
            console.error('Error approving document:', error);
        }
    };

    const handleRejectDocument = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/user/users/${userId}/document-status`, { supportDocumentStatus: 'Rejected' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUserProfile(userId);
            fetchUsers();
        } catch (error) {
            console.error('Error rejecting document:', error);
        }
    };

    const filteredFarmers = users.filter(user => user.role && user.role.toLowerCase() === 'farmer')
        .filter(farmer => {
            if (farmerFilter === 'all') return true;
            return farmer.location === farmerFilter;
        });

    const filteredUsers = users.filter(user => {
        if (userRoleFilter === 'all') return true;
        return user.role && user.role.toLowerCase() === userRoleFilter.toLowerCase();
    }).filter(user => {
        if (locationFilter === 'all') return true;
        return user.location === locationFilter;
    });

    return (
        <div className="user-management-container">
            <h2>User Management</h2>

            {/* Selected User Profile Modal */}
            {selectedUser && (
                <div className="user-profile-modal">
                    <div className="user-profile-content">
                        <button className="close-button" onClick={() => setSelectedUser(null)}>X</button>
                        {loadingProfile ? (
                            <p>Loading profile...</p>
                        ) : errorProfile ? (
                            <p className="error-message">{errorProfile}</p>
                        ) : (
                            <>
                                <h3>User Profile</h3>
                                <p><strong>Name:</strong> {selectedUser.userName}</p>
                                <p><strong>Role:</strong> {selectedUser.role}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Phone Number:</strong> {selectedUser.phoneNumber}</p>
                                {selectedUser.role.toLowerCase() === 'farmer' && (
                                    <>
                                        <p><strong>Location:</strong> {selectedUser.farmerLocation}</p>
                                        <p><strong>Additional Info:</strong> {selectedUser.additionalInfo}</p>
                                    </>
                                )}
                                {selectedUser.role.toLowerCase() === 'veterinarian' && (
                                    <>
                                        <p><strong>Location:</strong> {selectedUser.vetLocation}</p>
                                        <p><strong>Specialization:</strong> {selectedUser.specialization}</p>
                                        <p><strong>Area of Expertise:</strong> {selectedUser.areaOfExpertise}</p>
                                        <p>
                                            <strong>Support Document:</strong>{' '}
                                            {selectedUser.supportDocument ? (
                                                <a href={`http://localhost:5000/uploads/${selectedUser.supportDocument}`} target="_blank" rel="noopener noreferrer" download={false}>
                                                    View Document
                                                </a>
                                            ) : (
                                                'No document uploaded'
                                            )}
                                        </p>
                                        <p><strong>Document Status:</strong> {selectedUser.supportDocumentStatus}</p>
                                        {selectedUser.supportDocumentStatus === 'Pending' && (
                                            <div className="document-approval-buttons">
                                                <button onClick={() => handleApproveDocument(selectedUser._id)}>Approve</button>
                                                <button onClick={() => handleRejectDocument(selectedUser._id)}>Reject</button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Farmer Management Section */}
            <section className="farmer-management">
                <h3>Farmer Management</h3>
                <div className="filter-controls">
                    <label htmlFor="farmerLocationFilter">Filter Farmers by Location:</label>
                    <select
                        id="farmerLocationFilter"
                        value={farmerFilter}
                        onChange={(e) => setFarmerFilter(e.target.value)}
                    >
                        <option value="all">All Locations</option>
                        {ODISHA_DISTRICTS.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>User Name</th>
                            <th>Status</th>
                            <th>Registration Date</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFarmers.map(farmer => (
                            <tr key={farmer.id} onClick={() => fetchUserProfile(farmer.id)} style={{ cursor: 'pointer' }}>
                                <td>{farmer.id}</td>
                                <td>{farmer.name}</td>
                                <td>{farmer.status}</td>
                                <td>{farmer.registrationDate}</td>
                                <td>{farmer.location}</td>
                                <td>
                                    {/* Future actions for farmers */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Veterinarian Management Section */}
            <section className="vet-management">
                <h3>Veterinarian Management</h3>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>User Name</th>
                            <th>Status</th>
                            <th>Registration Date</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.filter(user => user.role && user.role.toLowerCase() === 'veterinarian').map(vet => (
                            <tr key={vet.id} onClick={() => fetchUserProfile(vet.id)} style={{ cursor: 'pointer' }}>
                                <td>{vet.id}</td>
                                <td>{vet.name}</td>
                                <td>{vet.status}</td>
                                <td>{vet.registrationDate}</td>
                                <td>{vet.location}</td>
                                <td>
                                    {vet.status === 'Pending' && (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); handleAcceptVet(vet.id); }}>Accept</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleRejectVet(vet.id); }}>Reject</button>
                                        </>
                                    )}
                                    {vet.status === 'Active' && (
                                        <button onClick={(e) => { e.stopPropagation(); handleSuspendVet(vet.id); }}>Suspend</button>
                                    )}
                                    {vet.status === 'Suspended' && (
                                        <span>Suspended</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* All Users View with Filter */}
            <section className="all-users-view">
                <h3>All Users</h3>
                <div className="filter-controls">
                    <label htmlFor="userRoleFilter">Filter by Role:</label>
                    <select
                        id="userRoleFilter"
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="Farmer">Farmer</option>
                        <option value="Veterinarian">Veterinarian</option>
                    </select>
                    <label htmlFor="locationFilter">Filter by Location:</label>
                    <select
                        id="locationFilter"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    >
                        <option value="all">All Locations</option>
                        {ODISHA_DISTRICTS.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>User Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Registration Date</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} onClick={() => fetchUserProfile(user.id)} style={{ cursor: 'pointer' }}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.role}</td>
                                <td>{user.status}</td>
                                <td>{user.registrationDate}</td>
                                <td>{user.location}</td>
                                <td>
                                    {user.role === 'Veterinarian' && user.status === 'Active' && (
                                        <button onClick={(e) => { e.stopPropagation(); handleSuspendVet(user.id); }}>Suspend</button>
                                    )}
                                    {user.role === 'Veterinarian' && user.status === 'Pending' && (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); handleAcceptVet(user.id); }}>Accept</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleRejectVet(user.id); }}>Reject</button>
                                        </>
                                    )}
                                    {user.role === 'Veterinarian' && user.status === 'Suspended' && (
                                        <span>Suspended</span>
                                    )}
                                    {/* Future actions for other roles */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default UserManagement;

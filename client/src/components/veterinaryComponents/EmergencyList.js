import React from 'react';
import './EmergencyList.css'; // Create this CSS file

function EmergencyList({ emergencies, onEmergencyClick }) {
    return (
        <section className="emergency-list">
            <h2>Current Emergencies</h2>
            <div className="emergency-table-container">
                <table className="emergency-table">
                    <thead>
                        <tr>
                            <th>Report ID</th>
                            <th>Location</th>
                            <th>Animal</th>
                            <th>Description</th>
                            <th>Distance</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emergencies.map(emergency => {
                            // Determine class based on status
                            let statusClass = '';
                            switch (emergency.status.toLowerCase()) {
                                case 'critical':
                                    statusClass = 'status-critical';
                                    break;
                                case 'pending':
                                    statusClass = 'status-pending';
                                    break;
                                case 'resolved':
                                    statusClass = 'status-resolved';
                                    break;
                                case 'in progress':
                                    statusClass = 'status-in-progress';
                                    break;
                                default:
                                    statusClass = '';
                            }
                            return (
                                <tr key={emergency.reportId} className={statusClass} onClick={() => onEmergencyClick(emergency.reportId)}>
                                    <td>{emergency.reportId}</td>
                                    <td>{emergency.location}</td>
                                    <td>{emergency.animal}</td>
                                    <td>{emergency.description}</td>
                                    <td>{emergency.distance}</td>
                                    <td>{emergency.time}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default EmergencyList;
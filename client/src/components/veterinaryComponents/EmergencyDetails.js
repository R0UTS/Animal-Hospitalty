
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './EmergencyDetails.css';

function EmergencyDetails({ emergency, onUpdateStatus }) {
    const [modalImage, setModalImage] = useState(null);
    const [modalVideo, setModalVideo] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // Join vet room to receive new emergency reports
        newSocket.emit('joinRoom', 'vets');

        newSocket.on('newEmergencyReport', (newEmergency) => {
            alert(`New emergency reported: ${newEmergency.emergencyId}`);
            // Optionally, refresh or update emergency list in parent component
        });

        return () => newSocket.close();
    }, []);

    const updateStatus = async (reportId, status) => {
        // Map frontend status to backend allowed statuses (lowercase)
        const statusMap = {
            "Acknowledged": "acknowledge",
            "Cancelled": "cancelled",
            "En Route": "en route",
            "On-Site": "on site",
            "Resolved": "resolved",
            "Pending": "pending"
        };
        const backendStatus = statusMap[status] || status.toLowerCase();

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/emergency/${reportId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: backendStatus }),
            });
            if (response.ok) {
                const data = await response.json();
                onUpdateStatus(reportId, status);
            } else {
                console.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAccept = () => {
        updateStatus(emergency.reportId, "Acknowledged");
    };

    const handleDecline = () => {
        updateStatus(emergency.reportId, "Cancelled");
    };

    const renderStatusActions = (status) => {
        switch (status) {
            case "Pending":
                return (
                    <>
                        <button onClick={handleAccept}>Accept</button>
                        <button onClick={handleDecline}>Decline</button>
                    </>
                );
            case "Acknowledged":
                return <button onClick={() => updateStatus(emergency.reportId, "En Route")}>Set to En Route</button>;
            case "En Route":
                return <button onClick={() => updateStatus(emergency.reportId, "On-Site")}>Set to On-Site</button>;
            case "On-Site":
                return <button onClick={() => updateStatus(emergency.reportId, "Resolved")}>Set to Resolved</button>;
            default:
                return null; // No actions for Cancelled or Resolved
        }
    };


    const openImageModal = (src) => {
        setModalImage(src);
    };

    const closeImageModal = () => {
        setModalImage(null);
    };

    const openVideoModal = (src) => {
        setModalVideo(src);
    };

    const closeVideoModal = () => {
        setModalVideo(null);
    };

    return (
        <section className="emergency-details">
            <h2>Emergency Details</h2>
            {emergency ? (
                <div className="details-container">
                    <p>
                        <strong>Report ID:</strong> {emergency.reportId}
                    </p>
                    <p>
                        <strong>Location:</strong> {emergency.location}
                    </p>
                    <p>
                        <strong>Animal:</strong> {emergency.animal}
                    </p>
                    <p>
                        <strong>Description:</strong> {emergency.description}
                    </p>
                    <p>
                        <strong>Status:</strong> {emergency.status}
                    </p>
                    <p>
                        <strong>Farmer Phone:</strong> {emergency.farmerPhone || 'N/A'}
                    </p>
                    <p>
                        <strong>Farmer Email:</strong> {emergency.farmerEmail || 'N/A'}
                    </p>
                    {emergency.images && emergency.images.length > 0 && (
                        <div className="media-section">
                            <h3>Images</h3>
                            <div className="images-container">
                                {emergency.images.map((imgSrc, index) => (
                                    <img
                                        key={index}
                                        src={`http://localhost:5000/uploads/${imgSrc.replace(/\\\\/g, '/')}`}
                                        alt={`Emergency Image ${index + 1}`}
                                        className="emergency-image"
                                        onClick={() => openImageModal(`http://localhost:5000/uploads/${imgSrc.replace(/\\\\/g, '/')}`)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {emergency.videos && emergency.videos.length > 0 && (
                        <div className="media-section">
                            <h3>Videos</h3>
                            <div className="videos-container">
                                {emergency.videos.map((videoSrc, index) => (
                                    <video
                                        key={index}
                                        controls
                                        className="emergency-video"
                                        onClick={() => openVideoModal(`http://localhost:5000/uploads/${videoSrc.replace(/\\\\/g, '/')}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <source src={`http://localhost:5000/uploads/${videoSrc.replace(/\\\\/g, '/')}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="emergency-actions">
                        {renderStatusActions(emergency.status)}
                    </div>

                    {/* Image Modal */}
                    {modalImage && (
                        <div className="modal-overlay" onClick={closeImageModal}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <button className="modal-close-button" onClick={closeImageModal} aria-label="Close modal">&times;</button>
                                <img src={modalImage} alt="Expanded Emergency" />
                            </div>
                        </div>
                    )}

                    {/* Video Modal */}
                    {modalVideo && (
                        <div className="modal-overlay" onClick={closeVideoModal}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <button className="modal-close-button" onClick={closeVideoModal} aria-label="Close modal">&times;</button>
                                <video controls autoPlay>
                                    <source src={modalVideo} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p>No emergency selected.</p>
            )}
        </section>
    );
}

export default EmergencyDetails;

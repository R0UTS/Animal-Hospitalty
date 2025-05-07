import React, { useState , useEffect } from 'react';
import io from 'socket.io-client';
import './FarmerMyReports.css'; // Import CSS
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function FarmerMyReports() {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('total');
    const [filteredReports, setFilteredReports] = useState([]);
    const [reportCounts, setReportCounts] = useState({
        total: 0,
        resolved: 0,
        notResolved: 0,
    });
    const [socket, setSocket] = useState(null);

useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fetch all reports without limit
                const response = await fetch('http://localhost:5000/api/emergency', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    // Map backend data to frontend report format
                    const mappedReports = data.map(item => ({
                        reportId: item.emergencyId || item._id || '',
                        date: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '',
                        animal: item.animals || 'Unknown',
                        description: item.description || '',
                        status: item.status || 'Pending',
                        feedback: '',
                    }));
                    setReports(mappedReports);
                } else {
                    console.error('Failed to fetch reports');
                }
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };
        fetchReports();
    }, []);


    useEffect(() => {
        // Function to filter reports based on the selected filter
        const filterReports = () => {
            let filtered = [...reports];
            const currentDate = new Date();

            if (filter === 'month') {
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();
                filtered = filtered.filter(report => {
                    const reportDate = new Date(report.date);
                    return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
                });
            } else if (filter === 'year') {
                const currentYear = currentDate.getFullYear();
                filtered = filtered.filter(report => {
                    const reportDate = new Date(report.date);
                    return reportDate.getFullYear() === currentYear;
                });
            }

            setFilteredReports(filtered);
        };

        // Function to calculate report counts
        const calculateReportCounts = () => {
             let countFilter = [...reports]; // Default to all reports
            const currentDate = new Date();


             if (filter === 'month') {
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();
                countFilter = countFilter.filter(report => {
                    const reportDate = new Date(report.date);
                    return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
                });
            } else if (filter === 'year') {
                const currentYear = currentDate.getFullYear();
                countFilter = countFilter.filter(report => {
                    const reportDate = new Date(report.date);
                    return reportDate.getFullYear() === currentYear;
                });
            }

            let total = countFilter.length;
            let resolved = 0;
            let notResolved = 0;

            countFilter.forEach(report => {
                if (report.status === 'Resolved') {
                    resolved++;
                } else {
                    notResolved++;
                }
            });

            setReportCounts({ total, resolved, notResolved });
        };

        filterReports();
        calculateReportCounts();

    }, [reports, filter]);

    const handleFeedbackChange = (e, reportId) => {
        const updatedReports = reports.map(report =>
            report.reportId === reportId ? { ...report, feedback: e.target.value } : report
        );
        setReports(updatedReports);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // Join room for this farmer userId to receive status updates
        const token = localStorage.getItem('token');
        // Assuming token contains userId or userId is decoded elsewhere and passed here
        // For demo, join a generic room or implement userId extraction from token
        // Here, we join a generic 'farmers' room for simplicity
        newSocket.emit('joinRoom', 'farmers');

        newSocket.on('emergencyStatusUpdated', (update) => {
            setReports((prevReports) => {
                return prevReports.map(report => {
                    if (report.reportId === update.emergencyId) {
                        return { ...report, status: update.status };
                    }
                    return report;
                });
            });
        });

        return () => newSocket.close();
    }, []);

    // Prepare data for chart
    const chartData = {
        labels: ['Total', 'Resolved', 'Not Resolved'],
        datasets: [
            {
                label: 'Emergency Reports',
                data: [reportCounts.total, reportCounts.resolved, reportCounts.notResolved],
                backgroundColor: ['#36A2EB', '#4BC0C0', '#FF6384'],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Emergency Reports Summary',
            },
        },
    };

    return (
        <div className="farmer-my-reports-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>My Emergency Reports</h2>
            <div className="filter-container" style={{ marginBottom: '20px', textAlign: 'center' }}>
                <label htmlFor="filter" style={{ marginRight: '10px', fontWeight: 'bold' }}>Filter by:</label>
                <select id="filter" value={filter} onChange={handleFilterChange} style={{ padding: '5px 10px', fontSize: '16px' }}>
                    <option value="total">All</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
            </div>
            <div className="report-counts" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px', fontSize: '18px' }}>
                <p><strong>Total Reports:</strong> {reportCounts.total}</p>
                <p><strong>Resolved:</strong> {reportCounts.resolved}</p>
                <p><strong>Not Resolved:</strong> {reportCounts.notResolved}</p>
            </div>
            
            <div className="reports-list" style={{ borderTop: '1px solid #ccc', paddingTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                {filteredReports.length === 0 ? (
                    <p style={{ textAlign: 'center', fontSize: '18px' }}>No reports found.</p>
                ) : (
                    filteredReports.slice(0, 10).map(report => (
                        <div
                            key={report.reportId}
                            className={`report-item status-${report.status.toLowerCase().replace(/\s/g, '-')}`}
                            style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div style={{ flex: 1 }}>
                                <p><strong>Date:</strong> {report.date}</p>
                            </div>
                            <div style={{ flex: 2 }}>
                                <p><strong>Animals:</strong> {Array.isArray(report.animal) ? report.animal.map(a => a.animalType).join(', ') : report.animal}</p>
                            </div>
                            <div style={{ flex: 3 }}>
                                <p><strong>Description:</strong> {report.description}</p>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p><strong>Status:</strong> {report.status}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div style={{ marginBottom: '40px' }}>
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}

export default FarmerMyReports;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Reporting.css';

const ODISHA_DISTRICTS = [
  'BHADRAK',
  'CUTTACK',
  'PURI',
  'KHORDHA',
  'KENDRAPARA',
  'JAJPUR'
];

const EMERGENCY_CATEGORIES = ['Injury', 'Illness', 'Birthing'];
const EMERGENCY_STATUSES = ['Pending', 'Acknowledged', 'Resolved'];

function Reporting() {
  const [reportType, setReportType] = useState('emergency');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [userRole, setUserRole] = useState('all');
  const [emergencyCategory, setEmergencyCategory] = useState('all');
  const [emergencyStatus, setEmergencyStatus] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange, userRole, emergencyCategory, emergencyStatus, locationFilter, currentPage]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (reportType === 'emergency') {
        const params = {
          fromDate: dateRange.from || undefined,
          toDate: dateRange.to || undefined,
          category: emergencyCategory !== 'all' ? emergencyCategory : undefined,
          status: emergencyStatus !== 'all' ? emergencyStatus : undefined,
          location: locationFilter !== 'all' ? locationFilter : undefined,
        };
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/emergency/detailed', { params, headers: { Authorization: `Bearer ${token}` } });
      setReportData(response.data);
    } else if (reportType === 'user') {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/users', { headers: { Authorization: `Bearer ${token}` } });
      let users = response.data;
      // Filter users by role and location
      if (userRole !== 'all') {
        users = users.filter(user => user.role.toLowerCase() === userRole.toLowerCase());
      }
      if (locationFilter !== 'all') {
        users = users.filter(user => user.location === locationFilter);
      }
      // Filter by date range
      if (dateRange.from) {
        users = users.filter(user => new Date(user.registrationDate) >= new Date(dateRange.from));
      }
      if (dateRange.to) {
        users = users.filter(user => new Date(user.registrationDate) <= new Date(dateRange.to));
      }
      setReportData(users);
      }
    } catch (err) {
      setError('Failed to fetch report data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = '';
    if (reportType === 'emergency') {
      csvContent = 'ID,Date,Location,Category,Status\n' + reportData.map(item =>
        `${item._id || ''},${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''},${item.farmerLocation || ''},${item.category || ''},${item.status || ''}`
      ).join('\n');
} else if (reportType === 'user') {
  csvContent = 'ID,Name,Registration Date,Role,Location\n' + reportData.map(item =>
    `${item.id || ''},${item.name || ''},${item.registrationDate ? new Date(item.registrationDate).toLocaleDateString() : ''},${item.role || ''},${item.location || ''}`
  ).join('\n');
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(reportData.length / itemsPerPage);
  const paginatedData = reportData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const chartData = {
    labels: [],
    datasets: [],
  };

  if (reportType === 'emergency') {
    // Aggregate counts by farmerName for chart
    const counts = {};
    reportData.forEach(item => {
      const farmer = item.farmerName || 'Unknown';
      counts[farmer] = (counts[farmer] || 0) + 1;
    });
    chartData.labels = Object.keys(counts);
    chartData.datasets = [{
      label: 'Number of Emergencies by Farmer',
      data: Object.values(counts),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }];
  } else if (reportType === 'user') {
    // Aggregate counts by role for chart
    const roleCounts = { Farmer: 0, Veterinarian: 0 };
    reportData.forEach(user => {
      if (user.role && roleCounts.hasOwnProperty(user.role)) {
        roleCounts[user.role]++;
      }
    });
    chartData.labels = Object.keys(roleCounts);
    chartData.datasets = [{
      label: 'Number of Users',
      data: Object.values(roleCounts),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    }];
  }

  const validateDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return new Date(dateRange.from) <= new Date(dateRange.to);
    }
    return true;
  };

  return (
    <div className="reporting-container">
      <h2>Reporting</h2>

      <div className="report-filters">
        <label htmlFor="reportType">Report Type:</label>
        <select id="reportType" value={reportType} onChange={(e) => { setReportType(e.target.value); setCurrentPage(1); }}>
          <option value="emergency">Emergency Reports</option>
          <option value="user">User Reports</option>
        </select>

        <label htmlFor="fromDate">From Date:</label>
        <input type="date" id="fromDate" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />

        <label htmlFor="toDate">To Date:</label>
        <input type="date" id="toDate" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />

        {reportType === 'emergency' && (
          <>
            <label htmlFor="emergencyCategory">Emergency Category:</label>
            <select id="emergencyCategory" value={emergencyCategory} onChange={(e) => { setEmergencyCategory(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Categories</option>
              {EMERGENCY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <label htmlFor="emergencyStatus">Emergency Status:</label>
            <select id="emergencyStatus" value={emergencyStatus} onChange={(e) => { setEmergencyStatus(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Statuses</option>
              {EMERGENCY_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </>
        )}

        {reportType === 'user' && (
          <>
            <label htmlFor="userRole">User Role:</label>
            <select id="userRole" value={userRole} onChange={(e) => { setUserRole(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Roles</option>
              <option value="Farmer">Farmer</option>
              <option value="Veterinarian">Veterinarian</option>
            </select>
          </>
        )}

        <label htmlFor="locationFilter">Location:</label>
        <select id="locationFilter" value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}>
          <option value="all">All Locations</option>
          {ODISHA_DISTRICTS.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <button onClick={fetchReportData} disabled={!validateDateRange()}>Generate Report</button>
        <button onClick={handleExportCSV} disabled={reportData.length === 0}>Export CSV</button>
      </div>

      {loading && <p>Loading report data...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="report-output">
        <h3>Report Data</h3>
        {reportData.length > 0 ? (
          <>
            <table className="report-table">
              <thead>
                <tr>
                  {reportType === 'emergency' && (
                    <>
            <th>ID</th>
            <th>Date</th>
            <th>Farmer Name</th>
            <th>Vet Name</th>
            <th>Location</th>
            <th>Category</th>
            <th>Status</th>
                    </>
                  )}
{reportType === 'user' && (
  <>
    <th>ID</th>
    <th>Name</th>
    <th>Registration Date</th>
    <th>Role</th>
    <th>Location</th>
  </>
)}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(item => (
                  <tr key={item._id || item.id}>
                  {reportType === 'emergency' && (
                    <>
                      <td>{item._id || ''}</td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</td>
                      <td>{item.farmerName || ''}</td>
                      <td>{item.vetName || ''}</td>
                      <td>{item.farmerLocation || ''}</td>
                      <td>{item.category || ''}</td>
                      <td>{item.status || ''}</td>
                    </>
                  )}
{reportType === 'user' && (
  <>
    <td>{item.id || ''}</td>
    <td>{item.name || ''}</td>
    <td>{item.registrationDate ? new Date(item.registrationDate).toLocaleDateString() : ''}</td>
    <td>{item.role || ''}</td>
    <td>{item.location || ''}</td>
  </>
)}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </>
        ) : (
          <p>No data to display based on the selected filters.</p>
        )}
      </div>

      <div className="report-chart">
        <h3>Report Chart</h3>
        <Bar options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: reportType === 'emergency' ? 'Emergency Reports by Category' : 'User Reports by Role' }
          }
        }} data={chartData} />
      </div>
    </div>
  );
}

export default Reporting;

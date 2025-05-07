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
  PointElement,
  LineElement,
  LineController,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
  Filler
);

const ODISHA_DISTRICTS = [
  'BHADRAK',
  'CUTTACK',
  'PURI',
  'KHORDHA',
  'KENDRAPARA',
  'JAJPUR',
];

function EmergencyStatistics() {
  const [stats, setStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [locationFilter, setLocationFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monthlyError, setMonthlyError] = useState(null);

  const fetchStatistics = async (location) => {
    setLoading(true);
    setError(null);
    try {
      const url = location && location !== 'all' ? `/api/emergency/statistics?location=${location}` : '/api/emergency/statistics';
      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch emergency statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyStatistics = async (location) => {
    setMonthlyLoading(true);
    setMonthlyError(null);
    try {
      const url = location && location !== 'all' ? `/api/emergency/statistics/monthly?location=${location}` : '/api/emergency/statistics/monthly';
      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMonthlyStats(response.data);
    } catch (err) {
      setMonthlyError('Failed to fetch monthly emergency statistics');
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics(locationFilter);
    fetchMonthlyStatistics(locationFilter);
  }, [locationFilter]);

  // Prepare data for location-based chart
  const labels = stats.map((item) => item.location);
  const resolvedData = stats.map((item) => {
    const resolved = item.countsByStatus.find((s) => s.status.toLowerCase() === 'resolved');
    return resolved ? resolved.count : 0;
  });
  const unresolvedData = stats.map((item) => {
    const unresolved = item.countsByStatus.find((s) => s.status.toLowerCase() !== 'resolved');
    return unresolved ? unresolved.count : 0;
  });

  const locationData = {
    labels,
    datasets: [
      {
        label: 'Resolved',
        data: resolvedData,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderRadius: 5,
      },
      {
        label: 'Unresolved',
        data: unresolvedData,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderRadius: 5,
      },
    ],
  };

  const locationOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: 'Emergency Reports by Location and Status',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
          borderDash: [5, 5],
        },
        title: {
          display: true,
          text: 'Number of Reports',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Location',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  // Prepare data for monthly chart
  const sortedMonthlyStats = [...monthlyStats].sort((a, b) => {
    if (a.year === b.year) {
      return a.month - b.month;
    }
    return a.year - b.year;
  });

  const monthlyLabels = sortedMonthlyStats.map(item => `${item.year}-${item.month.toString().padStart(2, '0')}`);

  const monthlyResolvedData = sortedMonthlyStats.map(item => {
    const resolved = item.countsByStatus.find(s => s.status.toLowerCase() === 'resolved');
    return resolved ? resolved.count : 0;
  });
  const monthlyUnresolvedData = sortedMonthlyStats.map(item => {
    const unresolved = item.countsByStatus.find(s => s.status.toLowerCase() !== 'resolved');
    return unresolved ? unresolved.count : 0;
  });

  const totalReports = sortedMonthlyStats.reduce((acc, item) => acc + item.total, 0);
  const totalResolved = sortedMonthlyStats.reduce((acc, item) => {
    const resolved = item.countsByStatus.find(s => s.status.toLowerCase() === 'resolved');
    return acc + (resolved ? resolved.count : 0);
  }, 0);
  const totalUnresolved = totalReports - totalResolved;

  const monthlyData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Resolved',
        data: monthlyResolvedData,
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Unresolved',
        data: monthlyUnresolvedData,
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const monthlyOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: 'Monthly Emergency Reports by Status',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
          borderDash: [5, 5],
        },
        title: {
          display: true,
          text: 'Number of Reports',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Month',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="emergency-statistics-container">
      <h2>Emergency Statistics</h2>
      <div className="filter-controls">
        <label htmlFor="locationFilter">Filter by Location:</label>
        <select
          id="locationFilter"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="all">All Locations</option>
          {ODISHA_DISTRICTS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
      {loading && <p>Loading statistics...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <Bar data={locationData} options={locationOptions} />
      )}

      <div className="monthly-statistics-section" style={{ marginTop: '40px' }}>
        <h3>Monthly Emergency Statistics</h3>
        {monthlyLoading && <p>Loading monthly statistics...</p>}
        {monthlyError && <p style={{ color: 'red' }}>{monthlyError}</p>}
        {!monthlyLoading && !monthlyError && (
          <>
            <div className="statistics-summary" style={{ marginBottom: '20px' }}>
              <p><strong>Total Reports:</strong> {totalReports}</p>
              <p><strong>Resolved:</strong> {totalResolved}</p>
              <p><strong>Unresolved:</strong> {totalUnresolved}</p>
            </div>
            <Bar data={monthlyData} options={monthlyOptions} />
          </>
        )}
      </div>
    </div>
  );
}

export default EmergencyStatistics;

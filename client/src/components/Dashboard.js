// import React, { useState } from 'react';
// import './Dashboard.css'; // Import CSS for styling

// function Dashboard() {
//   const [activeTab, setActiveTab] = useState('home'); // Default active tab

//   // Placeholder for user role (replace with actual user role from authentication)
//   const userRole = 'farmer'; // or 'veterinarian' or 'gov_admin'

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//   };

//   // Function to render the main content based on the active tab and user role
//   const renderMainContent = () => {
//     switch (userRole) {
//       case 'farmer':
//         switch (activeTab) {
//           case 'home':
//             return <FarmerDashboardHome />;
//           case 'reportEmergency':
//             return <FarmerReportEmergency />;
//           case 'viewAnimals':
//             return <FarmerViewAnimals />;
//           case 'myReports':
//             return <FarmerMyReports />;
//           default:
//             return <FarmerDashboardHome />;
//         }
//       case 'veterinarian':
//         switch (activeTab) {
//           case 'home':
//             return <VeterinarianDashboardHome />;
//           case 'viewEmergencies':
//             return <VeterinarianViewEmergencies />;
//           case 'mySchedule':
//             return <VeterinarianMySchedule />;
//           case 'communication':
//             return <VeterinarianCommunication />;
//           default:
//             return <VeterinarianDashboardHome />;
//         }
//       case 'gov_admin':
//         switch (activeTab) {
//           case 'home':
//             return <GovAdminDashboardHome />;
//           case 'userManagement':
//             return <GovAdminUserManagement />;
//           case 'statistics':
//             return <GovAdminStatistics />;
//           case 'reports':
//             return <GovAdminReports />;
//           default:
//             return <GovAdminDashboardHome />;
//         }
//       default:
//         return <div>Please Login</div>; // Or a more appropriate message
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Header */}
//       <header className="dashboard-header">
//         <div className="logo">
//           {/* Replace with your actual logo component or image */}
//           <img src="/path/to/animal-hospitality-logo.png" alt="Animal Hospitality Logo" />
//         </div>
//         <div className="user-profile">
//           {/* Replace with actual user data */}
//           <span>Welcome, User</span>
//           <button>Logout</button>
//         </div>
//       </header>

//       {/* Sidebar/Navigation */}
//       <nav className="dashboard-sidebar">
//         {userRole === 'farmer' && (
//           <ul>
//             <li
//               className={activeTab === 'home' ? 'active' : ''}
//               onClick={() => handleTabClick('home')}
//             >
//               Home
//             </li>
//             <li
//               className={activeTab === 'reportEmergency' ? 'active' : ''}
//               onClick={() => handleTabClick('reportEmergency')}
//             >
//               Report Emergency
//             </li>
//             <li
//               className={activeTab === 'viewAnimals' ? 'active' : ''}
//               onClick={() => handleTabClick('viewAnimals')}
//             >
//               View Animals
//             </li>
//             <li
//               className={activeTab === 'myReports' ? 'active' : ''}
//               onClick={() => handleTabClick('myReports')}
//             >
//               My Reports
//             </li>
//           </ul>
//         )}
//         {userRole === 'veterinarian' && (
//           <ul>
//             <li
//               className={activeTab === 'home' ? 'active' : ''}
//               onClick={() => handleTabClick('home')}
//             >
//               Home
//             </li>
//             <li
//               className={activeTab === 'viewEmergencies' ? 'active' : ''}
//               onClick={() => handleTabClick('viewEmergencies')}
//             >
//               View Emergencies
//             </li>
//             <li
//               className={activeTab === 'mySchedule' ? 'active' : ''}
//               onClick={() => handleTabClick('mySchedule')}
//             >
//               My Schedule
//             </li>
//             <li
//               className={activeTab === 'communication' ? 'active' : ''}
//               onClick={() => handleTabClick('communication')}
//             >
//               Communication
//             </li>
//           </ul>
//         )}
//         {userRole === 'gov_admin' && (
//           <ul>
//             <li
//               className={activeTab === 'home' ? 'active' : ''}
//               onClick={() => handleTabClick('home')}
//             >
//               Home
//             </li>
//             <li
//               className={activeTab === 'userManagement' ? 'active' : ''}
//               onClick={() => handleTabClick('userManagement')}
//             >
//               User Management
//             </li>
//             <li
//               className={activeTab === 'statistics' ? 'active' : ''}
//               onClick={() => handleTabClick('statistics')}
//             >
//               Statistics
//             </li>
//             <li
//               className={activeTab === 'reports' ? 'active' : ''}
//               onClick={() => handleTabClick('reports')}
//             >
//               Reports
//             </li>
//           </ul>
//         )}
//       </nav>

//       {/* Main Content Area */}
//       <main className="dashboard-main-content">{renderMainContent()}</main>

//       {/* Footer */}
//       <footer className="dashboard-footer">
//         <p>&copy; 2024 Animal Hospitality. All rights reserved.</p>
//         {/* Add contact information here */}
//       </footer>
//     </div>
//   );
// }

// export default Dashboard;
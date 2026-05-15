import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicShowcase from './pages/PublicShowcase';
import PublicEvents from './pages/PublicEvents';
import Cinema from './pages/Cinema';
import Dashboard from './pages/Dashboard';
import Productions from './pages/Productions';
import Login from './pages/Login';
import Register from './pages/Register';
import TwoFactorAuth from './pages/TwoFactorAuth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import UserManagement from './pages/UserManagement';
import Talents from './pages/Talents';
import Scripts from './pages/Scripts';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Buyers from './pages/Buyers';
import Events from './pages/Events';
import MediaLibrary from './pages/MediaLibrary';
import MyLibrary from './pages/MyLibrary';
import Settings from './pages/Settings';
import Attendance from './pages/Attendance';
import PartnerRegistration from './pages/PartnerRegistration';
import PartnerRequests from './pages/PartnerRequests';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicShowcase />} />
        <Route path="/showcase" element={<PublicShowcase />} />
        <Route path="/showcase/:prodId" element={<PublicShowcase />} />
        <Route path="/events" element={<PublicEvents />} />
        <Route path="/watch/:mediaId" element={<Cinema />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-internal" element={<Register isInternal={true} />} />
        <Route path="/verify-2fa" element={<TwoFactorAuth />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/partner-join" element={<PartnerRegistration />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/dashboard/productions" element={<DashboardLayout><Productions /></DashboardLayout>} />
        <Route path="/dashboard/users" element={<DashboardLayout><UserManagement /></DashboardLayout>} />
        <Route path="/dashboard/talents" element={<DashboardLayout><Talents /></DashboardLayout>} />
        <Route path="/dashboard/scripts" element={<DashboardLayout><Scripts /></DashboardLayout>} />
        <Route path="/dashboard/sales" element={<DashboardLayout><Sales /></DashboardLayout>} />
        <Route path="/dashboard/expenses" element={<DashboardLayout><Expenses /></DashboardLayout>} />
        <Route path="/dashboard/buyers" element={<DashboardLayout><Buyers /></DashboardLayout>} />
        <Route path="/dashboard/partner-requests" element={<DashboardLayout><PartnerRequests /></DashboardLayout>} />
        <Route path="/dashboard/events" element={<DashboardLayout><Events /></DashboardLayout>} />
        <Route path="/dashboard/media" element={<DashboardLayout><MediaLibrary /></DashboardLayout>} />
        <Route path="/dashboard/library" element={<DashboardLayout><MyLibrary /></DashboardLayout>} />
        <Route path="/dashboard/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
        <Route path="/dashboard/attendance" element={<DashboardLayout><Attendance /></DashboardLayout>} />
      </Routes>
    </Router>
  );
}

export default App;

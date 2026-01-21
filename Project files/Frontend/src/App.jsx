import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import Workflows from './pages/Workflows';
import Review from './pages/Review';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import UserManagement from './pages/admin/UserManagement';
import AuditLogs from './pages/admin/AuditLogs';
import Analytics from './pages/admin/Analytics';
import Layout from './components/Layout'; // Assuming Layout is in components
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/tasks" element={<MyTasks />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/profile" element={<Profile />} />

                        {/* Manager/Admin/User Workflows */}
                        <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN', 'USER']} />}>
                            <Route path="/workflows" element={<Workflows />} />
                            <Route path="/admin" element={<Review />} />
                            <Route path="/admin/users" element={<UserManagement />} />
                            <Route path="/admin/audit" element={<AuditLogs />} />
                            <Route path="/admin/analytics" element={<Analytics />} />
                        </Route>

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

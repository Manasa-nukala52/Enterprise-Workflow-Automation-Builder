import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, CheckSquare, PlusCircle, LogOut, Bell, User, ShieldCheck, BarChart3 } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const navItemClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
            ? 'bg-blue-600/10 text-blue-400 font-medium shadow-sm shadow-blue-900/20'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        }`;

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0">
            <div className="p-6">
                <div className="flex items-center gap-2 text-white font-bold text-xl">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <FileText size={18} className="text-white" />
                    </div>
                    <span className="tracking-tight">WorkFlow<span className="text-blue-500">Pro</span></span>
                </div>
                <div className="mt-4 px-3 py-1.5 bg-slate-800/50 rounded-md inline-block">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {user?.role} Portal
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">

                {/* Admin Links */}
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                    <NavLink to="/admin" end className={navItemClass}>
                        <CheckSquare size={20} />
                        <span>{user?.role === 'ADMIN' ? 'Dashboard' : 'Approvals'}</span>
                    </NavLink>
                )}

                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                    <NavLink to="/admin/analytics" className={navItemClass}>
                        <BarChart3 size={20} />
                        <span>Analytics</span>
                    </NavLink>
                )}

                {user?.role === 'ADMIN' && (
                    <>
                        <NavLink to="/admin/users" className={navItemClass}>
                            <User size={20} />
                            <span>Users</span>
                        </NavLink>
                        <NavLink to="/admin/audit" className={navItemClass}>
                            <ShieldCheck size={20} />
                            <span>Audit Logs</span>
                        </NavLink>
                    </>
                )}

                {/* Workflow Management */}
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'USER') && (
                    <>
                        <div className="my-6 border-t border-slate-800/50" />
                        <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Manage</div>
                        <NavLink to="/workflows" className={navItemClass}>
                            <FileText size={20} />
                            <span>Workflows</span>
                        </NavLink>
                    </>
                )}

                {/* User Links (Requests) - Hidden for Admin */}
                {user?.role !== 'ADMIN' && (
                    <>
                        <div className="my-6 border-t border-slate-800/50" />
                        <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">My Work</div>
                        <NavLink to="/dashboard" className={navItemClass}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/tasks" className={navItemClass}>
                            <CheckSquare size={20} />
                            <span>My Tasks</span>
                        </NavLink>
                        <NavLink to="/notifications" className={navItemClass}>
                            <Bell size={20} />
                            <span>Notifications</span>
                        </NavLink>
                    </>
                )}

                {/* Settings Section (All Users) */}
                <div className="my-6 border-t border-slate-800/50" />
                <NavLink to="/profile" className={navItemClass}>
                    <User size={20} />
                    <span>Profile & Settings</span>
                </NavLink>
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-slate-800/30 rounded-lg border border-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-slate-200 flex items-center justify-center font-bold border border-slate-600">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{user?.username}</p>
                        <p className="text-xs text-slate-500 truncate capitalize">{user?.role.toLowerCase()}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div >
    );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { User, Plus, Loader2, Shield, Search, Users, UserCheck, Trash2, Edit } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Form State
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        fullName: '',
        role: 'USER'
    });

    const [creating, setCreating] = useState(false);

    // Edit Form State
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        username: '',
        fullName: '',
        password: '',
        role: 'USER'
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/users', newUser);
            setShowCreateModal(false);
            setNewUser({ username: '', password: '', fullName: '', role: 'USER' });
            fetchUsers();
        } catch (error) {
            alert('Failed to create user. Username might already exist.');
        } finally {
            setCreating(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditFormData({
            username: user.username,
            fullName: user.fullName,
            password: '', // Password intentionally empty
            role: user.role
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const updates = {
                fullName: editFormData.fullName,
                role: editFormData.role
            };
            if (editFormData.password) {
                updates.password = editFormData.password;
            }

            await api.put(`/users/${editingUser.id}`, updates);
            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('Failed to update user.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/users/${userId}`);
                fetchUsers();
            } catch (error) {
                console.error(error);
                alert('Failed to delete user.');
            }
        }
    };

    // Filter users
    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats Calculation
    const totalUsers = users.length;
    const managers = users.filter(u => u.role === 'MANAGER').length;
    const admins = users.filter(u => u.role === 'ADMIN').length;
    const employees = users.filter(u => u.role === 'USER').length;

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
                    <p className="text-slate-400">Manage system access and user roles</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} />
                    Add New User
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Users</p>
                            <h3 className="text-xl font-bold text-slate-100">{totalUsers}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Admins</p>
                            <h3 className="text-xl font-bold text-slate-100">{admins}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-500/10 rounded-lg text-orange-400">
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Managers</p>
                            <h3 className="text-xl font-bold text-slate-100">{managers}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Employees</p>
                            <h3 className="text-xl font-bold text-slate-100">{employees}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-200"
                />
            </div>

            {/* Users Table */}
            <Card className="overflow-hidden border-slate-800 bg-slate-900/50">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">User</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Role</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                            <User size={14} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-200">{user.fullName}</div>
                                            <div className="text-xs text-slate-500">@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${user.role === 'ADMIN'
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : user.role === 'MANAGER'
                                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow shadow-emerald-400/50" />
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-500/10 rounded transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-slate-100">Add New User</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                                <span className="sr-only">Close</span>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.fullName}
                                    onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="jdoe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="USER">Standard User</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-slate-100">Edit User</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-200">
                                <span className="sr-only">Close</span>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editFormData.fullName}
                                    onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Username</label>
                                <input
                                    type="text"
                                    disabled
                                    value={editFormData.username}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-500">Username cannot be changed</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">New Password (Optional)</label>
                                <input
                                    type="password"
                                    value={editFormData.password}
                                    onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="Leave blank to keep current"
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Role</label>
                                <select
                                    value={editFormData.role}
                                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="USER">Standard User</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {updating ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default UserManagement;

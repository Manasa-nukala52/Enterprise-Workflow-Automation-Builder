import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { User, Lock, Save, Loader2, Shield } from 'lucide-react';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState({ fullName: '', username: '', role: '' });

    // Password Form State
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            setUser(data);
        } catch (error) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await api.put('/users/profile', { fullName: user.fullName });
            setUser(prev => ({ ...prev, fullName: data.fullName }));
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/users/profile', { password: passwords.newPassword });
            setPasswords({ newPassword: '', confirmPassword: '' });
            setMessage({ type: 'success', text: 'Password updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update password' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <User className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Account Settings</h1>
                    <p className="text-slate-400">Manage your profile and security preferences</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg border ${message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Profile Details Card */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <User className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-semibold text-slate-200">Personal Information</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Username</label>
                            <input
                                type="text"
                                value={user.username}
                                disabled
                                className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-600">Username cannot be changed</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Role</label>
                            <input
                                type="text"
                                value={user.role}
                                disabled
                                className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Full Name</label>
                            <input
                                type="text"
                                value={user.fullName}
                                onChange={(e) => setUser(prev => ({ ...prev, fullName: e.target.value }))}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Card>

                {/* Security Card */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <Shield className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-semibold text-slate-200">Security</h2>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">New Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pl-10"
                                    placeholder="Enter new password"
                                />
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pl-10"
                                    placeholder="Confirm new password"
                                />
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving || !passwords.newPassword}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Profile;

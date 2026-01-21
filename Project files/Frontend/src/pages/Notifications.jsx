import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Loader2, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            // Update local state to reflect read status
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <Bell size={24} />
                </div>
                <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 && (
                    <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                        <Bell size={48} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-slate-500">No notifications yet.</p>
                    </div>
                )}

                {notifications.map(notification => (
                    <Card
                        key={notification.id}
                        className={`transition-all duration-200 border-l-4 ${notification.read ? 'border-slate-800 bg-slate-950/30' : 'border-blue-500 bg-slate-900 shadow-lg shadow-blue-900/10'}`}
                    >
                        <CardContent className="p-6 flex gap-4 items-start">
                            <div className={`pt-1 ${notification.read ? 'text-slate-500' : 'text-blue-400'}`}>
                                {notification.message.includes('APPROVED') ? <CheckCircle2 size={20} className="text-emerald-400" /> :
                                    notification.message.includes('REJECTED') ? <AlertCircle size={20} className="text-rose-400" /> :
                                        <Bell size={20} />}
                            </div>
                            <div className="flex-1">
                                <p className={`text-base ${notification.read ? 'text-slate-400' : 'text-slate-200 font-medium'}`}>
                                    {notification.message}
                                </p>
                                <p className="text-xs text-slate-600 mt-2">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {!notification.read && (
                                <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="px-3 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-full transition-colors"
                                >
                                    Mark as read
                                </button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Notifications;

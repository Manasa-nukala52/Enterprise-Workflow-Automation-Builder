import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Clock, CheckCircle2, XCircle, Loader2, Activity } from 'lucide-react';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/instances/my');
            setTasks(data);

            // If modal is open, also update the selectedTask from the new data
            if (selectedTask) {
                const updatedTask = data.find(t => t.id === selectedTask.id);
                if (updatedTask) setSelectedTask(updatedTask);
            }
        } catch (error) {
            console.error("Error fetching tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        // Live polling every 3 seconds to keep status updated
        const interval = setInterval(fetchTasks, 3000);
        return () => clearInterval(interval);
    }, [selectedTask]); // Depend on selectedTask to ensure the updatedTask logic works correctly with fresh state

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'REJECTED': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle2 size={16} />;
            case 'REJECTED': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-100">My Tasks History</h1>

            <Card className="overflow-hidden border-slate-800 bg-slate-900/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">ID</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Workflow</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Description</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Submitted At</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Remarks</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {tasks.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No history found</td></tr>
                            )}
                            {tasks.map(task => (
                                <tr key={task.id} className="bg-slate-900/20 hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-400">#{task.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-200">{task.workflowTitle}</td>
                                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={task.description}>
                                        {task.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(task.submittedAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                                            {getStatusIcon(task.status)}
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{task.remarks || '-'}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => {
                                                setSelectedTask(task);
                                                setShowTrackingModal(true);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium transition-colors border border-blue-500/20"
                                        >
                                            <Activity size={14} /> Track
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {/* Tracking Modal */}
            {showTrackingModal && selectedTask && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-100">Request Timeline</h2>
                                <p className="text-slate-400 text-sm">Tracking #{selectedTask.id}</p>
                            </div>
                            <button onClick={() => setShowTrackingModal(false)} className="text-slate-400 hover:text-slate-200">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="relative space-y-8 pl-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-slate-800">

                            {/* Step 1: Submitted */}
                            <div className="relative">
                                <div className="absolute -left-[41px] bg-emerald-900 ring-4 ring-slate-900 rounded-full p-1 text-emerald-400">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <h3 className="text-slate-200 font-medium text-sm">Request Submitted</h3>
                                    <p className="text-slate-500 text-xs mt-1">{new Date(selectedTask.submittedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Step 2: Under Review */}
                            <div className="relative">
                                <div className={`absolute -left-[41px] ring-4 ring-slate-900 rounded-full p-1 ${selectedTask.status === 'PENDING' ? 'bg-blue-900 text-blue-400 animate-pulse' : 'bg-emerald-900 text-emerald-400'
                                    }`}>
                                    {selectedTask.status === 'PENDING' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                                </div>
                                <div>
                                    <h3 className={`font-medium text-sm ${selectedTask.status === 'PENDING' ? 'text-blue-400' : 'text-slate-200'}`}>
                                        Under Review
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1">Admin is reviewing details</p>
                                </div>
                            </div>

                            {/* Step 3: Final Status */}
                            <div className="relative">
                                <div className={`absolute -left-[41px] ring-4 ring-slate-900 rounded-full p-1 ${selectedTask.status === 'PENDING' ? 'bg-slate-800 text-slate-500' :
                                    selectedTask.status === 'APPROVED' ? 'bg-emerald-900 text-emerald-400' :
                                        'bg-rose-900 text-rose-400'
                                    }`}>
                                    {selectedTask.status === 'PENDING' ? <div className="w-4 h-4 rounded-full border-2 border-slate-600" /> :
                                        selectedTask.status === 'APPROVED' ? <CheckCircle2 size={16} /> :
                                            <XCircle size={16} />}
                                </div>
                                <div>
                                    <h3 className={`font-medium text-sm ${selectedTask.status === 'PENDING' ? 'text-slate-500' :
                                        selectedTask.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                        {selectedTask.status === 'PENDING' ? 'Final Decision' :
                                            selectedTask.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                                    </h3>
                                    {selectedTask.status !== 'PENDING' && (
                                        <p className="text-slate-500 text-xs mt-1">
                                            {selectedTask.remarks || 'No remarks provided'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTasks;

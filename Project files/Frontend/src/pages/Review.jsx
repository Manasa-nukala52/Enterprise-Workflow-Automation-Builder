import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Check, X, Loader2, Activity, CheckCircle2, Clock, XCircle, Search, Filter, Calendar, RotateCcw, Paperclip } from 'lucide-react';

const Review = () => {
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInstance, setSelectedInstance] = useState(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        query: '',
        status: '',
        date: '',
        owner: ''
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInstances();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [filters]);

    const fetchInstances = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.query) params.append('query', filters.query);
            if (filters.date) params.append('date', filters.date);
            if (filters.owner) params.append('owner', filters.owner);

            const { data } = await api.get(`/instances/all?${params.toString()}`);
            setInstances(data);
        } catch (error) {
            console.error("Failed to fetch instances");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        const remarks = prompt(`Enter remarks for ${status} (optional):`) || "";
        try {
            await api.put(`/instances/${id}/status`, { status, remarks });
            fetchInstances();
        } catch (error) {
            alert("Action failed");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-100">Review Requests</h1>

                {/* Search & Filters Bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search description..."
                            className="bg-slate-900 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all w-64"
                            value={filters.query}
                            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                        />
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Owner name..."
                            className="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2 rounded-lg outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all w-48"
                            value={filters.owner}
                            onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
                        />
                    </div>

                    <select
                        className="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2 rounded-lg outline-none focus:border-blue-500/50 cursor-pointer"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CHANGES_REQUESTED">Changes Requested</option>
                    </select>

                    <input
                        type="date"
                        className="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2 rounded-lg outline-none focus:border-blue-500/50 cursor-pointer"
                        value={filters.date}
                        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    />

                    <button
                        onClick={() => setFilters({ query: '', status: '', date: '', owner: '' })}
                        className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
                        title="Reset Filters"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            <Card className="overflow-hidden border-slate-800 bg-slate-900/50">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">ID</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">User</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Workflow</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Priority</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Due Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {instances.map(inst => (
                            <tr key={inst.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-400">#{inst.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-200">{inst.applicantName}</td>
                                <td className="px-6 py-4 text-slate-400">{inst.workflowTitle}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${inst.status === 'PENDING' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                                        inst.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                                            'text-rose-400 bg-rose-400/10 border-rose-400/20'
                                        }`}>
                                        {inst.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${inst.priority === 'HIGH' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                                        inst.priority === 'MEDIUM' ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' :
                                            inst.priority === 'LOW' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                                                'text-slate-500 bg-slate-500/10 border-slate-500/20'
                                        }`}>
                                        {inst.priority || 'NORMAL'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{new Date(inst.submittedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setSelectedInstance(inst);
                                            setShowTrackingModal(true);
                                        }}
                                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors mr-2"
                                        title="Track"
                                    >
                                        <Activity size={16} />
                                    </button>
                                    {inst.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(inst.id, 'APPROVED')}
                                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                                                title="Approve"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(inst.id, 'REJECTED')}
                                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                                                title="Reject"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Tracking Modal */}
            {showTrackingModal && selectedInstance && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-100">Workflow Timeline</h2>
                                <p className="text-slate-400 text-sm">Monitoring #{selectedInstance.id}</p>
                            </div>
                            <button onClick={() => setShowTrackingModal(false)} className="text-slate-400 hover:text-slate-200">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="relative space-y-8 pl-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-slate-800">

                            {/* Step 1: Same as User Side - Submitted */}
                            <div className="relative">
                                <div className="absolute -left-[41px] bg-emerald-900 ring-4 ring-slate-900 rounded-full p-1 text-emerald-400">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <h3 className="text-slate-200 font-medium text-sm">Request Submitted</h3>
                                    <p className="text-slate-500 text-xs mt-1">{new Date(selectedInstance.submittedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Step 2: Under Review */}
                            <div className="relative">
                                <div className={`absolute -left-[41px] ring-4 ring-slate-900 rounded-full p-1 ${selectedInstance.status === 'PENDING' ? 'bg-blue-900 text-blue-400 animate-pulse' : 'bg-emerald-900 text-emerald-400'
                                    }`}>
                                    {selectedInstance.status === 'PENDING' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                                </div>
                                <div>
                                    <h3 className={`font-medium text-sm ${selectedInstance.status === 'PENDING' ? 'text-blue-400' : 'text-slate-200'}`}>
                                        Under Review
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1">Pending Admin API Action</p>
                                </div>
                            </div>

                            {/* Step 3: Final Status */}
                            <div className="relative">
                                <div className={`absolute -left-[41px] ring-4 ring-slate-900 rounded-full p-1 ${selectedInstance.status === 'PENDING' ? 'bg-slate-800 text-slate-500' :
                                    selectedInstance.status === 'APPROVED' ? 'bg-emerald-900 text-emerald-400' :
                                        'bg-rose-900 text-rose-400'
                                    }`}>
                                    {selectedInstance.status === 'PENDING' ? <div className="w-4 h-4 rounded-full border-2 border-slate-600" /> :
                                        selectedInstance.status === 'APPROVED' ? <CheckCircle2 size={16} /> :
                                            <XCircle size={16} />}
                                </div>
                                <div>
                                    <h3 className={`font-medium text-sm ${selectedInstance.status === 'PENDING' ? 'text-slate-500' :
                                        selectedInstance.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                        {selectedInstance.status === 'PENDING' ? 'Final Decision' :
                                            selectedInstance.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                                    </h3>
                                    {selectedInstance.status !== 'PENDING' && (
                                        <p className="text-slate-500 text-xs mt-1">
                                            {selectedInstance.remarks || 'No remarks provided'}
                                        </p>
                                    )}

                                    {/* Attachments Section in Timeline */}
                                    {selectedInstance.attachments && selectedInstance.attachments.length > 0 && (
                                        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-800">
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <Paperclip size={10} />
                                                Attachments
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedInstance.attachments.map(file => (
                                                    <a
                                                        key={file.id}
                                                        href={`${api.defaults.baseURL}/files/download/${file.id}`}
                                                        className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 transition-colors group"
                                                    >
                                                        <span className="truncate pr-2">{file.fileName}</span>
                                                        <span className="text-[9px] text-slate-600 group-hover:text-slate-400">{(file.fileSize / 1024).toFixed(1)} KB</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
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

export default Review;

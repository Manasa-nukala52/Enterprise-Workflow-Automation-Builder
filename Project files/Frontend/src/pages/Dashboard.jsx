import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Loader2, PlayCircle, Clock, CheckCircle2, XCircle, LayoutDashboard, Paperclip, Download } from 'lucide-react';
import FileUploader from '../components/FileUploader';

const Dashboard = () => {
    const [myInstances, setMyInstances] = useState([]);
    const [availableWorkflows, setAvailableWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [createdInstanceId, setCreatedInstanceId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [workflowsRes, instancesRes] = await Promise.all([
                api.get('/workflows'),
                api.get('/instances/my')
            ]);
            setAvailableWorkflows(workflowsRes.data);
            setMyInstances(instancesRes.data);
        } catch (error) {
            console.error("Error loading dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                workflowId: selectedWorkflow,
                description: description,
                priority: priority,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null
            };

            const response = await api.post('/instances', payload);
            setCreatedInstanceId(response.data.id);

            setDescription('');
            setPriority('MEDIUM');
            setDueDate('');
            setSuccessMessage('Request submitted! Now you can attach documents below.');
            setTimeout(() => setSuccessMessage(''), 5000);
            fetchData();
        } catch (error) {
            alert("Failed to start workflow");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownload = async (file) => {
        try {
            const response = await api.get(`/files/download/${file.id}`, {
                responseType: 'blob'
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download file. You may not have permission.");
        }
    };


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

    // Calculate Summary Metrics
    const pendingCount = myInstances.filter(i => i.status === 'PENDING').length;
    const approvedCount = myInstances.filter(i => i.status === 'APPROVED').length;
    const totalRequests = myInstances.length;

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="space-y-8">

            {/* Success Message Banner */}
            {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/50 border-slate-800 p-6 flex items-center gap-4 hover:border-blue-500/30 transition-colors">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Total Requests</p>
                        <h3 className="text-2xl font-bold text-slate-100">{totalRequests}</h3>
                    </div>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 p-6 flex items-center gap-4 hover:border-amber-500/30 transition-colors">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Pending Approval</p>
                        <h3 className="text-2xl font-bold text-slate-100">{pendingCount}</h3>
                    </div>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 p-6 flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Approved</p>
                        <h3 className="text-2xl font-bold text-slate-100">{approvedCount}</h3>
                    </div>
                </Card>
            </div>

            <section>
                <h2 className="text-xl font-bold text-slate-100 mb-4">Start New Workflow</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availableWorkflows.length === 0 && <p className="text-slate-500 py-8 text-center col-span-3 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">No workflows available.</p>}
                    {availableWorkflows.map(wf => (
                        <Card key={wf.id} className="hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="flex flex-col h-full relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg text-slate-100 group-hover:text-blue-400 transition-colors">{wf.title}</h3>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">Active</span>
                                </div>
                                <p className="text-slate-400 text-sm flex-1 mb-6 leading-relaxed">{wf.description}</p>
                                <button
                                    onClick={() => {
                                        setSelectedWorkflow(wf.id);
                                        setShowModal(true);
                                        setCreatedInstanceId(null);
                                    }}
                                    className="w-full mt-auto bg-slate-800 border border-slate-700 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg group-hover:shadow-blue-900/20"
                                >
                                    <PlayCircle size={16} /> Create Request
                                </button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-100 mb-4">My History</h2>
                <Card className="overflow-hidden border-slate-800 bg-slate-900/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold tracking-wider">ID</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Workflow</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Submitted At</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Attachments</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {myInstances.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No records found</td></tr>
                                )}
                                {myInstances.map(instance => (
                                    <tr key={instance.id} className="bg-slate-900/20 hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-400">#{instance.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-200">{instance.workflowTitle}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(instance.submittedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(instance.status)}`}>
                                                {getStatusIcon(instance.status)}
                                                {instance.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {instance.attachments && instance.attachments.map(file => (
                                                    <button
                                                        key={file.id}
                                                        onClick={() => handleDownload(file)}
                                                        className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors text-left"
                                                    >
                                                        <Paperclip size={10} />
                                                        <span className="truncate max-w-[100px] hover:underline">{file.fileName}</span>
                                                    </button>
                                                ))}
                                                {(!instance.attachments || instance.attachments.length === 0) && (
                                                    <span className="text-slate-600 text-[10px]">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 italic">
                                            {instance.remarks || 'Awaiting approval'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </section>

            {/* Description Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h2 className="text-xl font-bold text-slate-100">
                                    {!createdInstanceId ? 'Submit Workflow Request' : 'Enhance Your Request'}
                                </h2>
                                <div className="flex gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-tighter uppercase ${!createdInstanceId ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        Step 1: Details
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-tighter uppercase ${createdInstanceId ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        Step 2: Attachments
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); setCreatedInstanceId(null); }}
                                className="text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        {!createdInstanceId && <p className="text-slate-400 text-sm mb-6">Provide a comprehensive reason for this request.</p>}

                        {!createdInstanceId ? (
                            <form onSubmit={handleCreateRequest} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-200"
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-200 color-scheme-dark"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description / Reason</label>
                                    <textarea
                                        required
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 text-slate-200 placeholder-slate-600 resize-none"
                                        placeholder="Please describe why you are making this request..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); setCreatedInstanceId(null); }}
                                        className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-2 animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                                    <CheckCircle2 size={24} />
                                    <div>
                                        <p className="font-bold text-sm">Request Created Successfully!</p>
                                        <p className="text-xs opacity-80">Reference ID: #{createdInstanceId}</p>
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                                    <Paperclip size={16} className="text-blue-500" />
                                    Add Supporting Documents (Optional)
                                </h3>

                                <FileUploader
                                    instanceId={createdInstanceId}
                                    onUploadSuccess={fetchData}
                                />

                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setCreatedInstanceId(null);
                                        }}
                                        className="px-8 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all font-bold text-sm shadow-xl"
                                    >
                                        I'm Done, Return to Dashboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

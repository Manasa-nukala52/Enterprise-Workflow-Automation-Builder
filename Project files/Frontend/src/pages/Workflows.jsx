import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Plus, Loader2 } from 'lucide-react';

const Workflows = () => {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '' });

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const { data } = await api.get('/workflows');
            setWorkflows(data);
        } catch (error) {
            console.error('Failed to fetch workflows', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/workflows', formData);
            setShowModal(false);
            setFormData({ title: '', description: '' });
            fetchWorkflows();
        } catch (error) {
            alert('Failed to create workflow');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Workflow Definitions</h1>
                    <p className="text-slate-400">Manage and create new workflow templates</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/25"
                >
                    <Plus size={20} />
                    <span>Create Workflow</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workflows.map((wf) => (
                        <Card key={wf.id} className="hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all duration-300">
                            <CardHeader title={wf.title} />
                            <CardContent>
                                <p className="text-slate-400 mb-4 h-12 line-clamp-2">{wf.description}</p>
                                <div className="flex justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                                    <span>By: {wf.createdBy}</span>
                                    <span>{new Date(wf.createdAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Simple Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4 text-slate-100">Create New Workflow</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-200"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 text-slate-200 placeholder-slate-600"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 text-sm font-bold"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workflows;

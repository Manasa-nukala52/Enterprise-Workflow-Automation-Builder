import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Loader2, ShieldCheck, User, Clock, Info } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/admin/audit-logs');
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch audit logs");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-slate-400 animate-pulse">Loading secure audit trail...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" size={28} />
                        Audit Trail
                    </h1>
                    <p className="text-slate-400">Read-only record of all system activities</p>
                </div>
                <div className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs font-mono text-slate-400">
                    {logs.length} Total activities recorded
                </div>
            </div>

            <Card className="overflow-hidden border-slate-800 bg-slate-900/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Actor</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Action</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">
                                        No logs found in the system.
                                    </td>
                                </tr>
                            ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={14} />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-200 flex items-center gap-1.5">
                                                <User size={14} className="text-blue-400" />
                                                {log.actorName}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                {log.actorRole}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${log.action.includes('SUBMIT') ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                                            log.action.includes('UPDATE') ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                                                log.action.includes('USER') ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                                                    'text-slate-400 bg-slate-400/10 border-slate-400/20'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 max-w-md">
                                        <div className="flex items-start gap-2">
                                            <Info size={14} className="mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2 hover:line-clamp-none cursor-help">
                                                {log.details}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AuditLogs;

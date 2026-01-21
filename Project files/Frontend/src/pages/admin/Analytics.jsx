import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Activity, Clock, CheckCircle2, AlertCircle, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/admin/analytics');
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!data) return <div>Failed to load data</div>;

    // Helper for Pie Chart implementation using CSS gradients
    const statusData = Object.entries(data.statusDistribution).map(([name, value]) => ({ name, value }));
    const totalStatusValue = statusData.reduce((acc, curr) => acc + curr.value, 0);

    let currentPercentage = 0;
    const gradientParts = statusData.map((d, i) => {
        const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];
        const percentage = (d.value / totalStatusValue) * 100;
        const start = currentPercentage;
        currentPercentage += percentage;
        return `${colors[i % colors.length]} ${start}% ${currentPercentage}%`;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BarChart3 className="text-blue-500" />
                    Reports & Analytics
                </h1>
                <p className="text-slate-400 mt-1">System-wide workflow performance and bottlenecks</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <SummaryCard
                    icon={<Activity size={20} />}
                    color="blue"
                    value={data.summary.totalWorkflows}
                    label="Total Requests"
                />
                <SummaryCard
                    icon={<CheckCircle2 size={20} />}
                    color="emerald"
                    value={`${data.summary.completionRate.toFixed(1)}%`}
                    label="Success Rate"
                />
                <SummaryCard
                    icon={<Clock size={20} />}
                    color="orange"
                    value={`${data.summary.averageCompletionTimeHours.toFixed(1)}h`}
                    label="Avg Completion Time"
                />
                <SummaryCard
                    icon={<AlertCircle size={20} />}
                    color="purple"
                    value={data.summary.totalPending}
                    label="Pending Review"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution - Pure CSS Donut Chart */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-blue-500" />
                        Workflow Status
                    </h3>
                    <div className="flex flex-col items-center">
                        <div
                            className="relative w-48 h-48 rounded-full border-4 border-slate-800"
                            style={{
                                background: `conic-gradient(${gradientParts.join(', ')})`
                            }}
                        >
                            <div className="absolute inset-4 bg-slate-900 rounded-full flex flex-center items-center justify-center border-4 border-slate-800 shadow-inner">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{totalStatusValue}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4 w-full px-4">
                            {statusData.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][i % 5] }}></div>
                                    <span className="text-slate-400 capitalize">{d.name.toLowerCase().replace('_', ' ')}:</span>
                                    <span className="text-white font-medium">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Daily Volume Visualizer - Pure CSS Sparklines */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" />
                        7-Day Volume Trend
                    </h3>
                    <div className="h-48 flex items-end gap-2 px-2 border-b border-l border-slate-800">
                        {data.trends.map((t, i) => {
                            const maxVal = Math.max(...data.trends.map(x => x.submittedCount), 1);
                            const height = (t.submittedCount / maxVal) * 100;
                            return (
                                <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                                    <div
                                        className="w-full bg-blue-600/40 border-t border-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-500/60"
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {t.date}: {t.submittedCount} reqs
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-6 text-[10px] text-slate-500 rotate-45 origin-left whitespace-nowrap">
                                        {t.date}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-12 flex items-center gap-4 text-[10px] uppercase font-bold text-slate-500 px-4">
                        <div className="flex items-center gap-1.5 ">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            New Submissions
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottleneck Analysis - Pure CSS Horizontal Bars */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-500" />
                    Bottleneck Analysis (Avg. Completion Time)
                </h3>
                <div className="space-y-6">
                    {data.performance.map((p, i) => {
                        const maxTime = Math.max(...data.performance.map(x => x.averageTimeHours), 1);
                        const width = (p.averageTimeHours / maxTime) * 100;
                        const barColor = p.bottleneckRisk === 'HIGH' ? 'bg-red-500' : p.bottleneckRisk === 'MEDIUM' ? 'bg-orange-500' : 'bg-blue-500';

                        return (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-slate-300 font-medium">{p.workflowTitle}</span>
                                    <span className="text-slate-500">{p.averageTimeHours.toFixed(1)} hours avg</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                                        style={{ width: `${width}%` }}
                                    ></div>
                                </div>
                                {p.bottleneckRisk === 'HIGH' && (
                                    <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold uppercase tracking-wider">
                                        <AlertCircle size={10} />
                                        Critical Bottleneck
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {data.performance.length === 0 && (
                        <div className="text-center py-8 text-slate-500 italic">No historical data available for analysis.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ icon, color, value, label }) => {
    const colorMap = {
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    };

    return (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors group">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${colorMap[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
            <div className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1">{label}</div>
        </div>
    );
};

export default Analytics;

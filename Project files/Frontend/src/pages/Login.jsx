import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, Activity } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const result = await login(username, password);
        if (result.success) {
            if (result.role === 'ADMIN' || result.role === 'MANAGER') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">

            {/* Ambient Background - Gradient Mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Animated Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse delay-1000" />

            <div className="w-full max-w-md p-6 relative z-10">

                {/* Glass Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl ring-1 ring-white/10">

                    {/* Brand Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20 shadow-lg mb-4">
                            <Activity className="text-white w-7 h-7" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Workflow<span className="text-blue-500">Pro</span></h1>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">Welcome back</h2>
                        <p className="text-slate-400 text-sm">Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-100 placeholder-slate-600 outline-none transition-all"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-100 placeholder-slate-600 outline-none transition-all pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <Lock className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 mt-4"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Authenticating...</span>
                            ) : (
                                <>
                                    Sign In <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                </div>

                {/* Scrolling Quotation Ticker - More Visible & Between Form/Footer */}
                <div className="my-8 w-full overflow-hidden relative bg-slate-800/30 border-y border-white/5 py-3">
                    <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] flex gap-12 text-sm text-slate-300 font-medium tracking-wide">
                        <span>"Efficiency is doing things right; effectiveness is doing the right things."</span>
                        <span className="text-blue-500">•</span>
                        <span>"Automation is cost cutting by tightening the corners and not cutting them."</span>
                        <span className="text-blue-500">•</span>
                        <span>"The best way to predict the future is to create it."</span>
                        <span className="text-blue-500">•</span>
                        <span>"Simplicity is the soul of efficiency."</span>
                    </div>
                    {/* Gradient masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-xs">
                        &copy; 2026 Enterprise Workflow Systems.
                    </p>
                </div>
            </div>

            {/* Add custom animation style in-line for simplicity */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

export default Login;

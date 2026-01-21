import React from 'react';

export const Card = ({ children, className = '' }) => (
    <div className={`bg-slate-900 rounded-xl border border-slate-800 shadow-xl ${className}`}>
        {children}
    </div>
);

export const CardHeader = ({ title, description }) => (
    <div className="px-6 py-4 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

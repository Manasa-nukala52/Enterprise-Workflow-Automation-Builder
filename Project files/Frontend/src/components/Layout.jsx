import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />
            <div className="ml-64 p-8 flex flex-col min-h-screen">
                <div className="max-w-6xl mx-auto flex-1 w-full">
                    <Outlet />
                </div>
                <div className="max-w-6xl mx-auto w-full pt-12 pb-4 text-center">
                    <p className="text-slate-600 text-xs text-center border-t border-slate-800/50 pt-6">
                        &copy; 2026 Enterprise Workflow Automation System. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Layout;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, LogOut, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const salesRep = useStore((state) => state.salesRep);
    const logout = useStore((state) => state.logout);
    const [showLogout, setShowLogout] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/leads', icon: Users, label: 'Leads' },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center">
            {/* Limit max width to match the App container */}
            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md border-t border-slate-200/50 flex justify-around items-center p-3 pb-6 sm:pb-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sm:rounded-t-3xl">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center w-16 gap-1 transition-all duration-300 ${isActive ? 'text-brand scale-110' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className={`p-2 rounded-xl ${isActive ? 'bg-brand/10' : 'bg-transparent'}`}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}

                {/* Visual divider */}
                <div className="w-px h-10 bg-slate-200 mx-2"></div>

                {/* Profile / Hidden Logout */}
                <div className="relative flex flex-col items-center justify-center w-16 gap-1">
                    {/* Logout Popover */}
                    {showLogout && (
                        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-slate-100 p-2 min-w-[120px] animate-fade-in origin-bottom">
                            <div className="text-center mb-2 pb-2 border-b border-slate-100">
                                <p className="text-[10px] text-slate-400 capitalize truncate px-2">{salesRep}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                            {/* Triangle Arrow */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-100 rotate-45"></div>
                        </div>
                    )}

                    <button
                        onClick={() => setShowLogout(!showLogout)}
                        className={`p-2 rounded-full transition-colors border-2 ${showLogout ? 'border-brand bg-brand/5' : 'border-transparent bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
                    >
                        {/* Jika ada inisial nama, bisa pakai huruf pertama, tapi kita pakai User icon standar saja */}
                        <User size={20} className={showLogout ? 'text-brand' : ''} />
                    </button>
                    <span className="text-[10px] font-medium opacity-70 text-slate-400">Profile</span>
                </div>
            </div>
        </div>
    );
}

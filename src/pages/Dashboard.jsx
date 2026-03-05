import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { UserPlus, BookOpen, LogOut, Users } from 'lucide-react';

export default function Dashboard() {
    const salesRep = useStore((state) => state.salesRep);
    const logout = useStore((state) => state.logout);
    const leads = useStore((state) => state.leads);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen p-4 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 glass-card p-4">
                <div>
                    <p className="text-sm text-slate-500">Selamat datang, Sales</p>
                    <h1 className="text-xl font-bold text-slate-800 capitalize">{salesRep}</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Main Actions */}
            <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2 text-center">Menu Utama</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
                <button
                    onClick={() => navigate('/add-lead')}
                    className="glass-card p-6 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                        <UserPlus size={28} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800">1. Tambah Lead Baru</h3>
                        <p className="text-sm text-slate-500">Daftarkan anak & orang tua baru</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/select-class')}
                    className="glass-card p-6 flex items-center gap-4 text-left hover:scale-[1.02] transition-transform group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <BookOpen size={28} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800">2. Pilih Kelas & Bayar</h3>
                        <p className="text-sm text-slate-500">Proses lead yang sudah terdaftar</p>
                    </div>
                </button>
            </div>

        </div>
    );
}

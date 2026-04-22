import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { UserPlus, BookOpen, AlertCircle, ChevronRight, Loader2, Info, FileWarning } from 'lucide-react';

export default function Dashboard() {
    const salesRep = useStore((state) => state.salesRep);
    const assignments = useStore((state) => state.assignments);
    const navigate = useNavigate();

    const [unassignedLeads, setUnassignedLeads] = useState([]);
    const [incompleteLeads, setIncompleteLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPendingAssignments = async () => {
            if (!salesRep) return;
            setIsLoading(true);
            try {
                // Ambil SEMUA data lead
                const { data, error } = await supabase
                    .from('leads')
                    .select('id, created_at, child_name, is_paid')
                    .eq('sales_rep', salesRep);

                if (error) throw error;
                
                if (data) {
                    // Leads yang belum lunas (Data belum lengkap)
                    const incomplete = data.filter(lead => !lead.is_paid);
                    setIncompleteLeads(incomplete);

                    // Leads yang sudah lunas TAPI belum masuk grup
                    const pending = data.filter(lead => lead.is_paid && !assignments[lead.id]);
                    setUnassignedLeads(pending);
                }
            } catch (err) {
                console.error("Error fetching pending assignments:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingAssignments();
    }, [salesRep, assignments]);

    return (
        <div className="min-h-screen p-4 pb-20 animate-fade-in bg-slate-50/50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 glass-card p-5">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Selamat datang,</p>
                    <h1 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
                        <span className="bg-brand/10 text-brand px-3 py-1 rounded-lg text-lg">{salesRep}</span>
                    </h1>
                </div>
            </div>

            {/* Reminder Banner for Incomplete Leads */}
            {!isLoading && incompleteLeads.length > 0 && (
                <div 
                    onClick={() => navigate('/select-class')}
                    className="mb-4 p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-md transition-all flex items-start sm:items-center justify-between gap-4 bg-orange-50 border-orange-500"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full shrink-0 bg-orange-100 text-orange-600">
                            <FileWarning size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-orange-700">
                                Data Belum Lengkap!
                            </h3>
                            <p className="text-xs text-orange-600 mt-1 max-w-sm">
                                Ada <strong>{incompleteLeads.length} leads</strong> yang datanya belum lengkap (belum pilih kelas & bayar). Klik untuk memprosesnya.
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex shrink-0 text-orange-400">
                        <ChevronRight size={20} />
                    </div>
                </div>
            )}

            {/* Reminder Banner for Unassigned Leads */}
            {!isLoading && unassignedLeads.length > 0 && (
                <div 
                    onClick={() => navigate('/assign-group')}
                    className="mb-8 p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-md transition-all flex items-start sm:items-center justify-between gap-4 bg-sky-50 border-sky-400"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full shrink-0 bg-sky-100 text-sky-600">
                            <Info size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-sky-700">
                                Info Pembagian Grup
                            </h3>
                            <p className="text-xs text-sky-600 mt-1 max-w-sm">
                                Ada <strong>{unassignedLeads.length} leads lunas</strong> yang belum dibagi ke dalam grup. Klik di sini untuk membaginya sekarang.
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex shrink-0 text-sky-400">
                        <ChevronRight size={20} />
                    </div>
                </div>
            )}

            {/* Main Actions */}
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">Menu Utama</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
                <button
                    onClick={() => navigate('/add-lead')}
                    className="glass-card p-5 flex items-center gap-4 text-left border border-slate-200 hover:border-brand/30 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex flex-shrink-0 items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">1. Tambah Lead Baru</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Daftarkan peserta pameran baru ke sistem</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/select-class')}
                    className="glass-card p-5 flex items-center gap-4 text-left border border-slate-200 hover:border-orange-500/30 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex flex-shrink-0 items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">2. Pilih Kelas & Bayar</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Selesaikan transaksi lead yang sudah terdaftar</p>
                    </div>
                </button>
            </div>

        </div>
    );
}

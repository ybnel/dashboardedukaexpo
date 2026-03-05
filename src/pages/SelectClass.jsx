import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { MOCK_CLASSES } from '../data/mockData';
import { ArrowLeft, UserCheck, Calendar, MapPin, DollarSign, ChevronRight } from 'lucide-react';

export default function SelectClass() {
    const [selectedLead, setSelectedLead] = useState('');
    const [classPath, setClassPath] = useState(null); // 'flexible' or 'fixed'
    const [selectedClassId, setSelectedClassId] = useState('');

    const leads = useStore((state) => state.leads);
    const startCheckout = useStore((state) => state.startCheckout);
    const navigate = useNavigate();

    const handleProceed = () => {
        if (!selectedLead || !selectedClassId) return;

        // Trigger Checkout Flow
        const cls = MOCK_CLASSES.find(c => c.id === selectedClassId);
        startCheckout(selectedLead, cls);
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen p-4 pb-32 animate-fade-in relative">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pt-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full shadow-sm transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800">Pilih Kelas</h1>
            </div>

            <div className="space-y-6">
                {/* Step 1: Select Student */}
                <div className="glass-card p-6">
                    <label className="block text-sm font-medium text-slate-700 mb-4">
                        <div className="flex items-center gap-2">
                            <UserCheck size={18} className="text-brand" />
                            1. Pilih Pendaftar (Lead)
                        </div>
                    </label>
                    {leads.length === 0 ? (
                        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl text-sm border border-yellow-200">
                            Belum ada pendaftar tersimpan. Silakan tambah pendaftar baru dari Dashboard.
                        </div>
                    ) : (
                        <select
                            value={selectedLead}
                            onChange={(e) => setSelectedLead(e.target.value)}
                            className="input-field cursor-pointer bg-slate-50 border-slate-200"
                        >
                            <option value="">-- Pilih Siswa --</option>
                            {leads.map((lead) => (
                                <option key={lead.id} value={lead.id}>
                                    {lead.childName} ({lead.id})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Step 2: Select Path (Only visible if lead is selected) */}
                {selectedLead && (
                    <div className="glass-card p-6 animate-slide-up">
                        <label className="block text-sm font-medium text-slate-700 mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-orange-500" />
                                2. Metode Penjadwalan
                            </div>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => { setClassPath('flexible'); setSelectedClassId('c4') }}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${classPath === 'flexible' ? 'border-brand bg-brand/5' : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="font-semibold text-slate-800 mb-1">Jadwal Menyusul</div>
                                <div className="text-sm text-slate-500">Orang tua akan dihubungi untuk jadwal pasti. (Flexible Schedule)</div>
                            </button>

                            <button
                                onClick={() => { setClassPath('fixed'); setSelectedClassId('') }}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${classPath === 'fixed' ? 'border-brand bg-brand/5' : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="font-semibold text-slate-800 mb-1">Pilih Jadwal Pasti</div>
                                <div className="text-sm text-slate-500">Orang tua langsung memilih hari/jam & cabang di sini.</div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Branch/Schedule Selection (Only for fixed path) */}
                {classPath === 'fixed' && (
                    <div className="glass-card p-6 animate-slide-up">
                        <label className="block text-sm font-medium text-slate-700 mb-4">
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-green-500" />
                                3. Pillihan Kelas Tersedia
                            </div>
                        </label>
                        <div className="space-y-3">
                            {MOCK_CLASSES.filter(c => c.id !== 'c4').map((cls) => (
                                <button
                                    key={cls.id}
                                    onClick={() => setSelectedClassId(cls.id)}
                                    className={`w-full p-4 rounded-xl border-2 text-left flex justify-between items-center transition-all ${selectedClassId === cls.id ? 'border-brand bg-brand/5 shadow-md' : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="pr-4">
                                        <div className="font-semibold text-slate-800 text-lg">{cls.name}</div>
                                        <div className="flex items-center gap-4 text-sm mt-2">
                                            <span className="text-slate-600 flex items-center gap-1"><MapPin size={14} /> {cls.branch}</span>
                                            <span className="text-slate-600 flex items-center gap-1"><Calendar size={14} /> {cls.schedule}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-semibold text-brand bg-brand/10 px-2 py-1 rounded">
                                            Sisa {cls.maxSeats - cls.currentSeats} Kursi
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            {selectedLead && selectedClassId && (
                <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-slide-up">
                    <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">Total Tagihan:</p>
                            <p className="text-xl font-bold text-slate-800 flex items-center">
                                Rp {MOCK_CLASSES.find(c => c.id === selectedClassId)?.price.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <button
                            onClick={handleProceed}
                            className="btn-primary"
                        >
                            Lanjut Titip Bayar <ChevronRight size={20} className="ml-2 -mr-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

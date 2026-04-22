import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';

export default function Success() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showConfetti, setShowConfetti] = useState(true);

    // Fallback if accessed directly
    const state = location.state;
    if (!state) {
        navigate('/');
        return null;
    }

    const { lead, classDetails, paymentMethod, salesRep } = state;

    useEffect(() => {
        // Simple mock "confetti" animation timer
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-brand flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Confetti Background Simulation */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none flex justify-center">
                    <div className="w-full h-full bg-[url('https://cdn.pixabay.com/photo/2021/04/24/09/52/confetti-6203598_1280.png')] bg-cover bg-center opacity-50 animate-slide-up mix-blend-screen"></div>
                </div>
            )}

            <div className="glass-card w-full max-w-md p-8 text-center animate-slide-up relative z-10 bg-white/95">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle size={48} className="animate-[pulse_2s_ease-in-out_infinite]" />
                </div>

                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Pembayaran Sukses!</h2>
                <p className="text-slate-600 mb-8">Pendaftaran {lead.childName} berhasil diproses.</p>

                {/* Receipt Mockup */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 mb-8 text-left relative">
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle size={16} />
                    </div>

                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">No. Referensi</p>
                            <p className="font-mono font-bold text-slate-800">EXP-{Math.floor(Math.random() * 90000) + 10000}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase">Tanggal</p>
                            <p className="font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Siswa:</span>
                            <span className="font-semibold text-slate-800 text-right">{lead.childName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Program:</span>
                            <span className="font-semibold text-slate-800 text-right">
                                {classDetails.name}<br/>
                                <span className="text-xs text-slate-500 font-normal">{classDetails.branch} - {classDetails.schedule}</span>
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Sales In Charge:</span>
                            <span className="font-semibold text-slate-800 capitalize text-right">{salesRep}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-slate-500">Total Dibayar</span>
                        <span className="text-xl text-brand font-bold">
                            Rp {classDetails.price.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        className="w-full py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
                        onClick={() => alert("Fitur Screenshot/Download Resi (Mockup)")}
                    >
                        <Download size={20} />
                        Simpan Bukti Pembayaran
                    </button>

                    <button
                        onClick={() => navigate('/assign-group', { state: { lead, classDetails } })}
                        className="btn-primary w-full py-4 text-lg shadow-brand/30 mb-2"
                    >
                        Lanjut Bagi Grup <ArrowRight size={20} className="ml-2" />
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 rounded-xl border-2 border-transparent text-slate-500 font-semibold hover:text-slate-700 transition-all text-sm"
                    >
                        Lewati dan Kembali ke Utama
                    </button>
                </div>
            </div>
        </div>
    );
}

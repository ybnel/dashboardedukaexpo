import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, User, Phone, FileText, CheckCircle } from 'lucide-react';

export default function AddLead() {
    const [childName, setChildName] = useState('');
    const [parentName, setParentName] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');

    const [successId, setSuccessId] = useState('');

    const addLead = useStore((state) => state.addLead);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const newId = addLead({
            childName,
            parentName,
            phone,
            notes,
        });

        setSuccessId(newId);
    };

    if (successId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card w-full max-w-md p-8 text-center animate-slide-up">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Lead Tersimpan!</h2>
                    <p className="text-slate-600 mb-6">Siswa bernama {childName} berhasil didaftarkan.</p>


                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="btn-secondary flex-1"
                        >
                            Ke Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setSuccessId('');
                                setChildName('');
                                setParentName('');
                                setPhone('');
                                setNotes('');
                            }}
                            className="btn-primary flex-1"
                        >
                            Tambah Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 pb-20 animate-fade-in relative">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pt-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full shadow-sm transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800">Tambah Lead Baru</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass-card p-6 space-y-6">
                    {/* Child Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-brand" />
                                Nama Anak
                            </div>
                        </label>
                        <input
                            type="text"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            className="input-field"
                            placeholder="Masukkan nama lengkap anak"
                            required
                        />
                    </div>

                    <hr className="border-slate-100" />

                    {/* Parent Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-slate-400" />
                                Nama Orang Tua
                            </div>
                        </label>
                        <input
                            type="text"
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            className="input-field"
                            placeholder="Masukkan nama orang tua"
                            required
                        />
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-green-500" />
                                Nomor WhatsApp
                            </div>
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input-field"
                            placeholder="08xxxxxxxxxx"
                            required
                        />
                    </div>

                    <hr className="border-slate-100" />

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-orange-400" />
                                Catatan Tambahan (Opsional)
                            </div>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input-field min-h-[100px] resize-none"
                            placeholder="Contoh: Bisanya weekend pagi, Mau ngobrol dulu sama suami/istri, dll."
                        ></textarea>
                    </div>
                </div>

                {/* Floating Action Button for Mobile/Tablet context */}
                <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <div className="w-full max-w-2xl mx-auto">
                        <button type="submit" className="btn-primary w-full">
                            Simpan Data
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, User, Phone, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddLead() {
    const [childName, setChildName] = useState('');
    const [parentName, setParentName] = useState('');
    const [phone, setPhone] = useState('');
    const [channel, setChannel] = useState('Booth / Expo');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successId, setSuccessId] = useState('');

    const salesRep = useStore((state) => state.salesRep);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data, error: insertError } = await supabase
                .from('leads')
                .insert([
                    {
                        sales_rep: salesRep,
                        child_name: childName,
                        parent_name: parentName,
                        parent_phone: phone,
                        channel: channel
                    }
                ])
                .select();

            if (insertError) throw insertError;

            // Success
            if (data && data.length > 0) {
                setSuccessId(data[0].id);
            } else {
                setSuccessId('success-no-id');
            }
        } catch (err) {
            console.error('Error adding lead:', err);
            // Tambahkan pesan error yang lebih detail dari Supabase jika ada
            const errMessage = err?.message || err?.details || err?.hint || 'Gagal menyimpan data ke database. Silakan coba lagi.';
            setError(`Error: ${errMessage}`);
        } finally {
            setIsLoading(false);
        }
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
                                setChannel('Booth / Expo');
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
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm mb-4">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}
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

                    {/* Channel */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-orange-400" />
                                Sumber Info (Channel)
                            </div>
                        </label>
                        <select
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                            className="input-field cursor-pointer"
                        >
                            <option value="Booth / Expo">Booth / Expo</option>
                            <option value="Teman">Teman</option>
                            <option value="Internet">Internet</option>
                            <option value="ATL">ATL</option>
                            <option value="Other Offline">Other Offline</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button 
                        type="submit" 
                        className={`btn-primary w-full py-3.5 text-lg shadow-lg shadow-brand/20 flex items-center justify-center gap-2 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan Data'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

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
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                <div className="glass-card w-full max-w-md p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Lead Tersimpan!</h2>
                    <p className="text-lg text-slate-700 mb-8">Siswa bernama <span className="font-semibold">{childName}</span> berhasil didaftarkan.</p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                setSuccessId('');
                                setChildName('');
                                setParentName('');
                                setPhone('');
                                setChannel('Booth / Expo');
                            }}
                            className="btn-primary w-full"
                        >
                            Tambah Lead Lagi
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-secondary w-full"
                        >
                            Ke Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 pb-24 bg-slate-50 relative">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pt-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 text-slate-600 hover:text-slate-900 bg-white rounded-xl shadow-sm border border-slate-200"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Tambah Lead Baru</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass-card p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 text-base mb-4 border border-red-200">
                            <AlertCircle size={24} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {/* Child Name */}
                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-2">
                            <div className="flex items-center gap-2">
                                <User size={20} className="text-brand" />
                                Nama Lengkap Anak
                            </div>
                        </label>
                        <input
                            type="text"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            className="input-field"
                            placeholder="Contoh: Budi Santoso"
                            required
                        />
                    </div>

                    <hr className="border-slate-200" />

                    {/* Parent Name */}
                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-2">
                            <div className="flex items-center gap-2">
                                <User size={20} className="text-slate-500" />
                                Nama Orang Tua / Wali
                            </div>
                        </label>
                        <input
                            type="text"
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            className="input-field"
                            placeholder="Contoh: Bapak Andi"
                            required
                        />
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-2">
                            <div className="flex items-center gap-2">
                                <Phone size={20} className="text-green-600" />
                                Nomor WhatsApp (Aktif)
                            </div>
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input-field"
                            placeholder="Contoh: 081234567890"
                            required
                        />
                    </div>

                    <hr className="border-slate-200" />

                    {/* Channel */}
                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-2">
                            <div className="flex items-center gap-2">
                                <FileText size={20} className="text-orange-500" />
                                Sumber Informasi
                            </div>
                        </label>
                        <select
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                            className="input-field cursor-pointer bg-slate-50"
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
                <div className="pt-4">
                    <button 
                        type="submit" 
                        className={`btn-primary w-full py-4 text-xl flex items-center justify-center gap-3 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                Menyimpan Data...
                            </>
                        ) : (
                            'Simpan Data Lead'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

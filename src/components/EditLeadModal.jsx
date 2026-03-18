import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EditLeadModal({ isOpen, onClose, lead, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        child_name: '',
        nickname: '',
        dob: '',
        gender: '',
        class_grade: '',
        child_phone: '',
        address: '',
        postal_code: '',
        child_email: '',
        school_name: '',
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        channel: '',
        teacher_name: '',
        pt_result: '',
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (lead) {
            setFormData({
                child_name: lead.child_name || '',
                nickname: lead.nickname || '',
                dob: lead.dob || '',
                gender: lead.gender || '',
                class_grade: lead.class_grade || '',
                child_phone: lead.child_phone || '',
                address: lead.address || '',
                postal_code: lead.postal_code || '',
                child_email: lead.child_email || '',
                school_name: lead.school_name || '',
                parent_name: lead.parent_name || '',
                parent_phone: lead.parent_phone || '',
                parent_email: lead.parent_email || '',
                channel: lead.channel || '',
                teacher_name: lead.teacher_name || '',
                pt_result: lead.pt_result || '',
            });
            setError('');
        }
    }, [lead]);

    if (!isOpen || !lead) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error: updateError } = await supabase
                .from('leads')
                .update(formData)
                .eq('id', lead.id);

            if (updateError) throw updateError;
            
            onSaveSuccess();
            onClose();
        } catch (err) {
            console.error('Error updating lead:', err);
            setError('Gagal memperbarui data. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-full flex flex-col animate-slide-up overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-white">
                    <h2 className="text-xl font-bold text-slate-800">Lengkapi Data Murid</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}   
                <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-slate-50/50">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm mb-6">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form id="edit-lead-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Data Pribadi (Murid) */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Data Pribadi (Murid)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap</label>
                                    <input type="text" name="child_name" value={formData.child_name} onChange={handleChange} required className="input-field py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Nama Panggilan</label>
                                    <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} className="input-field py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Lahir (DD/MM/YYYY)</label>
                                    <input type="text" name="dob" value={formData.dob} onChange={handleChange} className="input-field py-2 text-sm" placeholder="Contoh: 09/05/12" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Kelamin</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="input-field py-2 text-sm">
                                        <option value="">Pilih...</option>
                                        <option value="Pria">Pria</option>
                                        <option value="Wanita">Wanita</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Nomor HP</label>
                                    <input type="text" name="child_phone" value={formData.child_phone} onChange={handleChange} className="input-field py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Alamat</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Kode Pos</label>
                                    <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="input-field py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">E-Mail</label>
                                    <input type="email" name="child_email" value={formData.child_email} onChange={handleChange} className="input-field py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Nama Sekolah</label>
                                    <input type="text" name="school_name" value={formData.school_name} onChange={handleChange} className="input-field py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Kelas</label>
                                    <input type="text" name="class_grade" value={formData.class_grade} onChange={handleChange} className="input-field py-2 text-sm" placeholder="Contoh: 7" />
                                </div>
                            </div>
                        </div>

                        {/* Orang Tua */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Data Orang Tua</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Nama Orang Tua</label>
                                    <input type="text" name="parent_name" value={formData.parent_name} onChange={handleChange} required className="input-field py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Nomor HP Ortu</label>
                                    <input type="text" name="parent_phone" value={formData.parent_phone} onChange={handleChange} required className="input-field py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">E-Mail Ortu</label>
                                    <input type="email" name="parent_email" value={formData.parent_email} onChange={handleChange} className="input-field py-2 text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Staf Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Pendaftaran Akademik</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Sumber Info</label>
                                    <select name="channel" value={formData.channel} onChange={handleChange} className="input-field py-2 text-sm">
                                        <option value="Booth / Expo">Booth / Expo</option>
                                        <option value="Teman">Teman</option>
                                        <option value="Internet">Internet</option>
                                        <option value="ATL">ATL</option>
                                        <option value="Other Offline">Other Offline</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div> 
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Guru English 1</label>
                                    <input type="text" name="teacher_name" value={formData.teacher_name} onChange={handleChange} className="input-field py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Hasil PT</label>
                                    <input type="text" name="pt_result" value={formData.pt_result} onChange={handleChange} className="input-field py-2 text-sm" />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer fixed */}
                <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex justify-end gap-3 z-10 shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        disabled={isLoading}
                    >
                        Batal
                    </button>
                    <button 
                        type="submit" 
                        form="edit-lead-form"
                        className={`btn-primary px-8 py-2.5 flex items-center justify-center gap-2 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Menyimpan...
                            </>
                        ) : 'Simpan Data'}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { MOCK_AVAILABLE_CLASSES } from '../data/mockData';
import { ArrowLeft, Users, Loader2, AlertCircle, CheckCircle2, CheckSquare, Square, MapPin, Calendar, Clock } from 'lucide-react';

export default function GroupDetails() {
    const navigate = useNavigate();
    const { branch, day, time } = useParams();
    
    // Auth & Store
    const salesRep = useStore((state) => state.salesRep);
    const assignments = useStore((state) => state.assignments);
    const assignGroupStore = useStore((state) => state.assignGroup);
    const preferences = useStore((state) => state.preferences);

    const [paidLeads, setPaidLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for local assignment before save
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [targetGroup, setTargetGroup] = useState('');

    useEffect(() => {
        const fetchPaidLeads = async () => {
            if (!salesRep) return;
            setIsLoading(true);
            try {
                const { data, error: fetchError } = await supabase
                    .from('leads')
                    .select('*')
                    .eq('sales_rep', salesRep)
                    .eq('is_paid', true)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;
                setPaidLeads(data || []);
            } catch (err) {
                console.error("Error fetching paid leads", err);
                setError('Gagal memuat data pendaftar.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaidLeads();
    }, [salesRep]);

    // Available groups for this specific schedule
    const scheduleGroups = MOCK_AVAILABLE_CLASSES.filter(c => 
        c.school === branch && 
        c.hari === day && 
        c.jam === time
    );

    // Eligible leads (Paid, Unassigned, Preferred this schedule)
    const eligibleLeads = paidLeads.filter(lead => {
        if (assignments[lead.id]) return false; // Already assigned
        
        const pref = preferences[lead.id];
        if (!pref) return false;

        // Extract days from "Senin, Rabu | 15:30 - 17:00"
        const parts = pref.schedule.split(' | ');
        if (parts.length < 2) return false;
        
        const days = parts[0].split(', ');
        const timePart = parts[1];

        return pref.branch === branch && days.includes(day) && timePart === time;
    });

    const toggleLeadSelection = (leadId) => {
        setSelectedLeads(prev => 
            prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
        );
    };

    const handleAssign = () => {
        if (selectedLeads.length === 0 || !targetGroup) return;
        
        selectedLeads.forEach(leadId => {
            assignGroupStore(leadId, targetGroup);
        });

        alert(`Berhasil memasukkan ${selectedLeads.length} siswa ke grup ${targetGroup}!`);
        setSelectedLeads([]);
        setTargetGroup('');
        navigate('/assign-group'); // Go back to schedule list
    };

    return (
        <div className="min-h-screen p-4 pb-32 animate-fade-in relative">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pt-4">
                <button
                    onClick={() => navigate('/assign-group')}
                    className="p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full shadow-sm transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800">Detail Pembagian Grup</h1>
            </div>
            <div className="space-y-6">
                
                {/* Schedule Context Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                    <h3 className="font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <Users className="text-brand" size={18}/>
                        Jadwal Terpilih
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase">Cabang</p>
                                <p className="font-semibold text-slate-800">{branch}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase">Hari</p>
                                <p className="font-semibold text-slate-800">{day}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase">Jam</p>
                                <p className="font-semibold text-slate-800">{time}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p>Memuat data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Section 1: Eligible Leads */}
                        <div className="glass-card p-5">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="p-1 px-2.5 bg-slate-100 rounded-lg text-sm">{eligibleLeads.length}</span>
                                Siswa Menunggu
                            </h3>
                            
                            {eligibleLeads.length === 0 ? (
                                <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                    <p className="text-sm text-slate-500">Tidak ada siswa yang menunggu untuk jadwal ini.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {eligibleLeads.map(lead => {
                                        const isSelected = selectedLeads.includes(lead.id);
                                        return (
                                            <div 
                                                key={lead.id}
                                                onClick={() => toggleLeadSelection(lead.id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                                    isSelected ? 'border-brand bg-brand/5' : 'border-slate-100 bg-white hover:border-slate-200'
                                                }`}
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-800">{lead.child_name}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Status: Lunas</p>
                                                </div>
                                                <div className={`text-xl ${isSelected ? 'text-brand' : 'text-slate-300'}`}>
                                                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Section 2: Target Group Context & Action */}
                        <div className="glass-card p-5">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="p-1 px-2.5 bg-slate-100 rounded-lg text-sm">{scheduleGroups.length}</span>
                                Pilih Grup Kelas Tujuan
                            </h3>

                            <div className="space-y-3 mb-6">
                                {scheduleGroups.map(group => {
                                    const isSelected = targetGroup === group.groupName;
                                    return (
                                        <label 
                                            key={group.groupName}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col ${
                                                isSelected ? 'border-brand bg-brand/5' : 'border-slate-100 bg-white hover:border-slate-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="radio" 
                                                        name="target_group"
                                                        value={group.groupName}
                                                        checked={isSelected}
                                                        onChange={(e) => setTargetGroup(e.target.value)}
                                                        className="hidden"
                                                    />
                                                    <span className="font-bold text-slate-800">{group.groupName}</span>
                                                </div>
                                                {isSelected && <CheckCircle2 size={18} className="text-brand" />}
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">Kap: {group.kapasitas}</span>
                                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">Terisi: {group.member}</span>
                                                {group.status === 'Full' && (
                                                    <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-600 rounded">Penuh</span>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleAssign}
                                disabled={selectedLeads.length === 0 || !targetGroup}
                                className={`w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                    selectedLeads.length > 0 && targetGroup
                                    ? 'bg-brand shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 active:scale-95'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                Konfirmasi Penempatan ({selectedLeads.length} Siswa)
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

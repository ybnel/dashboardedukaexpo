import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { MOCK_AVAILABLE_CLASSES } from '../data/mockData';
import { ArrowLeft, Users, Loader2, AlertCircle, CheckSquare, Square, MapPin, Calendar, Clock, BookOpen, CheckCircle2, Award } from 'lucide-react';

export default function GroupDetails() {
    const navigate = useNavigate();
    const { branch, program, level, day, time } = useParams();
    
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
        fetchPaidLeads();
    }, [salesRep]);

    const fetchPaidLeads = async () => {
        if (!salesRep) return;
        setIsLoading(true);
        try {
            // Fetch paid leads matching current sales_rep
            const q = query(
                collection(db, 'leads'), 
                where('sales_rep', '==', salesRep),
                where('is_paid', '==', true)
            );
            
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });

            // Sort in memory by created_at desc
            data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

            setPaidLeads(data);
        } catch (err) {
            console.error("Error fetching paid leads", err);
            setError('Gagal memuat data pendaftar.');
        } finally {
            setIsLoading(false);
        }
    };

    // Available groups for this specific schedule
    const scheduleGroups = MOCK_AVAILABLE_CLASSES.filter(c => 
        c.school === branch && 
        c.program === program &&
        c.level === level &&
        c.hari === day && 
        c.jam === time
    );

    const groupStartDate = scheduleGroups[0]?.startDate || '';

    // Eligible leads (Paid, Unassigned, Preferred this program and level)
    const eligibleLeads = paidLeads.filter(lead => {
        if (lead.group_name || assignments[lead.id]) return false; // Already assigned
        
        const pref = lead.class_details || preferences[lead.id];
        if (!pref) return false;

        return pref.branch === branch && pref.name === program && (!pref.level || pref.level === level);
    });

    const toggleLeadSelection = (leadId) => {
        setSelectedLeads(prev => 
            prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
        );
    };

    const handleAssign = async () => {
        if (selectedLeads.length === 0 || !targetGroup) return;
        
        setIsLoading(true);
        setError('');
        try {
            // Update Firestore for each selected lead doc
            const updatePromises = selectedLeads.map(leadId => 
                updateDoc(doc(db, 'leads', leadId), { group_name: targetGroup })
            );
            
            await Promise.all(updatePromises);

            // Also update Zustand store locally
            selectedLeads.forEach(leadId => {
                assignGroupStore(leadId, targetGroup);
            });
            
            setSelectedLeads([]);
            setTargetGroup('');
            alert('Siswa berhasil dialokasikan ke grup kelas!');
            fetchPaidLeads(); // Refresh list from Firestore
        } catch (err) {
            console.error("Error saving assignments", err);
            setError('Gagal menyimpan alokasi grup kelas.');
        } finally {
            setIsLoading(false);
        }
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                            <div className="p-2 bg-brand/10 rounded-lg text-brand">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase">Program</p>
                                <p className="font-semibold text-slate-800">{program}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                                <Award size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase">Level</p>
                                <p className="font-semibold text-slate-800">Level {level}</p>
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
                        {groupStartDate && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase">Tanggal Mulai</p>
                                    <p className="font-semibold text-slate-800">{groupStartDate}</p>
                                </div>
                            </div>
                        )}
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
                                        const pref = lead.class_details || preferences[lead.id];
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
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Status: Lunas {pref?.level && `| Level ${pref.level}`} {pref?.courseType && `| ${pref.courseType} (${pref.courseLength})`}
                                                    </p>
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

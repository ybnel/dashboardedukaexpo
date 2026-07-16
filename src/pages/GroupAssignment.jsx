import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { MOCK_AVAILABLE_CLASSES, PROGRAMS } from '../data/mockData';
import { ArrowLeft, Users, Loader2, AlertCircle, ChevronRight, CalendarClock, Filter, MapPin, Calendar, Clock, BookOpen } from 'lucide-react';

export default function GroupAssignment() {
    const navigate = useNavigate();

    // Auth & Store
    const salesRep = useStore((state) => state.salesRep);
    const assignments = useStore((state) => state.assignments);
    const preferences = useStore((state) => state.preferences);

    // State
    const [paidLeads, setPaidLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filters (Read from Zustand store for persistence)
    const filterBranch = useStore((state) => state.assignmentFilters.branch);
    const filterProgram = useStore((state) => state.assignmentFilters.program);
    const filterDay = useStore((state) => state.assignmentFilters.day);
    const filterTime = useStore((state) => state.assignmentFilters.time);
    const setAssignmentFilters = useStore((state) => state.setAssignmentFilters);
    const resetAssignmentFilters = useStore((state) => state.resetAssignmentFilters);

    // Fetch Paid Leads
    useEffect(() => {
        const fetchPaidLeads = async () => {
            if (!salesRep) return;
            setIsLoading(true);
            try {
                // Fetch all leads for this sales rep that are paid
                const { data, fetchError } = await supabase
                    .from('leads')
                    .select('*')
                    .eq('sales_rep', salesRep)
                    .eq('is_paid', true);

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

    // Derived Data (Filter out leads that are already assigned in DB or locally)
    const unassignedLeads = paidLeads.filter(lead => !lead.group_name && !assignments[lead.id]);

    // Compute Schedules
    const schedules = useMemo(() => {
        const unique = [];
        const seen = new Set();

        MOCK_AVAILABLE_CLASSES.forEach(c => {
            const key = `${c.school}|${c.program}|${c.hari}|${c.jam}`;
            if (!seen.has(key)) {
                seen.add(key);

                // Count how many leads are waiting for this schedule
                const waitingCount = unassignedLeads.filter(lead => {
                    const pref = preferences[lead.id];
                    if (!pref) return false;

                    return pref.branch === c.school && pref.name === c.program && pref.schedule === `${c.hari} | ${c.jam}`;
                }).length;

                unique.push({
                    branch: c.school,
                    program: c.program,
                    day: c.hari,
                    time: c.jam,
                    groupCount: MOCK_AVAILABLE_CLASSES.filter(x => 
                        x.school === c.school && 
                        x.program === c.program && 
                        x.hari === c.hari && 
                        x.jam === c.jam
                    ).length,
                    waitingCount
                });
            }
        });

        // Sort: waiting ones first, then by branch
        return unique.sort((a, b) => {
            if (b.waitingCount !== a.waitingCount) {
                return b.waitingCount - a.waitingCount;
            }
            return a.branch.localeCompare(b.branch);
        });
    }, [unassignedLeads, preferences]);

    // Get unique options for filters
    const filterOptions = useMemo(() => {
        const branches = [...new Set(schedules.map(s => s.branch))].sort();
        const programs = [...new Set(schedules.map(s => s.program))].sort();
        const days = [...new Set(schedules.map(s => s.day))].sort((a,b) => {
            const order = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
            return order.indexOf(a) - order.indexOf(b);
        });
        const times = [...new Set(schedules.map(s => s.time))].sort();
        return { branches, programs, days, times };
    }, [schedules]);

    // Filter schedules locally based on dropdowns
    const filteredSchedules = schedules.filter(s => {
        if (filterBranch && s.branch !== filterBranch) return false;
        if (filterProgram && s.program !== filterProgram) return false;
        if (filterDay && s.day !== filterDay) return false;
        if (filterTime && s.time !== filterTime) return false;
        return true;
    });

    return (
        <div className="min-h-screen p-4 pb-32 animate-fade-in relative bg-slate-50/50">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pt-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 text-slate-400 hover:text-slate-800 bg-white rounded-full shadow-sm transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800">Daftar Jadwal Kelas</h1>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">

                {/* Information Callout */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex gap-3">
                        <div className="p-3 bg-brand/10 text-brand rounded-xl h-fit">
                            <CalendarClock size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">Pembagian Grup Berbasis Jadwal</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-md">Pilih salah satu jadwal di bawah untuk melihat detail grup kelas yang tersedia dan mengalokasikan siswa yang sudah membayar.</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3">
                    <div className="flex items-center gap-2 mb-1 md:hidden">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 uppercase">Filter</span>
                    </div>

                    {/* Cabang */}
                    <div className="flex-1 relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                        <select 
                             className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-sm text-slate-700 appearance-none cursor-pointer"
                            value={filterBranch}
                            onChange={(e) => setAssignmentFilters({ branch: e.target.value })}
                        >
                            <option value="">Semua Cabang</option>
                            {filterOptions.branches.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    {/* Program */}
                    <div className="flex-1 relative">
                        <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand" />
                        <select 
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-sm text-slate-700 appearance-none cursor-pointer"
                            value={filterProgram}
                            onChange={(e) => setAssignmentFilters({ program: e.target.value })}
                        >
                            <option value="">Semua Program</option>
                            {filterOptions.programs.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Hari */}
                    <div className="flex-1 relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
                        <select 
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-sm text-slate-700 appearance-none cursor-pointer"
                            value={filterDay}
                            onChange={(e) => setAssignmentFilters({ day: e.target.value })}
                        >
                            <option value="">Semua Hari</option>
                            {filterOptions.days.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Jam */}
                    <div className="flex-1 relative">
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" />
                        <select 
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-sm text-slate-700 appearance-none cursor-pointer"
                            value={filterTime}
                            onChange={(e) => setAssignmentFilters({ time: e.target.value })}
                        >
                            <option value="">Semua Jam</option>
                            {filterOptions.times.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    
                    {(filterBranch || filterProgram || filterDay || filterTime) && (
                        <button 
                            onClick={resetAssignmentFilters}
                            className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-4 text-brand" size={32} />
                        <p>Memuat data jadwal...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredSchedules.map((sched, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(`/assign-group/${encodeURIComponent(sched.branch)}/${encodeURIComponent(sched.program)}/${encodeURIComponent(sched.day)}/${encodeURIComponent(sched.time)}`)}
                                className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-brand hover:shadow-md transition-all cursor-pointer flex justify-between items-center relative overflow-hidden"
                            >
                                {sched.waitingCount > 0 && (
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-[100px] -z-0"></div>
                                )}
                                <div className="z-10 relative">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                            {sched.branch}
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-brand bg-brand/5 px-2 py-0.5 rounded border border-brand/10">
                                            {sched.program}
                                        </span>
                                        {sched.waitingCount > 0 && (
                                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                                                <Users size={12} />
                                                {sched.waitingCount} Menunggu
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand transition-colors mt-2">
                                        {sched.day}, {sched.time}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {sched.groupCount} Grup Tersedia
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors z-10 text-slate-400 shrink-0">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        ))}

                        {filteredSchedules.length === 0 && (
                            <div className="col-span-1 md:col-span-2 text-center p-12 bg-white rounded-2xl border border-slate-200">
                                <p className="text-slate-500">Tidak ada jadwal yang sesuai pencarian.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

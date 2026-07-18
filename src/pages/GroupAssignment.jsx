import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { MOCK_AVAILABLE_CLASSES, PROGRAMS } from '../data/mockData';
import { ArrowLeft, Users, Loader2, AlertCircle, ChevronRight, ChevronDown, CalendarClock, Filter, MapPin, Calendar, Clock, BookOpen, Award } from 'lucide-react';

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
    const filterBranchRaw = useStore((state) => state.assignmentFilters.branch);
    const filterProgram = useStore((state) => state.assignmentFilters.program);
    const filterLevelRaw = useStore((state) => state.assignmentFilters.level);
    const filterDayRaw = useStore((state) => state.assignmentFilters.day);
    const filterTimeRaw = useStore((state) => state.assignmentFilters.time);
    const setAssignmentFilters = useStore((state) => state.setAssignmentFilters);
    const resetAssignmentFilters = useStore((state) => state.resetAssignmentFilters);

    // Normalize values to arrays (with safety checks for legacy string values)
    const filterBranch = useMemo(() => Array.isArray(filterBranchRaw) ? filterBranchRaw : (filterBranchRaw ? [filterBranchRaw] : []), [filterBranchRaw]);
    const filterLevel = useMemo(() => Array.isArray(filterLevelRaw) ? filterLevelRaw : (filterLevelRaw ? [filterLevelRaw] : []), [filterLevelRaw]);
    const filterDay = useMemo(() => Array.isArray(filterDayRaw) ? filterDayRaw : (filterDayRaw ? [filterDayRaw] : []), [filterDayRaw]);
    const filterTime = useMemo(() => Array.isArray(filterTimeRaw) ? filterTimeRaw : (filterTimeRaw ? [filterTimeRaw] : []), [filterTimeRaw]);

    // Active custom dropdown tracking
    const [activeDropdown, setActiveDropdown] = useState(null); // 'branch' | 'level' | 'day' | 'time' | null
    const branchDropdownRef = React.useRef(null);
    const levelDropdownRef = React.useRef(null);
    const dayDropdownRef = React.useRef(null);
    const timeDropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown === 'branch' && branchDropdownRef.current && !branchDropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
            if (activeDropdown === 'level' && levelDropdownRef.current && !levelDropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
            if (activeDropdown === 'day' && dayDropdownRef.current && !dayDropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
            if (activeDropdown === 'time' && timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    // Fetch Paid Leads
    useEffect(() => {
        const fetchPaidLeads = async () => {
            if (!salesRep) return;
            setIsLoading(true);
            try {
                // Fetch all leads for this sales rep that are paid
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

        fetchPaidLeads();
    }, [salesRep]);

    // Derived Data (Filter out leads that are already assigned in DB or locally)
    const unassignedLeads = paidLeads.filter(lead => !lead.group_name && !assignments[lead.id]);

    // Compute Schedules
    const schedules = useMemo(() => {
        const unique = [];
        const seen = new Set();

        MOCK_AVAILABLE_CLASSES.forEach(c => {
            const key = `${c.school}|${c.program}|${c.level}|${c.hari}|${c.jam}`;
            if (!seen.has(key)) {
                seen.add(key);

                // Count how many leads are waiting for this schedule
                const waitingCount = unassignedLeads.filter(lead => {
                    const pref = lead.class_details || preferences[lead.id];
                    if (!pref) return false;

                    return pref.branch === c.school && pref.name === c.program && (!pref.level || pref.level === c.level);
                }).length;

                const matchingClasses = MOCK_AVAILABLE_CLASSES.filter(x => 
                    x.school === c.school && 
                    x.program === c.program && 
                    x.level === c.level && 
                    x.hari === c.hari && 
                    x.jam === c.jam
                );
                const totalMember = matchingClasses.reduce((sum, x) => sum + (x.member || 0), 0);
                const totalCapacity = matchingClasses.reduce((sum, x) => sum + (x.kapasitas || 15), 0);

                unique.push({
                    branch: c.school,
                    program: c.program,
                    level: c.level,
                    day: c.hari,
                    time: c.jam,
                    startDate: c.startDate,
                    groupCount: matchingClasses.length,
                    totalMember,
                    totalCapacity,
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
        
        // Filter levels based on selected program
        const schedulesForLevels = filterProgram 
            ? schedules.filter(s => s.program === filterProgram)
            : schedules;

        const levels = [...new Set(schedulesForLevels.map(s => s.level))].sort((a, b) => {
            // Sort levels: numeric values first, then alphabetical
            const aNum = parseInt(a, 10);
            const bNum = parseInt(b, 10);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            if (!isNaN(aNum)) return -1;
            if (!isNaN(bNum)) return 1;
            return a.localeCompare(b);
        });
        const days = [...new Set(schedules.map(s => s.day))].sort((a,b) => {
            const order = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
            const firstA = a.split('&')[0].trim();
            const firstB = b.split('&')[0].trim();
            return order.indexOf(firstA) - order.indexOf(firstB);
        });
        const times = [...new Set(schedules.map(s => s.time))].sort();
        return { branches, programs, levels, days, times };
    }, [schedules, filterProgram]);

    // Filter schedules locally based on dropdowns
    const filteredSchedules = schedules.filter(s => {
        if (filterBranch && filterBranch.length > 0 && !filterBranch.includes(s.branch)) return false;
        if (filterProgram && s.program !== filterProgram) return false;
        if (filterLevel && filterLevel.length > 0 && !filterLevel.includes(s.level)) return false;
        if (filterDay && filterDay.length > 0 && !filterDay.includes(s.day)) return false;
        if (filterTime && filterTime.length > 0 && !filterTime.includes(s.time)) return false;
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
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="col-span-full flex items-center gap-2 mb-1">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 uppercase">Filter</span>
                    </div>

                    {/* Cabang */}
                    <div className="relative w-full" ref={branchDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === 'branch' ? null : 'branch')}
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white transition-colors text-sm text-slate-700 text-left flex justify-between items-center cursor-pointer shadow-sm"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <MapPin size={16} className="text-emerald-500 shrink-0" />
                                <span className="truncate">
                                    {filterBranch.length === 0 
                                        ? 'Semua Cabang' 
                                        : filterBranch.length === 1 
                                            ? filterBranch[0] 
                                            : `${filterBranch[0]} (+${filterBranch.length - 1})`
                                    }
                                </span>
                            </div>
                            <ChevronDown size={16} className="text-slate-400 shrink-0 transition-transform duration-200" style={{ transform: activeDropdown === 'branch' ? 'rotate(180deg)' : 'none' }} />
                        </button>
                        {activeDropdown === 'branch' && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 max-h-60 overflow-y-auto">
                                <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 border-b border-slate-100 cursor-pointer text-sm font-semibold text-slate-700">
                                    <input 
                                        type="checkbox"
                                        checked={filterBranch.length === filterOptions.branches.length && filterOptions.branches.length > 0}
                                        onChange={() => {
                                            if (filterBranch.length === filterOptions.branches.length) {
                                                setAssignmentFilters({ branch: [] });
                                            } else {
                                                setAssignmentFilters({ branch: [...filterOptions.branches] });
                                            }
                                        }}
                                        className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                                    />
                                    <span>Pilih Semua ({filterOptions.branches.length})</span>
                                </label>
                                {filterOptions.branches.map(b => {
                                    const isChecked = filterBranch.includes(b);
                                    return (
                                        <label 
                                            key={b} 
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {
                                                    const newBranch = isChecked 
                                                        ? filterBranch.filter(x => x !== b)
                                                        : [...filterBranch, b];
                                                    setAssignmentFilters({ branch: newBranch });
                                                }}
                                                className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                                            />
                                            <span className="truncate">{b}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Program */}
                    <div className="relative w-full">
                        <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand" />
                        <select 
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-sm text-slate-700 appearance-none cursor-pointer shadow-sm"
                            value={filterProgram}
                            onChange={(e) => setAssignmentFilters({ program: e.target.value, level: [] })}
                        >
                            <option value="">Semua Program</option>
                            {filterOptions.programs.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Level */}
                    <div className="relative w-full" ref={levelDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === 'level' ? null : 'level')}
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white transition-colors text-sm text-slate-700 text-left flex justify-between items-center cursor-pointer shadow-sm"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Award size={16} className="text-blue-500 shrink-0" />
                                <span className="truncate">
                                    {filterLevel.length === 0 
                                        ? 'Semua Level' 
                                        : filterLevel.length === 1 
                                            ? `Level ${filterLevel[0]}` 
                                            : `Level ${filterLevel[0]} (+${filterLevel.length - 1})`
                                    }
                                </span>
                            </div>
                            <ChevronDown size={16} className="text-slate-400 shrink-0 transition-transform duration-200" style={{ transform: activeDropdown === 'level' ? 'rotate(180deg)' : 'none' }} />
                        </button>
                        {activeDropdown === 'level' && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 max-h-60 overflow-y-auto">
                                <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 border-b border-slate-100 cursor-pointer text-sm font-semibold text-slate-700">
                                    <input 
                                        type="checkbox"
                                        checked={filterLevel.length === filterOptions.levels.length && filterOptions.levels.length > 0}
                                        onChange={() => {
                                            if (filterLevel.length === filterOptions.levels.length) {
                                                setAssignmentFilters({ level: [] });
                                            } else {
                                                setAssignmentFilters({ level: [...filterOptions.levels] });
                                            }
                                        }}
                                        className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                                    />
                                    <span>Pilih Semua ({filterOptions.levels.length})</span>
                                </label>
                                {filterOptions.levels.map(lvl => {
                                    const isChecked = filterLevel.includes(lvl);
                                    return (
                                        <label 
                                            key={lvl} 
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {
                                                    const newLevel = isChecked 
                                                        ? filterLevel.filter(x => x !== lvl)
                                                        : [...filterLevel, lvl];
                                                    setAssignmentFilters({ level: newLevel });
                                                }}
                                                className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                                            />
                                            <span>Level {lvl}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Hari */}
                    <div className="relative w-full" ref={dayDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === 'day' ? null : 'day')}
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white transition-colors text-sm text-slate-700 text-left flex justify-between items-center cursor-pointer shadow-sm"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Calendar size={16} className="text-orange-500 shrink-0" />
                                <span className="truncate">
                                    {filterDay.length === 0 
                                        ? 'Semua Hari' 
                                        : filterDay.length === 1 
                                            ? filterDay[0] 
                                            : `${filterDay[0]} (+${filterDay.length - 1})`
                                    }
                                </span>
                            </div>
                            <ChevronDown size={16} className="text-slate-400 shrink-0 transition-transform duration-200" style={{ transform: activeDropdown === 'day' ? 'rotate(180deg)' : 'none' }} />
                        </button>
                        {activeDropdown === 'day' && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 max-h-60 overflow-y-auto">
                                <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 border-b border-slate-100 cursor-pointer text-sm font-semibold text-slate-700">
                                    <input 
                                        type="checkbox"
                                        checked={filterDay.length === filterOptions.days.length && filterOptions.days.length > 0}
                                        onChange={() => {
                                            if (filterDay.length === filterOptions.days.length) {
                                                setAssignmentFilters({ day: [] });
                                            } else {
                                                setAssignmentFilters({ day: [...filterOptions.days] });
                                            }
                                        }}
                                        className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                                    />
                                    <span>Pilih Semua ({filterOptions.days.length})</span>
                                </label>
                                {filterOptions.days.map(d => {
                                    const isChecked = filterDay.includes(d);
                                    return (
                                        <label 
                                            key={d} 
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {
                                                    const newDay = isChecked 
                                                        ? filterDay.filter(x => x !== d)
                                                        : [...filterDay, d];
                                                    setAssignmentFilters({ day: newDay });
                                                }}
                                                className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                                            />
                                            <span>{d}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Jam */}
                    <div className="relative w-full" ref={timeDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')}
                            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 focus:bg-white transition-colors text-sm text-slate-700 text-left flex justify-between items-center cursor-pointer shadow-sm"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Clock size={16} className="text-rose-500 shrink-0" />
                                <span className="truncate">
                                    {filterTime.length === 0 
                                        ? 'Semua Jam' 
                                        : filterTime.length === 1 
                                            ? filterTime[0] 
                                            : `${filterTime[0]} (+${filterTime.length - 1})`
                                    }
                                </span>
                            </div>
                            <ChevronDown size={16} className="text-slate-400 shrink-0 transition-transform duration-200" style={{ transform: activeDropdown === 'time' ? 'rotate(180deg)' : 'none' }} />
                        </button>
                        {activeDropdown === 'time' && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 max-h-60 overflow-y-auto">
                                <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 border-b border-slate-100 cursor-pointer text-sm font-semibold text-slate-700">
                                    <input 
                                        type="checkbox"
                                        checked={filterTime.length === filterOptions.times.length && filterOptions.times.length > 0}
                                        onChange={() => {
                                            if (filterTime.length === filterOptions.times.length) {
                                                setAssignmentFilters({ time: [] });
                                            } else {
                                                setAssignmentFilters({ time: [...filterOptions.times] });
                                            }
                                        }}
                                        className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                                    />
                                    <span>Pilih Semua ({filterOptions.times.length})</span>
                                </label>
                                {filterOptions.times.map(t => {
                                    const isChecked = filterTime.includes(t);
                                    return (
                                        <label 
                                            key={t} 
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {
                                                    const newTime = isChecked 
                                                        ? filterTime.filter(x => x !== t)
                                                        : [...filterTime, t];
                                                    setAssignmentFilters({ time: newTime });
                                                }}
                                                className="rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                                            />
                                            <span className="truncate">{t}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    
                    {(filterBranch.length > 0 || filterProgram || filterLevel || filterDay.length > 0 || filterTime.length > 0) && (
                        <button 
                            onClick={resetAssignmentFilters}
                            className="w-full py-2.5 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center shadow-sm"
                        >
                            Reset Filter
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
                                onClick={() => navigate(`/assign-group/${encodeURIComponent(sched.branch)}/${encodeURIComponent(sched.program)}/${encodeURIComponent(sched.level)}/${encodeURIComponent(sched.day)}/${encodeURIComponent(sched.time)}`)}
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
                                        {sched.waitingCount > 0 && (
                                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                                                <Users size={12} />
                                                {sched.waitingCount} Menunggu
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-extrabold text-slate-800 text-xl group-hover:text-brand transition-colors mt-2 uppercase tracking-wide">
                                        {sched.program}
                                    </h3>
                                    <p className="text-sm text-slate-600 mt-2 flex items-center gap-2 flex-wrap font-medium">
                                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                            Level {sched.level}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1 text-slate-500">
                                            <Clock size={14} className="text-slate-400" />
                                            {sched.day}, {sched.time}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-500">
                                            Kapasitas: {sched.totalMember}/{sched.totalCapacity}
                                        </span>
                                        {sched.startDate && (
                                            <>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                                    Mulai: {sched.startDate}
                                                </span>
                                            </>
                                        )}
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

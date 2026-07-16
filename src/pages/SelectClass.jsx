import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { CENTERS, PROGRAMS, MOCK_AVAILABLE_CLASSES, PACKAGE_PRICE } from '../data/mockData';
import { ArrowLeft, UserCheck, Calendar, MapPin, ChevronRight, Loader2, AlertCircle, Clock, CheckSquare, Square, Search, ChevronDown, Check, BookOpen, Award } from 'lucide-react';

export default function SelectClass() {
    // 1. Lead State
    const [selectedLead, setSelectedLead] = useState('');
    
    // 2. Center State
    const [selectedCenter, setSelectedCenter] = useState('');

    // 3. Program State
    const [selectedProgram, setSelectedProgram] = useState('');

    // 4. Level State
    const [selectedLevel, setSelectedLevel] = useState('');

    // 5. Schedule State
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    
    // Remote Data State (Leads)
    const [leads, setLeads] = useState([]);
    const [isLoadingLeads, setIsLoadingLeads] = useState(true);
    const [error, setError] = useState('');


    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    const [isCenterDropdownOpen, setIsCenterDropdownOpen] = useState(false);
    const [searchCenterQuery, setSearchCenterQuery] = useState('');
    const centerDropdownRef = useRef(null);

    const salesRep = useStore((state) => state.salesRep);
    const startCheckout = useStore((state) => state.startCheckout);
    const navigate = useNavigate();

    // Reset dependent fields when parent fields change
    useEffect(() => {
        setSelectedProgram('');
        setSelectedLevel('');
        setSelectedDay('');
        setSelectedTime('');
    }, [selectedCenter]);

    useEffect(() => {
        setSelectedLevel('');
        setSelectedDay('');
        setSelectedTime('');
    }, [selectedProgram]);

    useEffect(() => {
        setSelectedDay('');
        setSelectedTime('');
    }, [selectedLevel]);

    useEffect(() => {
        setSelectedTime('');
    }, [selectedDay]);

    // Filter available levels based on selected center and program
    const availableLevels = React.useMemo(() => {
        if (!selectedCenter || !selectedProgram) return [];
        const matches = MOCK_AVAILABLE_CLASSES.filter(c => 
            c.school === selectedCenter && c.program === selectedProgram
        );
        const uniqueLevels = [...new Set(matches.map(c => c.level))].sort((a, b) => {
            const aNum = parseInt(a, 10);
            const bNum = parseInt(b, 10);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            if (!isNaN(aNum)) return -1;
            if (!isNaN(bNum)) return 1;
            return a.localeCompare(b);
        });
        return uniqueLevels;
    }, [selectedCenter, selectedProgram]);

    // Filter available days based on selected center, program, and level
    const availableDays = React.useMemo(() => {
        if (!selectedCenter || !selectedProgram || !selectedLevel) return [];
        const matches = MOCK_AVAILABLE_CLASSES.filter(c => 
            c.school === selectedCenter && c.program === selectedProgram && c.level === selectedLevel
        );
        const uniqueDays = [...new Set(matches.map(c => c.hari))].sort((a, b) => {
            const order = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
            return order.indexOf(a) - order.indexOf(b);
        });
        return uniqueDays;
    }, [selectedCenter, selectedProgram, selectedLevel]);

    // Filter available times based on selected center, program, level, and day
    const availableTimes = React.useMemo(() => {
        if (!selectedCenter || !selectedProgram || !selectedLevel || !selectedDay) return [];
        const matches = MOCK_AVAILABLE_CLASSES.filter(c => 
            c.school === selectedCenter && 
            c.program === selectedProgram && 
            c.level === selectedLevel &&
            c.hari === selectedDay
        );
        const uniqueTimes = [...new Set(matches.map(c => c.jam))].sort();
        return uniqueTimes;
    }, [selectedCenter, selectedProgram, selectedLevel, selectedDay]);

    // Fetch leads based on sales rep
    React.useEffect(() => {
        const fetchLeads = async () => {
            if (!salesRep) return;
            
            setIsLoadingLeads(true);
            setError('');
            
            try {
                const { data, error: fetchError } = await supabase
                    .from('leads')
                    .select('id, child_name, is_paid')
                    .eq('sales_rep', salesRep)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;
                
                setLeads(data || []);
            } catch (err) {
                console.error('Error fetching leads:', err);
                setError('Gagal memuat data leads. Pastikan koneksi internet stabil.');
            } finally {
                setIsLoadingLeads(false);
            }
        };

        fetchLeads();
    }, [salesRep]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (centerDropdownRef.current && !centerDropdownRef.current.contains(event.target)) {
                setIsCenterDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isFormValid = () => {
        if (!selectedLead || !selectedCenter || !selectedProgram || !selectedLevel || !selectedDay || !selectedTime) return false;
        return true;
    };

    const handleProceed = () => {
        if (!isFormValid()) return;

        const classDetails = {
            id: `custom-${Date.now()}`,
            name: selectedProgram,
            branch: selectedCenter,
            level: selectedLevel,
            schedule: `${selectedDay} | ${selectedTime}`,
            price: PACKAGE_PRICE
        };

        startCheckout(selectedLead, classDetails);
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
                <h1 className="text-xl font-bold text-slate-800">Pilih Jadwal</h1>
            </div>

            <div className="space-y-6">
                
                {/* Step 1: Select Student */}
                <div className="glass-card p-6 relative z-50">
                    <label className="block text-sm font-medium text-slate-700 mb-4">
                        <div className="flex items-center gap-2">
                            <UserCheck size={18} className="text-brand" />
                            1. Pilih Pendaftar (Lead)
                        </div>
                    </label>
                    
                    {isLoadingLeads ? (
                        <div className="flex items-center gap-3 text-slate-500 py-2">
                            <Loader2 className="animate-spin" size={18} />
                            <span className="text-sm">Memuat daftar siswa...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl text-sm border border-yellow-200">
                            Belum ada pendaftar tersimpan. Silakan tambah pendaftar baru dari Dashboard.
                        </div>
                    ) : (
                        <div ref={dropdownRef} className="relative">
                            {/* Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full text-left px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                            >
                                <span className={selectedLead ? "text-slate-800 font-medium" : "text-slate-500"}>
                                    {selectedLead 
                                        ? leads.find(l => l.id === selectedLead)?.child_name 
                                        : "-- Pilih Siswa --"}
                                </span>
                                <ChevronDown size={20} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-slide-up">
                                    <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                                        <div className="relative">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Cari nama siswa..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                        {leads.filter(lead => !lead.is_paid && lead.child_name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                            <div className="p-3 text-sm text-slate-500 text-center">Siswa tidak ditemukan</div>
                                        ) : (
                                            leads
                                                .filter(lead => !lead.is_paid)
                                                .filter(lead => lead.child_name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map((lead) => (
                                                    <button
                                                        key={lead.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedLead(lead.id);
                                                            setIsDropdownOpen(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                                                            selectedLead === lead.id 
                                                            ? 'bg-brand/10 text-brand font-medium' 
                                                            : 'text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {lead.child_name}
                                                        {selectedLead === lead.id && <Check size={16} />}
                                                    </button>
                                                ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Step 2: Select Center */}
                {selectedLead && (
                    <div className="glass-card p-6 animate-slide-up relative z-40">
                        <label className="block text-sm font-medium text-slate-700 mb-4">
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-emerald-500" />
                                2. Pilih Cabang (Center)
                            </div>
                        </label>
                        
                        <div ref={centerDropdownRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsCenterDropdownOpen(!isCenterDropdownOpen)}
                                className="w-full text-left px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                            >
                                <span className={selectedCenter ? "text-slate-800 font-medium" : "text-slate-500"}>
                                    {selectedCenter || "-- Pilih Lokasi --"}
                                </span>
                                <ChevronDown size={20} className={`text-slate-400 transition-transform ${isCenterDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCenterDropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-slide-up">
                                    <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                                        <div className="relative">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Cari cabang..."
                                                value={searchCenterQuery}
                                                onChange={(e) => setSearchCenterQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                        {CENTERS.filter(center => center.toLowerCase().includes(searchCenterQuery.toLowerCase())).length === 0 ? (
                                            <div className="p-3 text-sm text-slate-500 text-center">Cabang tidak ditemukan</div>
                                        ) : (
                                            CENTERS
                                                .filter(center => center.toLowerCase().includes(searchCenterQuery.toLowerCase()))
                                                .map((center, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCenter(center);
                                                            setIsCenterDropdownOpen(false);
                                                            setSearchCenterQuery('');
                                                        }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                                                            selectedCenter === center 
                                                            ? 'bg-brand/10 text-brand font-medium' 
                                                            : 'text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {center}
                                                        {selectedCenter === center && <Check size={16} />}
                                                    </button>
                                                ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Select Program */}
                {selectedCenter && (
                    <div className="glass-card p-6 animate-slide-up">
                        <label className="block text-sm font-medium text-slate-700 mb-4">
                            <div className="flex items-center gap-2">
                                <BookOpen size={18} className="text-orange-500" />
                                3. Pilih Program Belajar
                            </div>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PROGRAMS.map(prog => {
                                const isAvailable = MOCK_AVAILABLE_CLASSES.some(c => c.school === selectedCenter && c.program === prog);
                                if (!isAvailable) return null;
                                
                                return (
                                    <button
                                        key={prog}
                                        type="button"
                                        onClick={() => setSelectedProgram(prog)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedProgram === prog ? 'border-brand bg-brand/5 font-semibold text-brand' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}
                                    >
                                        {prog}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 4: Select Level */}
                {selectedProgram && (
                    <div className="glass-card p-6 animate-slide-up">
                        <label className="block text-sm font-medium text-slate-700 mb-4">
                            <div className="flex items-center gap-2">
                                <Award size={18} className="text-blue-500" />
                                4. Pilih Level Belajar
                            </div>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {availableLevels.map(lvl => (
                                <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => setSelectedLevel(lvl)}
                                    className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                                        selectedLevel === lvl ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                    }`}
                                >
                                    Level {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Specific Day & Time */}
                {selectedLevel && (
                    <div className="glass-card p-6 animate-slide-up space-y-6">
                        
                        {/* Days Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                <div className="flex items-center gap-2">
                                    <CheckSquare size={18} className="text-indigo-500" />
                                    5. Pilih Hari Belajar
                                </div>
                            </label>
                            {availableDays.length === 0 ? (
                                <p className="text-sm text-slate-400">Tidak ada hari belajar yang tersedia untuk level ini.</p>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {availableDays.map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => setSelectedDay(day)}
                                            className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                                                selectedDay === day ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Time Radio */}
                        {selectedDay && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Clock size={18} className="text-rose-500" />
                                        Pilih Jam Belajar (Sesi)
                                    </div>
                                </label>
                                {availableTimes.length === 0 ? (
                                    <p className="text-sm text-slate-400">Tidak ada jam belajar yang tersedia untuk hari terpilih.</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {availableTimes.map(time => (
                                            <button 
                                                key={time}
                                                type="button"
                                                onClick={() => setSelectedTime(time)}
                                                className={`p-3 rounded-xl border-2 text-center font-semibold text-sm transition-all ${
                                                    selectedTime === time ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                                }`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* Action Button */}
            {isFormValid() && (
                <div className="pt-2 animate-slide-up pb-8 mt-6">
                    <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-brand/20 bg-brand/5">
                        <div className="w-full sm:w-auto text-left">
                            <p className="text-xs text-slate-500">Total Tagihan Sementara:</p>
                            <p className="text-xl font-bold text-slate-800 flex items-center">
                                Rp {PACKAGE_PRICE.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{selectedCenter} | {selectedProgram} | Level {selectedLevel} | {selectedDay} | {selectedTime}</p>
                        </div>
                        <button
                            onClick={handleProceed}
                            className="btn-primary w-full sm:w-auto px-8"
                        >
                            Konfirmasi Bayar <ChevronRight size={20} className="ml-2 -mr-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

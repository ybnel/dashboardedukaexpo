import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CENTERS, PROGRAMS, MOCK_AVAILABLE_CLASSES, PACKAGE_PRICE } from '../data/mockData';
import { ArrowLeft, UserCheck, Calendar, MapPin, ChevronRight, Loader2, AlertCircle, Clock, CheckSquare, Square, Search, ChevronDown, Check, BookOpen, Award } from 'lucide-react';

const PRICING_TABLE = {
    'HF_TB_FR_Standard': {
        1: { original: 6800000, discount: 680000, net: 6120000 },
        2: { original: 13600000, discount: 1972000, net: 11628000 },
        3: { original: 20400000, discount: 3325200, net: 17074800 }
    },
    'SS_Standard': {
        1: { original: 10900000, discount: 990000, net: 9910000 },
        2: { original: 21800000, discount: 2871000, net: 18929000 },
        3: { original: 32700000, discount: 4841100, net: 27858900 }
    },
    'HF_TB_FR_Peak': {
        1: { original: 7400000, discount: 740000, net: 6660000 },
        2: { original: 14800000, discount: 2146000, net: 12654000 },
        3: { original: 22200000, discount: 3618600, net: 18581400 }
    },
    'SS_Peak': {
        1: { original: 11400000, discount: 1070000, net: 10330000 },
        2: { original: 22800000, discount: 3103000, net: 19697000 },
        3: { original: 34200000, discount: 5232300, net: 28967700 }
    }
};

export default function SelectClass() {
    const location = useLocation();
    
    // 1. Lead State (Pre-selected if redirected from leads list)
    const [selectedLead, setSelectedLead] = useState(() => {
        return location.state?.preSelectedLeadId || '';
    });
    
    // 2. Center State
    const [selectedCenter, setSelectedCenter] = useState('');

    // 3. Program State
    const [selectedProgram, setSelectedProgram] = useState('');

    // 4. Level State
    const [selectedLevel, setSelectedLevel] = useState('');

    // 5. Course Package State
    const [selectedCourseType, setSelectedCourseType] = useState('Standard');
    const [selectedCourseLength, setSelectedCourseLength] = useState(1);
    
    // 6. Schedule Selection State
    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(null);
    
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
        setSelectedCourseType('Standard');
        setSelectedCourseLength(1);
        setSelectedScheduleIndex(null);
    }, [selectedCenter]);

    useEffect(() => {
        setSelectedLevel('');
        setSelectedCourseType('Standard');
        setSelectedCourseLength(1);
        setSelectedScheduleIndex(null);
    }, [selectedProgram]);

    // Custom forming class schedule fallback state
    const [customDay, setCustomDay] = useState('Wednesday & Friday');
    const [customTime, setCustomTime] = useState('15:00');

    useEffect(() => {
        setSelectedCourseType('Standard');
        setSelectedCourseLength(1);
        setSelectedScheduleIndex(null);
    }, [selectedLevel]);

    // Format level label for display (Level 0 for High Flyers is Foundation)
    const getLevelLabel = (lvl, programName) => {
        if (programName?.toLowerCase().includes('high flyers') && (lvl === '0' || lvl === 'FOUNDATION')) {
            return 'Foundation';
        }
        return `Level ${lvl}`;
    };

    // Use static levels based on program (per client request)
    const availableLevels = React.useMemo(() => {
        if (!selectedProgram) return [];
        const lower = selectedProgram.toLowerCase();
        if (lower.includes('small stars')) {
            return ['1', '2', '3', '4'];
        }
        if (lower.includes('high flyers')) {
            return ['0', '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', 'G', 'H', 'I', 'J'];
        }
        if (lower.includes('trailblazer')) {
            return ['1', '2', '3', '4', '5', '6', '7', '8'];
        }
        if (lower.includes('frontrunner')) {
            return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
        }
        // Fallback for Other
        return ['1', '2', '3', '4', '5', '6', '7', '8'];
    }, [selectedProgram]);

    // Filter matching actual schedules from CSV for reference display
    const matchingSchedules = React.useMemo(() => {
        if (!selectedCenter || !selectedProgram || !selectedLevel) return [];
        return MOCK_AVAILABLE_CLASSES.filter(c => {
            const matchesCenter = c.school.toLowerCase() === selectedCenter.toLowerCase();
            const matchesProgram = c.program.toLowerCase() === selectedProgram.toLowerCase();
            const matchesLevel = String(c.level) === String(selectedLevel) || 
                                 (selectedLevel === '0' && (c.level === 'FOUNDATION' || c.level === '0'));
            return matchesCenter && matchesProgram && matchesLevel;
        });
    }, [selectedCenter, selectedProgram, selectedLevel]);

    // Fetch leads based on sales rep
    React.useEffect(() => {
        const fetchLeads = async () => {
            if (!salesRep) return;
            
            setIsLoadingLeads(true);
            setError('');
            
            try {
                const q = query(collection(db, 'leads'), where('sales_rep', '==', salesRep));
                const querySnapshot = await getDocs(q);
                const data = [];
                querySnapshot.forEach((doc) => {
                    data.push({ id: doc.id, ...doc.data() });
                });

                // Sort in memory by created_at desc
                data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                
                setLeads(data);
            } catch (err) {
                console.error('Error fetching leads:', err);
                setError('Failed to load leads. Please check your internet connection.');
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
        if (!selectedLead || !selectedCenter || !selectedProgram || !selectedLevel || !selectedCourseType || !selectedCourseLength) return false;
        if (matchingSchedules.length > 0) {
            return selectedScheduleIndex !== null || Boolean(customDay && customTime);
        }
        return Boolean(customDay && customTime);
    };

    const handleProceed = () => {
        if (!isFormValid()) return;

        const isSS = selectedProgram.toLowerCase().includes('small stars');
        const pricingKey = `${isSS ? 'SS' : 'HF_TB_FR'}_${selectedCourseType}`;
        const pricing = PRICING_TABLE[pricingKey][selectedCourseLength];
        
        const selectedSchedule = matchingSchedules.length > 0 && selectedScheduleIndex !== null
            ? matchingSchedules[selectedScheduleIndex]
            : null;

        const finalDay = selectedSchedule ? selectedSchedule.hari : customDay;
        const finalTime = selectedSchedule ? selectedSchedule.jam : customTime;
        const displayLevel = (selectedProgram.toLowerCase().includes('high flyers') && selectedLevel === '0') ? 'Foundation' : selectedLevel;

        const classDetails = {
            id: `custom-${Date.now()}`,
            name: selectedProgram,
            branch: selectedCenter,
            level: displayLevel,
            courseType: selectedCourseType,
            courseLength: `${selectedCourseLength} Course${selectedCourseLength > 1 ? 's' : ''}`,
            price: pricing.net,
            originalPrice: pricing.original,
            discount: pricing.discount,
            schedule: selectedSchedule ? `${selectedSchedule.hari}, ${selectedSchedule.jam}` : `${finalDay}, ${finalTime} (Forming Class)`,
            day: finalDay,
            time: finalTime
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
                <h1 className="text-xl font-bold text-slate-800">Select Learning Package</h1>
            </div>

            <div className="space-y-6">
                
                {/* Step 1: Select Lead */}
                <div className="glass-card p-6 relative z-50">
                    <label className="block text-sm font-medium text-slate-700 mb-4">
                        <div className="flex items-center gap-2">
                            <UserCheck size={18} className="text-brand" />
                            1. Select Registrant (Lead)
                        </div>
                    </label>
                    
                    {isLoadingLeads ? (
                        <div className="flex items-center gap-3 text-slate-500 py-2">
                            <Loader2 className="animate-spin" size={18} />
                            <span className="text-sm">Loading leads list...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl text-sm border border-yellow-200">
                            No registrants saved yet. Please add a new registrant from the Dashboard.
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
                                        : "-- Select Lead --"}
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
                                                placeholder="Search lead name..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                        {leads.filter(lead => !lead.is_paid && lead.child_name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                            <div className="p-3 text-sm text-slate-500 text-center">Lead not found</div>
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
                                2. Select Center
                            </div>
                        </label>
                        
                        <div ref={centerDropdownRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsCenterDropdownOpen(!isCenterDropdownOpen)}
                                className="w-full text-left px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                            >
                                <span className={selectedCenter ? "text-slate-800 font-medium" : "text-slate-500"}>
                                    {selectedCenter || "-- Select Location --"}
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
                                                placeholder="Search center..."
                                                value={searchCenterQuery}
                                                onChange={(e) => setSearchCenterQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                        {CENTERS.filter(center => center.toLowerCase().includes(searchCenterQuery.toLowerCase())).length === 0 ? (
                                            <div className="p-3 text-sm text-slate-500 text-center">Center not found</div>
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
                                3. Select Program
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
                                4. Select Level
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
                                    {getLevelLabel(lvl, selectedProgram)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Schedule Selection Info */}
                {selectedLevel && (
                    <div className="glass-card p-6 animate-slide-up bg-slate-50/50 border border-slate-200/60">
                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Calendar size={18} className="text-brand shrink-0" />
                            5. Select Class Schedule Preference
                        </label>
                        {matchingSchedules.length === 0 ? (
                            <div className="bg-white p-4 rounded-xl border border-amber-200/70 bg-amber-50/40 space-y-3">
                                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                                    <Info size={18} className="text-amber-600" />
                                    Forming Class / Custom Schedule Slot
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    No active class group found in database CSV for <strong>{selectedCenter} - {selectedProgram} ({getLevelLabel(selectedLevel, selectedProgram)})</strong>. Select preferred schedule slot for this forming class:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Day</label>
                                        <select
                                            value={customDay}
                                            onChange={(e) => setCustomDay(e.target.value)}
                                            className="input-field py-2 text-xs bg-white border-slate-200"
                                        >
                                            <option value="Wednesday & Friday">Wednesday & Friday</option>
                                            <option value="Tuesday & Thursday">Tuesday & Thursday</option>
                                            <option value="Saturday">Saturday</option>
                                            <option value="Sunday">Sunday</option>
                                            <option value="Monday">Monday</option>
                                            <option value="Tuesday">Tuesday</option>
                                            <option value="Wednesday">Wednesday</option>
                                            <option value="Thursday">Thursday</option>
                                            <option value="Friday">Friday</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Time Slot</label>
                                        <select
                                            value={customTime}
                                            onChange={(e) => setCustomTime(e.target.value)}
                                            className="input-field py-2 text-xs bg-white border-slate-200"
                                        >
                                            <option value="15:00">15:00 - 16:30</option>
                                            <option value="16:30">16:30 - 18:00</option>
                                            <option value="18:10">18:10 - 19:40</option>
                                            <option value="19:40">19:40 - 21:10</option>
                                            <option value="09:00">09:00 - 10:30</option>
                                            <option value="10:00">10:00 - 11:30</option>
                                            <option value="10:30">10:30 - 12:00</option>
                                            <option value="13:00">13:00 - 14:30</option>
                                            <option value="13:30">13:30 - 15:00</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {matchingSchedules.map((c, i) => {
                                    const isSelected = selectedScheduleIndex === i;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setSelectedScheduleIndex(i)}
                                            className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                                                isSelected 
                                                ? 'border-brand bg-brand/5 ring-2 ring-brand/10 shadow-sm scale-[1.01]' 
                                                : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="w-full">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Group: {c.groupCode}</p>
                                                    {isSelected && (
                                                        <span className="text-[10px] bg-brand text-white px-2 py-0.5 rounded-full font-bold">
                                                            Selected
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-bold text-slate-800 text-sm mt-1">{c.groupName}</p>
                                                <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5 font-medium">
                                                    <Clock size={13} className="text-slate-400 shrink-0" />
                                                    {c.hari}, {c.jam}
                                                </p>
                                            </div>
                                            {c.startDate && (
                                                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between w-full">
                                                    <span className="text-xs text-slate-400 font-medium">Class Start Date:</span>
                                                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                                        {c.startDate}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 5 & 6: Course Type & Package Selection */}
                {selectedLevel && (
                    <div className="glass-card p-6 animate-slide-up space-y-6">
                        {/* Course Type (Standard vs Peak) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-indigo-500" />
                                    5. Select Course Type
                                </div>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { id: 'Standard', label: 'Standard', desc: 'Weekday / Standard Hours' },
                                    { id: 'Peak', label: 'Peak', desc: 'Saturday / Peak Hours (Weekend)' }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setSelectedCourseType(type.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                                            selectedCourseType === type.id 
                                            ? 'border-brand bg-brand/5 font-semibold text-brand' 
                                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                        }`}
                                    >
                                        <span className="font-bold text-base">{type.label}</span>
                                        <span className="text-xs text-slate-500 mt-1">{type.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Course Length / Packages */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                <div className="flex items-center gap-2">
                                    <CheckSquare size={18} className="text-emerald-500" />
                                    6. Select Course Length
                                </div>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map(length => {
                                    const isSS = selectedProgram.toLowerCase().includes('small stars');
                                    const pricingKey = `${isSS ? 'SS' : 'HF_TB_FR'}_${selectedCourseType}`;
                                    const pricing = PRICING_TABLE[pricingKey][length];

                                    return (
                                        <button
                                            key={length}
                                            type="button"
                                            onClick={() => setSelectedCourseLength(length)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-full ${
                                                selectedCourseLength === length 
                                                ? 'border-brand bg-brand/5 text-brand' 
                                                : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                            }`}
                                        >
                                            <div>
                                                <span className="font-bold text-lg block">{length} Course{length > 1 ? 's' : ''}</span>
                                                <span className="text-xs line-through text-slate-400 block mt-1">
                                                    Rp {pricing.original.toLocaleString('id-ID')}
                                                </span>
                                                <span className="text-xs text-emerald-600 font-medium block">
                                                    Save Rp {pricing.discount.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <div className="mt-4 pt-2 border-t border-slate-100 w-full">
                                                <span className="text-xs text-slate-500 block">Price After Discount:</span>
                                                <span className="font-extrabold text-lg text-slate-800">
                                                    Rp {pricing.net.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Button */}
            {isFormValid() && (() => {
                const isSS = selectedProgram.toLowerCase().includes('small stars');
                const pricingKey = `${isSS ? 'SS' : 'HF_TB_FR'}_${selectedCourseType}`;
                const pricing = PRICING_TABLE[pricingKey][selectedCourseLength];
                return (
                    <div className="pt-2 animate-slide-up pb-8 mt-6">
                        <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-brand/20 bg-brand/5">
                            <div className="w-full sm:w-auto text-left">
                                <p className="text-xs text-slate-500">Subtotal Amount:</p>
                                <p className="text-xl font-bold text-slate-800 flex items-center">
                                    Rp {pricing.net.toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                    {selectedCenter} | {selectedProgram} | Level {selectedLevel} | {selectedCourseType} ({selectedCourseLength} Course{selectedCourseLength > 1 ? 's' : ''})
                                </p>
                            </div>
                            <button
                                onClick={handleProceed}
                                className="btn-primary w-full sm:w-auto px-8"
                            >
                                Confirm Payment <ChevronRight size={20} className="ml-2 -mr-1" />
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

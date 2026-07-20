import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { MOCK_AVAILABLE_CLASSES, normalizeProgram } from '../data/mockData';
import { ArrowLeft, Users, Loader2, AlertCircle, CheckSquare, Square, MapPin, Calendar, Clock, BookOpen, CheckCircle2, Award, Plus } from 'lucide-react';

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
    const [assignedLeadsTotal, setAssignedLeadsTotal] = useState([]);

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

            // Fetch all assigned leads for the target groups in this schedule slot (across all sales reps)
            const groupNames = scheduleGroups.map(g => g.groupName);
            if (groupNames.length > 0) {
                const assignedQ = query(
                    collection(db, 'leads'),
                    where('group_name', 'in', groupNames)
                );
                const assignedSnap = await getDocs(assignedQ);
                const assignedList = [];
                assignedSnap.forEach((doc) => {
                    assignedList.push({ id: doc.id, ...doc.data() });
                });
                setAssignedLeadsTotal(assignedList);
            } else {
                setAssignedLeadsTotal([]);
            }
        } catch (err) {
            console.error("Error fetching paid leads", err);
            setError('Failed to load registrant data.');
        } finally {
            setIsLoading(false);
        }
    };

    // Available groups for this specific schedule
    const scheduleGroups = MOCK_AVAILABLE_CLASSES.filter(c => 
        c.school === branch && 
        c.rawProgram === program &&
        c.level === level &&
        c.hari === day && 
        c.jam === time
    );

    const groupStartDate = scheduleGroups[0]?.startDate || '';
    const groupStartWeek = scheduleGroups[0]?.startWeek || '';

    // Eligible leads (Paid, Unassigned, Preferred this program, level, day, and time)
    const eligibleLeads = paidLeads.filter(lead => {
        if (lead.group_name || assignments[lead.id]) return false; // Already assigned
        
        const pref = lead.class_details || preferences[lead.id];
        if (!pref) return false;

        const normalizedRouteProgram = normalizeProgram(program);
        const matchesBasic = pref.branch === branch && pref.name === normalizedRouteProgram && (!pref.level || pref.level === level);
        if (!matchesBasic) return false;

        // Match day and time (with fallback for legacy data lacking day/time preference)
        const dayMatch = !pref.day || pref.day === day;
        const timeMatch = !pref.time || pref.time === time;
        return dayMatch && timeMatch;
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
            // Find target group details to read the initial CSV enrolled count
            const targetGroupDetails = scheduleGroups.find(g => g.groupName === targetGroup);
            const csvMemberCount = targetGroupDetails ? targetGroupDetails.member : 0;

            // Count how many leads from database are already assigned to this group (across all sales reps)
            const dbAssignedCount = assignedLeadsTotal.filter(l => l.group_name === targetGroup).length;
            const startSequence = csvMemberCount + dbAssignedCount;

            // Update Firestore for each selected lead doc with sequential slots
            const updatePromises = selectedLeads.map((leadId, index) => {
                const sequenceNo = startSequence + index + 1;
                return updateDoc(doc(db, 'leads', leadId), { 
                    group_name: targetGroup,
                    group_sequence_no: sequenceNo
                });
            });
            
            await Promise.all(updatePromises);

            // Also update Zustand store locally
            selectedLeads.forEach((leadId, index) => {
                const sequenceNo = startSequence + index + 1;
                assignGroupStore(leadId, targetGroup);
            });
            
            setSelectedLeads([]);
            setTargetGroup('');
            alert('Leads successfully allocated to class group!');
            fetchPaidLeads(); // Refresh lists and count from Firestore
        } catch (err) {
            console.error("Error saving assignments", err);
            setError('Failed to save class group allocation.');
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
                <h1 className="text-xl font-bold text-slate-800">Group Assignment Details</h1>
            </div>
            <div className="space-y-6">
                
                {/* Schedule Context Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                    <h3 className="font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <Users className="text-brand" size={18}/>
                        Selected Schedule
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div className="flex items-center gap-3 min-w-[120px]">
                            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shadow-sm border border-emerald-100">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Center</p>
                                <p className="text-sm font-bold text-slate-700">{branch}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 min-w-[130px]">
                            <div className="p-2.5 bg-brand/10 rounded-xl text-brand shadow-sm border border-brand/20">
                                <BookOpen size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Program</p>
                                <p className="text-sm font-bold text-slate-700">{program}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 min-w-[90px]">
                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-sm border border-blue-100">
                                <Award size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Level</p>
                                <p className="text-sm font-bold text-slate-700">Level {level}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 min-w-[150px] max-w-[220px]">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm border border-indigo-100">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Day</p>
                                <p className="text-sm font-bold text-slate-700 leading-tight">{day}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 min-w-[90px]">
                            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 shadow-sm border border-rose-100">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</p>
                                <p className="text-sm font-bold text-slate-700">{time}</p>
                            </div>
                        </div>
                        {groupStartDate && (
                            <div className="flex items-center gap-3 min-w-[120px]">
                                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shadow-sm border border-amber-100">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Start Date</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {groupStartDate} {groupStartWeek && `(W${groupStartWeek})`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p>Loading data...</p>
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
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="p-1 px-2.5 bg-slate-100 rounded-lg text-sm">{eligibleLeads.length}</span>
                                    Leads Waiting
                                </div>
                                <button
                                    onClick={() => navigate('/add-lead')}
                                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus size={14} /> Add Lead
                                </button>
                            </h3>
                            
                            {eligibleLeads.length === 0 ? (
                                <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed flex flex-col items-center gap-3">
                                    <p className="text-sm text-slate-500">No leads waiting for this schedule.</p>
                                    <button 
                                        onClick={() => navigate('/add-lead')}
                                        className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                                    >
                                        <Plus size={14} />
                                        Add New Lead
                                    </button>
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
                                                        Status: Paid {pref?.level && `| Level ${pref.level}`} {pref?.courseType && `| ${pref.courseType} (${pref.courseLength})`}
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
                                Select Target Class Group
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
                                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">Cap: {group.kapasitas}</span>
                                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                                    Enrolled: {group.member + assignedLeadsTotal.filter(l => l.group_name === group.groupName).length}
                                                </span>
                                                {(group.status === 'Full' || (group.member + assignedLeadsTotal.filter(l => l.group_name === group.groupName).length) >= group.kapasitas) && (
                                                    <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-600 rounded">Full</span>
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
                                Confirm Assignment ({selectedLeads.length} Lead{selectedLeads.length > 1 ? 's' : ''})
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

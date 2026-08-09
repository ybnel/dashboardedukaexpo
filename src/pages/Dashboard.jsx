import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserPlus, BookOpen, ChevronRight, Info, FileWarning, Download, Loader2, Database, MapPin } from 'lucide-react';
import { getSalesUser } from '../data/mockData';

export default function Dashboard() {
    const salesRep = useStore((state) => state.salesRep);
    const assignments = useStore((state) => state.assignments);
    const navigate = useNavigate();

    const currentUser = getSalesUser(salesRep);

    const [unassignedLeads, setUnassignedLeads] = useState([]);
    const [incompleteLeads, setIncompleteLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPendingAssignments = async () => {
            if (!salesRep) return;
            setIsLoading(true);
            try {
                // Fetch all lead details for this sales rep from Firestore
                const q = query(collection(db, 'leads'), where('sales_rep', '==', salesRep));
                const querySnapshot = await getDocs(q);
                const data = [];
                querySnapshot.forEach((doc) => {
                    data.push({ id: doc.id, ...doc.data() });
                });

                // Leads yang belum lunas (Data belum lengkap)
                const incomplete = data.filter(lead => !lead.is_paid);
                setIncompleteLeads(incomplete);

                // Leads yang sudah lunas TAPI belum masuk grup
                const pending = data.filter(lead => lead.is_paid && !lead.group_name && !assignments[lead.id]);
                setUnassignedLeads(pending);
            } catch (err) {
                console.error("Error fetching pending assignments:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPendingAssignments();
    }, [salesRep, assignments]);

    const isAdmin = salesRep && salesRep.toLowerCase() === 'admin';
    const showReport = salesRep && ['admin', 'anna', 'wulan', 'ria', 'sales1'].includes(salesRep.toLowerCase());

    const GOOGLE_SHEETS_URL = "https://docs.google.com/spreadsheets/d/1_M-3c5eGKEimialB8AHZseTBK3tI1ZRfID2hRfviZMk/edit?usp=sharing";

    const handleSyncToSheets = async () => {
        setIsLoading(true);
        try {
            // Fetch ALL leads in Firestore
            const q = collection(db, 'leads');
            const querySnapshot = await getDocs(q);
            const allLeads = [];
            querySnapshot.forEach((doc) => {
                allLeads.push({ id: doc.id, ...doc.data() });
            });

            // Sort by registration date chronological order
            allLeads.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

            // Deployed Web App URL
            const webAppUrl = "https://script.google.com/macros/s/AKfycbwVGcLCEfLJOz7YeGE11i024XOykNt2eOfdmPlzlwUoSQsOzzeQd5pOxsAIGuF_JDdp3A/exec";

            // POST data to Google Sheets Apps Script
            await fetch(webAppUrl, {
                method: 'POST',
                mode: 'no-cors', // Apps Script requires no-cors for simple redirects
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ leads: allLeads })
            });

            alert('Database successfully synced to Google Sheets!');
            window.open(GOOGLE_SHEETS_URL, '_blank');
        } catch (err) {
            console.error('Error syncing to Google Sheets:', err);
            alert('Failed to sync to Google Sheets: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="min-h-screen p-4 pb-20 animate-fade-in bg-slate-50/50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 glass-card p-5">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Welcome,</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
                            <span className="bg-brand/10 text-brand px-3 py-1 rounded-lg text-lg">{salesRep}</span>
                        </h1>
                        {currentUser && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                                <MapPin size={14} />
                                {currentUser.locationLabel}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Reminder Banner for Incomplete Leads */}
            {!isLoading && incompleteLeads.length > 0 && (
                <div 
                    onClick={() => navigate('/select-class')}
                    className="mb-4 p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-md transition-all flex items-start sm:items-center justify-between gap-4 bg-orange-50 border-orange-500"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full shrink-0 bg-orange-100 text-orange-600">
                            <FileWarning size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-orange-700">
                                Incomplete Data!
                            </h3>
                            <p className="text-xs text-orange-600 mt-1 max-w-sm">
                                There are <strong>{incompleteLeads.length} leads</strong> with incomplete data (class & payment not selected). Click to process.
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex shrink-0 text-orange-400">
                        <ChevronRight size={20} />
                    </div>
                </div>
            )}

            {/* Reminder Banner for Unassigned Leads */}
            {!isLoading && unassignedLeads.length > 0 && (
                <div 
                    onClick={() => navigate('/assign-group')}
                    className="mb-8 p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-md transition-all flex items-start sm:items-center justify-between gap-4 bg-sky-50 border-sky-400"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full shrink-0 bg-sky-100 text-sky-600">
                            <Info size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-sky-700">
                                Group Assignment Info
                            </h3>
                            <p className="text-xs text-sky-600 mt-1 max-w-sm">
                                There are <strong>{unassignedLeads.length} paid leads</strong> not yet assigned to any group. Click here to assign them now.
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex shrink-0 text-sky-400">
                        <ChevronRight size={20} />
                    </div>
                </div>
            )}

            {/* Main Actions */}
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">Main Menu</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
                <button
                    onClick={() => navigate('/add-lead')}
                    className="glass-card p-5 flex items-center gap-4 text-left border border-slate-200 hover:border-brand/30 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex flex-shrink-0 items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">1. Add New Lead</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Register a new expo participant into the system</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/select-class')}
                    className="glass-card p-5 flex items-center gap-4 text-left border border-slate-200 hover:border-orange-500/30 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex flex-shrink-0 items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">2. Select Class & Pay</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Complete transaction for registered leads</p>
                    </div>
                </button>

                {showReport && (
                    isAdmin ? (
                        <button
                            onClick={handleSyncToSheets}
                            className="glass-card p-5 flex items-center gap-4 text-left border border-slate-200 hover:border-emerald-500/30 hover:shadow-md transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex flex-shrink-0 items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    3. Sync Database to Google Sheets
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                                        Admin Sync
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Upload all registered leads and open the Google Sheets report</p>
                            </div>
                        </button>
                    ) : (
                        <a
                            href={GOOGLE_SHEETS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-card p-5 flex items-center gap-4 text-left border border-slate-200 hover:border-emerald-500/30 hover:shadow-md transition-all group block"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex flex-shrink-0 items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    3. Open Sheets Report
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                                        View Report
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Open the shared Google Sheets report directly in a new tab</p>
                            </div>
                        </a>
                    )
                )}
            </div>

        </div>
    );
}

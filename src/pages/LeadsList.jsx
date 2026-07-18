import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { Loader2, AlertCircle, Edit, UserPlus, Search, CheckSquare, Square, Users, CalendarClock, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditLeadModal from '../components/EditLeadModal';

export default function LeadsList() {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const salesRep = useStore((state) => state.salesRep);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLeads();
    }, [salesRep]);

    const fetchLeads = async () => {
        if (!salesRep) return;

        setIsLoading(true);
        setError('');

        try {
            let q;
            if (salesRep === 'admin') {
                q = query(collection(db, 'leads'));
            } else {
                q = query(collection(db, 'leads'), where('sales_rep', '==', salesRep));
            }

            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });

            // Sort by created_at descending in memory
            data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

            setLeads(data);
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError('Gagal memuat data leads.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (lead) => {
        setSelectedLead(lead);
        setIsEditModalOpen(true);
    };

    const handleSaveSuccess = () => {
        fetchLeads(); // Refresh data table
    };

    const handlePaymentToggle = async (lead) => {
        const newStatus = !lead.is_paid;
        try {
            await updateDoc(doc(db, 'leads', lead.id), { is_paid: newStatus });
            
            // Update local state immediately for better UX
            setLeads(leads.map(l => l.id === lead.id ? { ...l, is_paid: newStatus } : l));
        } catch (err) {
            console.error('Error updating payment status:', err);
            setError('Gagal mengubah status pembayaran.');
        }
    };

    const handleExportCSV = () => {
        if (leads.length === 0) return;
        
        // Define CSV headers
        const headers = [
            'Nama Anak', 'Nama Orang Tua', 'No. HP', 'Tanggal Lahir', 
            'Kelas Sekolah', 'Alamat', 'Program Pilihan', 'Cabang', 
            'Hari Sesi', 'Jam Sesi', 'Level', 'Grup Kelas', 
            'Status Pembayaran', 'Sales Rep', 'Tanggal Registrasi'
        ];
        
        // Map data rows
        const rows = leads.map(lead => [
            `"${(lead.child_name || '').replace(/"/g, '""')}"`,
            `"${(lead.parent_name || '').replace(/"/g, '""')}"`,
            `"${(lead.parent_phone || '')}"`,
            `"${(lead.dob || '')}"`,
            `"${(lead.class_grade || '')}"`,
            `"${(lead.address || '').replace(/"/g, '""')}"`,
            `"${(lead.program_preference || '')}"`,
            `"${(lead.branch_preference || '')}"`,
            `"${(lead.day_preference || '')}"`,
            `"${(lead.time_preference || '')}"`,
            `"${(lead.level || '')}"`,
            `"${(lead.group_name || '')}"`,
            lead.is_paid ? 'Lunas' : 'Belum Bayar',
            `"${(lead.sales_rep || '')}"`,
            new Date(lead.created_at).toLocaleDateString('id-ID')
        ]);
        
        // Combine into CSV text (with UTF-8 BOM so Excel displays accents correctly)
        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
        // Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rekap_leads_expo_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLeads = leads.filter(lead => {
        const term = searchTerm.toLowerCase();
        return (
            lead.child_name?.toLowerCase().includes(term) ||
            lead.parent_name?.toLowerCase().includes(term) ||
            lead.parent_phone?.includes(term) ||
            (salesRep === 'admin' && lead.sales_rep?.toLowerCase().includes(term))
        );
    });

    return (
        <div className="min-h-screen p-4 pb-24 animate-fade-in relative">
            <div className="flex justify-between items-center mb-6 pt-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Daftar Leads</h1>
                    <p className="text-sm text-slate-500">
                        {salesRep === 'admin' 
                            ? 'Menampilkan semua leads di dalam sistem' 
                            : 'Menampilkan semua leads yang Anda daftarkan'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {salesRep === 'admin' && leads.length > 0 && (
                        <button
                            onClick={handleExportCSV}
                            className="p-3 bg-slate-100 text-slate-700 rounded-full shadow-md hover:bg-slate-200 transition-colors flex items-center justify-center hover:text-slate-900 border border-slate-200/50"
                            title="Unduh Rekap CSV"
                        >
                            <Download size={24} />
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/add-lead')}
                        className="p-3 bg-brand text-white rounded-full shadow-md hover:bg-brand/90 transition-colors flex items-center justify-center"
                    >
                        <UserPlus size={24} />
                    </button>
                </div>
            </div>

            {salesRep === 'admin' && leads.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Card 1: Total Leads */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Total Leads</p>
                            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{leads.length}</h3>
                            <p className="text-xs text-slate-500 mt-2">Semua Pendaftar</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users size={24} />
                        </div>
                    </div>

                    {/* Card 2: Lunas */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Sudah Lunas</p>
                            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
                                {leads.filter(l => l.is_paid).length}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2">
                                {leads.length > 0 
                                    ? `${Math.round((leads.filter(l => l.is_paid).length / leads.length) * 100)}% Rasio Pembayaran`
                                    : '0% Rasio Pembayaran'}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckSquare size={24} />
                        </div>
                    </div>

                    {/* Card 3: Sudah Masuk Grup */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Alokasi Kelas</p>
                            <h3 className="text-3xl font-extrabold text-brand mt-1">
                                {leads.filter(l => l.group_name).length}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2">
                                {leads.length > 0 
                                    ? `${Math.round((leads.filter(l => l.group_name).length / leads.length) * 100)}% Terdistribusi`
                                    : '0% Terdistribusi'}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                            <CalendarClock size={24} />
                        </div>
                    </div>

                    {/* Card 4: Belum Lunas */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Belum Lunas</p>
                            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">
                                {leads.filter(l => !l.is_paid).length}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2">Tunggakan Administrasi</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm mb-6">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}
            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-slate-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-12 bg-white shadow-sm border-slate-200"
                    placeholder={salesRep === 'admin' ? "Cari nama, no. HP, atau sales..." : "Cari nama anak, orang tua, atau no. HP..."}
                />
            </div>

            <div className="glass-card overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p>Memuat data...</p>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="text-center p-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <UserPlus size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Belum ada Lead</h3>
                        <p className="text-slate-500 text-sm mb-6">Anda belum mendaftarkan lead satupun.</p>
                        <button onClick={() => navigate('/add-lead')} className="btn-primary inline-flex items-center gap-2 px-6">
                            <UserPlus size={18} />
                            Tambah Lead Baru
                        </button>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="text-center p-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Pencarian Tidak Ditemukan</h3>
                        <p className="text-slate-500 text-sm">Tidak ada data yang cocok dengan "{searchTerm}".</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Anak</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">No. HP (Ortu)</th>
                                    {salesRep === 'admin' && (
                                        <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sales</th>
                                    )}
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Grup Kelas</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Lengkap</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pembayaran</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeads.map((lead) => {
                                    const isComplete = lead.class_grade && lead.dob && lead.address;
                                    return (
                                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-semibold text-slate-800 truncate max-w-[150px]">{lead.child_name}</p>
                                                <p className="text-xs text-slate-500">{lead.parent_name}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-slate-700">{lead.parent_phone}</span>
                                            </td>
                                            {salesRep === 'admin' && (
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                        {lead.sales_rep}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="p-4">
                                                {lead.group_name ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                                                        {lead.group_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs font-medium">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {isComplete ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                                                        Lengkap
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-600 border border-yellow-200">
                                                        Belum Lengkap
                                                     </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => lead.is_paid 
                                                        ? handlePaymentToggle(lead) 
                                                        : navigate('/select-class', { state: { preSelectedLeadId: lead.id } })
                                                    }
                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                                        lead.is_paid 
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 cursor-pointer'
                                                    }`}
                                                >
                                                    {lead.is_paid ? <CheckSquare size={16} /> : <Square size={16} />}
                                                    {lead.is_paid ? 'Lunas' : 'Belum'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleEditClick(lead)}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-brand hover:border-brand transition-colors"
                                                    title="Lengkapi Data"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <EditLeadModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                lead={selectedLead}
                onSaveSuccess={handleSaveSuccess}
            />
        </div>
    );
}

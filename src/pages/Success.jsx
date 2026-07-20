import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';

const printStyles = `
@page {
    size: auto;
    margin: 0mm;
}
@media print {
    body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
    }
    /* Hide everything on screen */
    body * {
        visibility: hidden;
    }
    /* Show only the printable receipt card */
    #printable-receipt-card, #printable-receipt-card * {
        visibility: visible;
    }
    /* Position the receipt cleanly on the print page */
    #printable-receipt-card {
        position: absolute;
        left: 0;
        top: 0;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 20mm !important;
        display: block !important;
        background: white !important;
        box-shadow: none !important;
        border: none !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}
`;

export default function Success() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showConfetti, setShowConfetti] = useState(true);

    const [receiptNo] = useState(() => `EXP-${Math.floor(Math.random() * 90000) + 10000}`);
    const [currentDate] = useState(() => new Date().toLocaleDateString('id-ID'));

    // Fallback if accessed directly
    const state = location.state;
    if (!state) {
        navigate('/');
        return null;
    }

    const { lead, classDetails, paymentMethod, salesRep } = state;

    useEffect(() => {
        // Simple mock "confetti" animation timer
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-brand flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: printStyles }} />

            {/* Confetti Background Simulation */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none flex justify-center">
                    <div className="w-full h-full bg-[url('https://cdn.pixabay.com/photo/2021/04/24/09/52/confetti-6203598_1280.png')] bg-cover bg-center opacity-50 animate-slide-up mix-blend-screen"></div>
                </div>
            )}

            {/* On-Screen View Card */}
            <div className="glass-card w-full max-w-md p-8 text-center animate-slide-up relative z-10 bg-white/95">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle size={48} className="animate-[pulse_2s_ease-in-out_infinite]" />
                </div>

                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Payment Successful!</h2>
                <p className="text-slate-600 mb-8">Registration of {lead.child_name} has been successfully processed.</p>

                {/* Compact Receipt Card (Screen View Only) */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 mb-8 text-left relative">
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle size={16} />
                    </div>

                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Reference No</p>
                            <p className="font-mono font-bold text-slate-800">{receiptNo}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase">Date</p>
                            <p className="font-semibold text-slate-800">{currentDate}</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Lead:</span>
                            <span className="font-semibold text-slate-800 text-right">{lead.child_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Program:</span>
                            <span className="font-semibold text-slate-800 text-right">
                                {classDetails.name}<br/>
                                <span className="text-xs text-slate-500 font-normal">
                                    {classDetails.branch} - Level {classDetails.level}
                                    {classDetails.courseType ? ` - ${classDetails.courseType} (${classDetails.courseLength})` : ` - ${classDetails.schedule}`}
                                </span>
                            </span>
                        </div>
                        {classDetails.originalPrice && (
                            <>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Original Price:</span>
                                    <span className="line-through">Rp {classDetails.originalPrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                                    <span>Expo Discount:</span>
                                    <span>-Rp {classDetails.discount.toLocaleString('id-ID')}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between border-t border-slate-200 pt-2">
                            <span className="text-slate-500 font-semibold">Total Paid:</span>
                            <span className="font-bold text-brand text-lg">Rp {classDetails.price.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Payment Method:</span>
                            <span className="font-semibold text-slate-800 text-right">{paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Sales Representative:</span>
                            <span className="font-semibold text-slate-800 capitalize text-right">{salesRep}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200 text-[10px] text-slate-500 space-y-1 leading-normal">
                        <p className="font-bold text-slate-700">Note:</p>
                        <p>1. This is a temporary receipt that must be presented at the center to be exchanged for the original receipt.</p>
                        <p>2. Payments are non-refundable.</p>
                        <p>3. Payments are non-transferable.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        className="w-full py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                        onClick={handlePrint}
                    >
                        <Download size={20} />
                        Download Payment Receipt
                    </button>

                    <button
                        onClick={() => navigate('/assign-group', { state: { lead, classDetails } })}
                        className="btn-primary w-full py-4 text-lg shadow-brand/30 mb-2"
                    >
                        Proceed to Group Assignment <ArrowRight size={20} className="ml-2" />
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 rounded-xl border-2 border-transparent text-slate-500 font-semibold hover:text-slate-700 transition-all text-sm cursor-pointer"
                    >
                        Skip and Return to Main
                    </button>
                </div>
            </div>

            {/* Premium A4 Print-Only Invoice Layout */}
            <div id="printable-receipt-card" className="hidden print:block font-sans text-slate-800 p-10 w-full max-w-[800px] mx-auto bg-white">
                {/* Header Letterhead */}
                <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-blue-600">ENGLISH1</h1>
                        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Official Temporary Receipt</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-slate-700 uppercase">Payment Receipt</h2>
                        <p className="text-xs text-slate-500 mt-1">Ref No: <span className="font-mono font-bold text-slate-800">{receiptNo}</span></p>
                        <p className="text-xs text-slate-500">Date: <span className="font-semibold text-slate-800">{currentDate}</span></p>
                    </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Lead Information</p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-1">
                            <p className="text-sm font-bold text-slate-800">{lead.child_name}</p>
                            <p className="text-xs text-slate-500">Parent: {lead.parent_name}</p>
                            <p className="text-xs text-slate-500">Phone: {lead.parent_phone}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Transaction Details</p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-1">
                            <p className="text-sm font-bold text-slate-800">ENGLISH1 {classDetails.branch}</p>
                            <p className="text-xs text-slate-500">Payment Method: <span className="font-semibold text-slate-800">{paymentMethod}</span></p>
                            <p className="text-xs text-slate-500">Sales Representative: <span className="font-semibold text-slate-800 capitalize">{salesRep}</span></p>
                        </div>
                    </div>
                </div>

                {/* Program Recap Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                                <th className="p-4 text-xs font-bold uppercase text-slate-600">Course / Program Description</th>
                                <th className="p-4 text-xs font-bold uppercase text-slate-600 text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="p-4">
                                    <p className="font-bold text-slate-800">{classDetails.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Level: {classDetails.level} | Session: {classDetails.courseType ? `${classDetails.courseType} (${classDetails.courseLength})` : classDetails.schedule}
                                    </p>
                                </td>
                                <td className="p-4 text-right font-semibold text-slate-800">
                                    Rp {(classDetails.originalPrice || classDetails.price).toLocaleString('id-ID')}
                                </td>
                            </tr>
                            {classDetails.originalPrice && (
                                <tr className="bg-slate-50/50">
                                    <td className="p-4 text-right text-xs font-semibold text-emerald-600">Expo Discount:</td>
                                    <td className="p-4 text-right text-xs font-bold text-emerald-600">-Rp {classDetails.discount.toLocaleString('id-ID')}</td>
                                </tr>
                            )}
                            <tr className="bg-slate-50 border-t border-slate-200">
                                <td className="p-4 text-right text-sm font-bold text-slate-800 uppercase">Total Paid:</td>
                                <td className="p-4 text-right text-lg font-black text-blue-600">
                                    Rp {classDetails.price.toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Notice Area */}
                <div className="mt-12 pt-8 border-t border-slate-200 text-[10px] text-slate-400 space-y-1.5 leading-normal">
                    <p className="font-bold text-slate-600 mb-1">Important Notice:</p>
                    <p>1. This is a temporary receipt that must be presented at the center to be exchanged for the original receipt.</p>
                    <p>2. Payments are non-refundable.</p>
                    <p>3. Payments are non-transferable.</p>
                </div>
            </div>
        </div>
    );
}

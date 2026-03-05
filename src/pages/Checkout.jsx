                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, CheckCircle2, CreditCard, Receipt, Building2, DollarSign } from 'lucide-react';

export default function Checkout() {
    const [paymentMethod, setPaymentMethod] = useState('');

    const currentCheckout = useStore((state) => state.currentCheckout);
    const leads = useStore((state) => state.leads);
    const salesRep = useStore((state) => state.salesRep);
    const completeCheckout = useStore((state) => state.completeCheckout);
    const navigate = useNavigate();

    // Redirect if no active checkout
    if (!currentCheckout) {
        navigate('/');
        return null;
    }

    const { leadId, classDetails } = currentCheckout;
    const lead = leads.find(l => l.id === leadId);

    const handlePayment = () => {
        if (!paymentMethod) return;

        // Process "Mock" Payment
        // In real app, this would hit an API.
        completeCheckout();
        navigate('/success', { state: { lead, classDetails, paymentMethod, salesRep } });
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
                <h1 className="text-xl font-bold text-slate-800">Checkout</h1>
            </div>

            <div className="space-y-6">
                {/* Order Summary */}
                <div className="glass-card p-6">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                        Ringkasan Pesanan
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-slate-800 text-lg">{lead.childName}</p>
                                <p className="text-sm text-slate-500">ID: {lead.id} | Wali: {lead.parentName}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="font-semibold text-brand text-lg">{classDetails.name}</p>
                            {classDetails.id !== 'c4' ? (
                                <p className="text-sm text-slate-600 mt-1">{classDetails.branch} - {classDetails.schedule}</p>
                            ) : (
                                <p className="text-sm text-slate-600 mt-1">Jadwal Flexible (Akan dihubungi agen)</p>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <span className="text-slate-600 font-medium">Sales Bertugas</span>
                            <span className="font-semibold text-slate-800 px-3 py-1 bg-slate-100 rounded-lg">{salesRep}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="glass-card p-6">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                        Metode Pembayaran (Expo Area)
                    </h2>

                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'qris', name: 'QRIS Scan', icon: <Receipt size={24} />, color: 'text-blue-500' },
                            { id: 'transfer', name: 'Transfer Bank (Virtual Account)', icon: <Building2 size={24} />, color: 'text-orange-500' },
                            { id: 'cc', name: 'Kartu Kredit (EDC)', icon: <CreditCard size={24} />, color: 'text-purple-500' },
                            { id: 'cash', name: 'Tunai di Booth', icon: <DollarSign size={24} />, color: 'text-green-500' },
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${paymentMethod === method.id ? 'border-brand bg-brand/5 shadow-md' : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className={`${method.color} bg-white p-2 rounded-lg shadow-sm border border-slate-100`}>
                                    {method.icon}
                                </div>
                                <div className="font-semibold text-slate-800 text-left flex-1">{method.name}</div>
                                {paymentMethod === method.id && (
                                    <CheckCircle2 size={24} className="text-brand" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            {paymentMethod && (
                <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-slide-up">
                    <div className="w-full max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left w-full md:w-auto">
                            <p className="text-xs text-slate-500">Total Pembayaran:</p>
                            <p className="text-2xl font-bold text-brand">
                                Rp {classDetails.price.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <button
                            onClick={handlePayment}
                            className="btn-primary w-full md:w-auto px-8"
                        >
                            Konfirmasi & Bayar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

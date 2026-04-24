import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function Checkout() {
    const [paymentMethod, setPaymentMethod] = useState('transfer');

    const currentCheckout = useStore((state) => state.currentCheckout);
    const salesRep = useStore((state) => state.salesRep);
    const completeCheckout = useStore((state) => state.completeCheckout);
    const navigate = useNavigate();

    const [lead, setLead] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentCheckout) {
            navigate('/');
            return;
        }

        const fetchLeadDetails = async () => {
            
            setIsLoading(true);
            setError('');
            try {
                const { data, error: fetchError } = await supabase
                    .from('leads')
                    .select('*')
                    .eq('id', currentCheckout.leadId)
                    .single();

                if (fetchError) throw fetchError;
                setLead(data);
            } catch (err) {
                console.error('Error fetching lead details for checkout:', err);
                setError('Gagal memuat data pendaftar.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeadDetails();
    }, [currentCheckout, navigate]);

    // Redirect if no active checkout
    if (!currentCheckout) return null;

    const { classDetails } = currentCheckout;

    const [isPaying, setIsPaying] = useState(false);

    const handlePayment = async () => {
        if (!paymentMethod) return;

        setIsPaying(true);
        setError('');

        try {
            // Update the lead in Supabase to mark as paid
            const { error: updateError } = await supabase
                .from('leads')
                .update({ is_paid: true })
                .eq('id', currentCheckout.leadId);

            if (updateError) throw updateError;

            // Save preference locally so it survives navigation/refresh
            useStore.getState().savePreference(currentCheckout.leadId, classDetails);

            // Complete checkout locally
            completeCheckout();
            
            // Navigate to success page
            navigate('/success', { state: { lead, classDetails, paymentMethod, salesRep } });

        } catch (err) {
            console.error('Error processing payment:', err);
            setError('Gagal memproses pembayaran. Silakan coba lagi.');
        } finally {
            setIsPaying(false);
        }
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
                
                {isLoading ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p>Memuat data pesanan...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                ) : lead && (
                    <>
                        {/* Order Summary */}
                        <div className="glass-card p-6">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                        Ringkasan Pesanan
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-slate-800 text-lg">{lead.child_name}</p>
                                <p className="text-sm text-slate-500">Wali: {lead.parent_name} | {lead.parent_phone}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="font-semibold text-brand text-lg">{classDetails.name}</p>
                            <p className="text-sm text-slate-600 mt-1">{classDetails.branch} - {classDetails.schedule}</p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <span className="text-slate-600 font-medium">Sales Bertugas</span>
                            <span className="font-semibold text-slate-800 px-3 py-1 bg-slate-100 rounded-lg">{salesRep}</span>
                        </div>
                    </div>
                    </div>
                    </>
                )}
            </div>

            {/* Floating Action Button */}
            {!isLoading && !error && lead && paymentMethod && (
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

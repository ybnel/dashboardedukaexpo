import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { syncLeadsToGoogleSheets } from '../utils/syncHelper';

export default function Checkout() {
    const PAYMENT_METHODS = [
        'Bank Transfer',
        'CC BCA',
        'CC BRI',
        'CC Mandiri',
        'Debit BCA',
        'Debit BRI',
        'Debit Mandiri',
        'Cicilan BCA',
        'Cicilan BRI',
        'Cicilan Mandiri',
        'Blibli',
        'BCA E-commerce',
        'Cash',
        'Other'
    ];

    const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');

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
                const docSnap = await getDoc(doc(db, 'leads', currentCheckout.leadId));
                if (docSnap.exists()) {
                    setLead({ id: docSnap.id, ...docSnap.data() });
                } else {
                    throw new Error("Lead not found");
                }
            } catch (err) {
                console.error('Error fetching lead details for checkout:', err);
                setError('Failed to load registrant data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeadDetails();
    }, [currentCheckout, navigate]);

    // Redirect if no active checkout
    if (!currentCheckout) return null;

    const { classDetails } = currentCheckout;

    const handlePayment = async () => {
        if (!paymentMethod) return;

        setError('');

        try {
            // Update the lead in Firestore to mark as paid and save preferences
            await updateDoc(doc(db, 'leads', currentCheckout.leadId), { 
                is_paid: true,
                class_details: classDetails,
                day_preference: classDetails.day || '',
                time_preference: classDetails.time || '',
                program_preference: classDetails.name || '',
                branch_preference: classDetails.branch || '',
                payment_method: paymentMethod,
                payment_date: new Date().toISOString()
            });

            // Save preference locally so it survives navigation/refresh
            useStore.getState().savePreference(currentCheckout.leadId, classDetails);

            // Complete checkout locally
            completeCheckout();
            
            syncLeadsToGoogleSheets(); // Sync silently in background
            
            // Navigate to success page
            navigate('/success', { state: { lead, classDetails, paymentMethod, salesRep } });

        } catch (err) {
            console.error('Error processing payment:', err);
            setError('Failed to process payment. Please try again.');
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
                        <p>Loading order data...</p>
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
                        Order Summary
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-slate-800 text-lg">{lead.child_name}</p>
                                <p className="text-sm text-slate-500">Guardian: {lead.parent_name} | {lead.parent_phone}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="font-semibold text-brand text-lg">{classDetails.name}</p>
                            <p className="text-sm text-slate-600 mt-1">
                                {classDetails.branch} - Level {classDetails.level}
                                {classDetails.courseType ? ` - ${classDetails.courseType} (${classDetails.courseLength})` : ` - ${classDetails.schedule}`}
                            </p>
                        </div>

                        {classDetails.originalPrice && (
                            <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-3">
                                <div className="flex justify-between">
                                    <span>Original Price:</span>
                                    <span className="line-through text-slate-400">Rp {classDetails.originalPrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Progressive + BTS Discount:</span>
                                    <span>- Rp {classDetails.discount.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <span className="text-slate-600 font-medium">Assigned Sales</span>
                            <span className="font-semibold text-slate-800 px-3 py-1 bg-slate-100 rounded-lg">{salesRep}</span>
                        </div>
                    </div>
                    </div>
                        
                        {/* Payment Methods */}
                        <div className="glass-card p-6 mt-6">
                            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                                Payment Method
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {PAYMENT_METHODS.map((method) => {
                                    const isSelected = paymentMethod === method;
                                    return (
                                        <label
                                            key={method}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                                isSelected ? 'border-brand bg-brand/5' : 'border-slate-100 bg-white hover:border-slate-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="radio" 
                                                    name="payment_method"
                                                    value={method}
                                                    checked={isSelected}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="hidden"
                                                />
                                                <span className="font-semibold text-slate-800 text-sm">{method}</span>
                                            </div>
                                            {isSelected && <CheckCircle2 size={18} className="text-brand" />}
                                        </label>
                                    );
                                })}
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
                            <p className="text-xs text-slate-500">Total Payment:</p>
                            <p className="text-2xl font-bold text-brand">
                                Rp {classDetails.price.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <button
                            onClick={handlePayment}
                            className="btn-primary w-full md:w-auto px-8"
                        >
                            Confirm & Pay
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

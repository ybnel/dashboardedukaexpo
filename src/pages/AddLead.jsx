import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, User, Phone, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AddLead() {
    const [childName, setChildName] = useState('');
    const [parentName, setParentName] = useState('');
    const [phone, setPhone] = useState('');
    const [channel, setChannel] = useState('Booth / Expo');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successId, setSuccessId] = useState('');

    const salesRep = useStore((state) => state.salesRep);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const docRef = await addDoc(collection(db, 'leads'), {
                sales_rep: salesRep,
                child_name: childName,
                parent_name: parentName,
                parent_phone: phone,
                channel: channel,
                is_paid: false,
                group_name: null,
                created_at: new Date().toISOString()
            });

            // Success
            setSuccessId(docRef.id);
        } catch (err) {
            console.error('Error adding lead:', err);
            const errMessage = err?.message || 'Failed to save data to database. Please try again.';
            setError(`Error: ${errMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (successId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                <div className="glass-card w-full max-w-md p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Lead Saved!</h2>
                    <p className="text-lg text-slate-700 mb-8">Lead named <span className="font-semibold">{childName}</span> has been successfully registered.</p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                setSuccessId('');
                                setChildName('');
                                setParentName('');
                                setPhone('');
                                setChannel('Booth / Expo');
                            }}
                            className="btn-primary w-full"
                        >
                            Add Another Lead
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-secondary w-full"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 pb-24 bg-slate-50 relative">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pt-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 text-slate-600 hover:text-slate-900 bg-white rounded-xl shadow-sm border border-slate-200"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Add New Lead</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass-card p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 text-base mb-4 border border-red-200">
                            <AlertCircle size={24} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {/* Child Name */}
                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-2">
                            <div className="flex items-center gap-2">
                                <User size={20} className="text-brand" />
                                Lead Full Name
                            </div>
                        </label>
                        <input
                            type="text"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            className="input-field"
                            placeholder="e.g. John Doe"
                            required
                        />
                    </div>

                    <hr className="border-slate-200" />

                    {/* Parent Name */}
                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-2">
                            <div className="flex items-center gap-2">
                                <User size={20} className="text-slate-500" />
                                Parent / Guardian Name
                            </div>
                        </label>
                        <input
                            type="text"
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            className="input-field"
                            placeholder="e.g. Mr. Smith"
                            required
                        />
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-2">
                            <div className="flex items-center gap-2">
                                <Phone size={20} className="text-green-600" />
                                WhatsApp Number (Active)
                            </div>
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input-field"
                            placeholder="e.g. 081234567890"
                            required
                        />
                    </div>

                    <hr className="border-slate-200" />

                    {/* Channel */}
                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-2">
                            <div className="flex items-center gap-2">
                                <FileText size={20} className="text-orange-500" />
                                Information Source
                            </div>
                        </label>
                        <select
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                            className="input-field cursor-pointer bg-slate-50"
                        >
                            <option value="Booth / Expo">Booth / Expo</option>
                            <option value="Friend">Friend</option>
                            <option value="Internet">Internet</option>
                            <option value="ATL">ATL</option>
                            <option value="Other Offline">Other Offline</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button 
                        type="submit" 
                        className={`btn-primary w-full py-4 text-xl flex items-center justify-center gap-3 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                Saving Data...
                            </>
                        ) : (
                            'Save Lead Data'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

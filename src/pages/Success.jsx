import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Printer, ArrowRight } from 'lucide-react';

const printStyles = `
@media print {
    /* Hide everything on screen */
    body * {
        visibility: hidden;
    }
    /* Show only the printable receipt */
    #printable-receipt, #printable-receipt * {
        visibility: visible;
    }
    /* Position the printable receipt at the top left of the printed page */
    #printable-receipt {
        position: absolute;
        left: 0;
        top: 0;
        width: 76mm !important;
        margin: 0 !important;
        padding: 10px !important;
        display: block !important;
        background: white !important;
        color: black !important;
        box-shadow: none !important;
        border: none !important;
    }
    /* Hide margins/headers/footers from standard browser printer */
    @page {
        size: auto;
        margin: 0mm;
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

            <div className="glass-card w-full max-w-md p-8 text-center animate-slide-up relative z-10 bg-white/95">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle size={48} className="animate-[pulse_2s_ease-in-out_infinite]" />
                </div>

                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Pembayaran Sukses!</h2>
                <p className="text-slate-600 mb-8">Pendaftaran {lead.child_name} berhasil diproses.</p>

                {/* Receipt Mockup (On Screen) */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 mb-8 text-left relative">
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle size={16} />
                    </div>

                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                        <div>
                            <p className="text-xs text-slate-500 uppercase">No. Referensi</p>
                            <p className="font-mono font-bold text-slate-800">{receiptNo}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase">Tanggal</p>
                            <p className="font-semibold text-slate-800">{currentDate}</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Siswa:</span>
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
                                    <span>Harga Normal:</span>
                                    <span className="line-through">Rp {classDetails.originalPrice.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                                    <span>Diskon Expo:</span>
                                    <span>-Rp {classDetails.discount.toLocaleString('id-ID')}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between border-t border-slate-200 pt-2">
                            <span className="text-slate-500 font-semibold">Total Dibayar:</span>
                            <span className="font-bold text-brand text-lg">Rp {classDetails.price.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Metode Bayar:</span>
                            <span className="font-semibold text-slate-800 text-right">{paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Sales In Charge:</span>
                            <span className="font-semibold text-slate-800 capitalize text-right">{salesRep}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200 text-[10px] text-slate-500 space-y-1 leading-normal">
                        <p className="font-bold text-slate-700">Keterangan / Note:</p>
                        <p>1. Receipt ini adalah receipt sementara yang harus ditunjukkan ke center utk ditukar dengan receipt asli.</p>
                        <p>2. Payment tidak bisa di refund ato dikembalikan.</p>
                        <p>3. Payment tidak dapat dipindahtangankan.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        className="w-full py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                        onClick={handlePrint}
                    >
                        <Printer size={20} />
                        Cetak Struk Pembayaran
                    </button>

                    <button
                        onClick={() => navigate('/assign-group', { state: { lead, classDetails } })}
                        className="btn-primary w-full py-4 text-lg shadow-brand/30 mb-2"
                    >
                        Lanjut Bagi Grup <ArrowRight size={20} className="ml-2" />
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 rounded-xl border-2 border-transparent text-slate-500 font-semibold hover:text-slate-700 transition-all text-sm cursor-pointer"
                    >
                        Lewati dan Kembali ke Utama
                    </button>
                </div>
            </div>

            {/* Hidden Thermal Printer Receipt Template (Print-only, Simplified) */}
            <div id="printable-receipt" className="hidden text-black p-4 w-[76mm] mx-auto bg-white font-mono text-xs leading-normal">
                <div className="text-center font-bold text-sm mb-0.5">ENGLISH1</div>
                <div className="text-center text-xs mb-3 uppercase font-semibold">EXPO 2026</div>
                
                <div className="border-t border-dashed border-black my-2"></div>
                
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span>No. Ref:</span>
                        <span className="font-bold">{receiptNo}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tanggal:</span>
                        <span>{currentDate}</span>
                    </div>
                </div>
                
                <div className="border-t border-dashed border-black my-2"></div>
                
                <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                        <span>Siswa:</span>
                        <span>{lead.child_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Program:</span>
                        <span className="font-bold text-right">
                            {classDetails.name} ({classDetails.level})
                        </span>
                    </div>
                    {classDetails.courseType && (
                        <div className="flex justify-between text-[11px] text-slate-700">
                            <span>Paket:</span>
                            <span>{classDetails.courseType} ({classDetails.courseLength})</span>
                        </div>
                    )}
                    {classDetails.originalPrice && (
                        <>
                            <div className="flex justify-between text-[11px] text-slate-700">
                                <span>Harga Normal:</span>
                                <span>Rp {classDetails.originalPrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-700">
                                <span>Diskon:</span>
                                <span>-Rp {classDetails.discount.toLocaleString('id-ID')}</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed border-black mt-1">
                        <span>TOTAL BAYAR:</span>
                        <span>Rp {classDetails.price.toLocaleString('id-ID')}</span>
                    </div>
                </div>
                
                <div className="border-t border-dashed border-black my-2"></div>
                
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span>Metode Bayar:</span>
                        <span className="font-bold">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Sales:</span>
                        <span className="capitalize">{salesRep}</span>
                    </div>
                </div>
                
                <div className="border-t border-dashed border-black my-2 mt-4"></div>
                
                <div className="text-[10px] text-left space-y-1 leading-normal text-slate-800">
                    <span className="font-bold block mb-1">Keterangan / Note:</span>
                    <div>1. Receipt ini adalah receipt sementara yang harus ditunjukkan ke center utk ditukar dengan receipt asli.</div>
                    <div>2. Payment tidak bisa di refund ato dikembalikan.</div>
                    <div>3. Payment tidak dapat dipindahtangankan.</div>
                </div>
                
                <div className="border-t border-dashed border-black my-2 mt-4"></div>
                <div className="text-center font-bold mt-2">TERIMA KASIH</div>
            </div>
        </div>
    );
}

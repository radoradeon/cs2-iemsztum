import { Head, useForm, Link } from '@inertiajs/react';
import { Lock, Key, AlertCircle, ChevronLeft, ShieldCheck } from 'lucide-react';
import React from 'react';

export default function LockScreen() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/unlock');
    };

    return (
        <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 selection:bg-red-500 selection:text-white relative overflow-hidden">
            <Head title="Zabezpieczony Panel" />

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md">
                
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Wróć do Panelu Głównego
                    </Link>
                </div>

                <div className="bg-[#0e0e11]/90 backdrop-blur-xl border border-red-900/30 rounded-3xl p-10 shadow-[0_20px_60px_rgba(220,38,38,0.1)] relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-2xl rounded-full translate-x-1/3 -translate-y-1/3"></div>
                    
                    <div className="text-center mb-10 relative">
                        <div className="w-24 h-24 bg-[#131317] border border-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                            <div className="absolute inset-0 border-2 border-red-500/20 rounded-full animate-ping opacity-50"></div>
                            <Lock className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-red-500" /> Tryb Administratora
                        </h2>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.2em]">Autoryzacja Sudo Wymagana</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Key className={`w-5 h-5 transition-colors ${data.password.length > 0 ? 'text-red-500' : 'text-zinc-600'}`} />
                                </div>
                                <input 
                                    type="password" 
                                    placeholder="WPROWADŹ HASŁO GLOBALNE"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`w-full bg-[#131317] border ${errors.password ? 'border-red-500/80 focus:border-red-500' : 'border-zinc-800 focus:border-red-500'} text-white rounded-xl pl-12 pr-4 py-4 font-black tracking-[0.2em] outline-none transition-all placeholder:text-zinc-700 shadow-inner`}
                                    autoFocus
                                />
                            </div>
                            {errors.password && (
                                <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest mt-3 px-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.password}
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit"
                            disabled={processing || data.password.length === 0}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
                        >
                            {processing ? 'Weryfikacja...' : 'Odblokuj Dostęp'}
                        </button>
                    </form>
                </div>
                <div className="text-center mt-8 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    Połączenie z serwerami wymaga dekryptażu rcon
                </div>
            </div>
        </div>
    );
}
import { Link } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black flex flex-col items-center justify-center relative overflow-hidden p-6">
            
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full"></div>

                    <div className="flex flex-col items-center gap-8 mb-10 relative z-10">
                        <Link href="/" className="flex items-center gap-3 group-hover:scale-105 transition-transform duration-500">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm flex items-center justify-center transform -skew-x-12 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                                <Trophy className="w-6 h-6 text-black transform skew-x-12" strokeWidth={3} />
                            </div>
                            <div className="text-3xl font-black tracking-tighter text-white uppercase italic">
                                IEM <span className="text-yellow-500">SZTUM</span>
                            </div>
                        </Link>

                        <div className="space-y-2 text-center mt-2">
                            <h1 className="text-2xl font-black text-white uppercase tracking-wider">{title}</h1>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{description}</p>
                        </div>
                    </div>
                    
                    {children}
                </div>
            </div>
        </div>
    );
}
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Trophy, Zap, ShieldCheck, Map as MapIcon, 
    Gamepad2, Rocket, Users, ChevronRight 
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import PromoBanner from '../components/PromoBanner';

interface SharedData {
    auth: {
        user: any;
    };
    [key: string]: any;
}

const ScrollReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'
            } ${className}`}
        >
            {children}
        </div>
    );
};

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black overflow-x-hidden">
            <Head title="Witaj" />
            <PromoBanner positionY="bottom" positionX="right" />

            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/10 blur-[120px] rounded-full"></div>
            </div>

            <nav className="fixed top-0 w-full z-50 bg-[#0a0a0c]/80 border-b border-zinc-800/60 backdrop-blur-xl">
                <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm flex items-center justify-center transform -skew-x-12 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                            <Trophy className="w-4 h-4 text-black transform skew-x-12" strokeWidth={3} />
                        </div>
                        <div className="text-xl font-black tracking-tighter text-white uppercase italic">
                            IEM <span className="text-yellow-500">SZTUM</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2 transform skew-x-[-10deg]">
                                <span className="block transform skew-x-[10deg]">PANEL IEM SZTUM</span>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] hover:text-white transition-colors px-4">
                                    Logowanie
                                </Link>
                                <Link href={route('register')} className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2 transform skew-x-[-10deg]">
                                    <span className="block transform skew-x-[10deg]">Zarejestruj się</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <div className="relative z-10">
                
                <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20">
                    <ScrollReveal>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                            Sezon 1 Otwarty
                        </div>
                    </ScrollReveal>
                    
                    <ScrollReveal delay={150}>
                        <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter mb-6">
                            Rozgrywka <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 italic">Intergalaktyczna</span>
                        </h1>
                    </ScrollReveal>

                    <ScrollReveal delay={300}>
                        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium mb-12">
                            Ping z kosmosu? U nas zagrasz płynnie nawet ze Sztumu dzięki naszej innowacyjnej infrastrukturze sieciowej. Twórz lobby, graj ze znajomymi i wspinaj się na szczyt.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal delay={450}>
                        <Link href={route('login')} className="group bg-white text-black px-12 py-5 rounded-sm font-black text-lg uppercase tracking-[0.2em] transition-all hover:bg-zinc-200 flex items-center justify-center gap-3 transform skew-x-[-10deg]">
                            <span className="block transform skew-x-[10deg] flex items-center gap-2">
                                DOŁĄCZ DO PLEBSU <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </ScrollReveal>
                </section>

                <section className="max-w-[1800px] mx-auto px-6 pb-40">
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[300px]">
                        
                        <ScrollReveal className="col-span-1 md:col-span-2 xl:col-span-2 row-span-2">
                            <div className="h-full bg-[#0e0e11] border border-zinc-800/80 rounded-2xl p-12 flex flex-col justify-between group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                                
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-8">
                                    <Zap className="w-8 h-8 text-emerald-500" />
                                </div>
                                
                                <div className="relative z-10">
                                    <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-4">W Pełni Darmowe</h3>
                                    <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
                                        Nasza platforma jest i zawsze będzie w 100% darmowa. Brak ukrytych opłat, brak mechanik pay-to-win. Liczy się tylko Twój skill - albo i nie. Czasami możesz pokryć koszty serwera, ale kto by na to zwracał uwagę.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={100} className="col-span-1 md:col-span-1 xl:col-span-2 row-span-1">
                            <div className="h-full bg-[#0e0e11] border border-zinc-800/80 rounded-2xl p-8 flex flex-col justify-between group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                                    <ShieldCheck className="w-48 h-48 text-blue-500" />
                                </div>
                                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-4 relative z-10">
                                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Bezpieczeństwo</h3>
                                    <p className="text-zinc-400 text-sm">
                                        Zabezpieczenia anty-cheat (domyślne valve, więc sam rozumiesz), szyfrowane logowanie przez Steam i pełna ochrona.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={200} className="col-span-1 md:col-span-1 xl:col-span-1 row-span-1">
                            <div className="h-full bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-8 flex flex-col justify-between group relative overflow-hidden">
                                <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center mb-4 relative z-10 backdrop-blur-md">
                                    <Gamepad2 className="w-6 h-6 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black text-black uppercase tracking-wider mb-2">Tryby Gry</h3>
                                    <p className="text-black/80 text-sm font-bold">
                                        Od szybkich meczów BO1 po wyczerpujące starcia BO5. Turniejowe 5v5 lub taktyczne 2v2 Wingman.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={300} className="col-span-1 md:col-span-1 xl:col-span-1 row-span-1">
                            <div className="h-full bg-[#0e0e11] border border-zinc-800/80 rounded-2xl p-8 flex flex-col justify-between group relative overflow-hidden">
                                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-4 relative z-10">
                                    <Users className="w-6 h-6 text-purple-500" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Zasady Lobby</h3>
                                    <p className="text-zinc-400 text-sm">
                                        Pełna kontrola lidera. Wybierz konfigurację, zarządzaj przeciąganiem graczy, losuj składy i przejdź do fazy Veto.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={150} className="col-span-1 md:col-span-3 xl:col-span-4 row-span-1">
                            <div className="h-full bg-[#0e0e11] border border-zinc-800/80 rounded-2xl p-8 flex items-center gap-8 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://community.fastly.steamstatic.com/public/shared/images/responsive/header_logo.png')] bg-no-repeat bg-right-bottom opacity-5 mix-blend-overlay"></div>
                                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0 relative z-10">
                                    <MapIcon className="w-10 h-10 text-red-500" />
                                </div>
                                <div className="relative z-10 flex-1">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Oficjalna Pula Map</h3>
                                    <p className="text-zinc-400 text-base max-w-4xl">
                                        Rywalizuj na ustrukturyzowanych arenach. Platforma wspiera aktualną pulę turniejową (Active Duty): Mirage, Dust2, Inferno, Nuke, Ancient, Anubis oraz Vertigo.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                    </div>
                </section>

                <footer className="border-t border-zinc-800/60 bg-[#0a0a0c] py-12">
                    <div className="max-w-[1800px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-500 rounded-sm flex items-center justify-center transform -skew-x-12">
                                <Trophy className="w-3 h-3 text-black transform skew-x-12" strokeWidth={3} />
                            </div>
                            <span className="text-sm font-black text-white uppercase italic tracking-wider">IEM <span className="text-yellow-500">SZTUM</span></span>
                        </div>
                        <div className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                            Projekt dla wszystkich ze sztumu i nie sztumu.
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
}
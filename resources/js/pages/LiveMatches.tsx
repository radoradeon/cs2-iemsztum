import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, Calendar, Swords, ChevronRight, ChevronDown, Tv, Check, Users, MapPin, Play } from 'lucide-react';
import React, { useState } from 'react';
import CookieConsent from '../components/CookieConsent';

const getMapImage = (mapName: string) => {
    if (!mapName) return '';
    
    const mapLower = mapName.toLowerCase();
    const name = mapLower.replace('de_', '').replace('am_', '');
    const standardMaps = ['mirage', 'dust2', 'inferno', 'nuke', 'ancient', 'anubis', 'vertigo', 'overpass'];
    
    if (standardMaps.includes(name)) {
        return `https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/thumbs/de_${name}_1_png.png`;
    }
    
    return `/images/maps/${mapLower}.png`;
};

export default function LiveMatches() {
    const { matches, totalCount, currentLimit } = usePage<{ matches: any[], totalCount: number, currentLimit: number }>().props;
    const [loadingMore, setLoadingMore] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const loadMore = () => {
        const nextLimit = currentLimit + 25;
        if (nextLimit > 500) return;

        setLoadingMore(true);
        router.get('/matches/live', { limit: nextLimit }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoadingMore(false)
        });
    };

    const copyGotvCommand = (id: number, ip: string, port: number) => {
        const command = `connect ${ip}:${port}`;
        navigator.clipboard.writeText(command);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black pb-20">
            <Head title="Trwające Mecze na Żywo - IEM Sztum" />

            <nav className="sticky top-0 z-50 bg-[#0a0a0c]/90 border-b border-zinc-800/60 backdrop-blur-xl">
                <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-8 h-8 bg-zinc-800 group-hover:bg-yellow-500 rounded-sm flex items-center justify-center transform -skew-x-12 transition-colors">
                                <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-black transform skew-x-12" strokeWidth={3} />
                            </div>
                            <div className="text-xl font-black tracking-tighter text-white uppercase italic">
                                IEM <span className="text-yellow-500">SZTUM</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1400px] mx-auto py-12 px-6">
                <div className="mb-10 flex flex-col md:flex-row items-start md:items-end justify-between border-b border-zinc-800/80 pb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Trwające Rozgrywki</span>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Mecze na Żywo</h1>
                    </div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest bg-[#0e0e11] border border-zinc-800 px-4 py-2 rounded-lg">
                        Aktywne spotkania: <span className="text-white">{totalCount}</span>
                    </div>
                </div>

                {matches.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {matches.map((match: any) => {
                                const cleanMapName = match.map.replace('de_', '').replace('am_', '');

                                return (
                                    <div 
                                        key={match.id} 
                                        className="relative overflow-hidden border border-zinc-800/80 hover:border-yellow-500/50 rounded-lg transition-all group flex flex-col md:flex-row items-center justify-between shadow-lg min-h-[120px] bg-[#0e0e11]"
                                    >
                                        <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundImage: match.map ? `url(${getMapImage(match.map)})` : 'none' }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e11] via-[#0e0e11]/80 to-[#0e0e11]/30"></div>
                                        
                                        <div className="relative z-10 flex flex-col gap-2 w-full md:w-1/4 p-6 mb-4 md:mb-0">
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                <Play className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> Trwa w tej chwili
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded text-[10px] font-black uppercase drop-shadow-md">
                                                    {match.format}
                                                </span>
                                                <span className="bg-zinc-900/90 text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-inner flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-yellow-500" /> {cleanMapName}
                                                </span>
                                                <span className="bg-zinc-900/90 text-zinc-400 border border-zinc-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-inner flex items-center gap-1">
                                                    <Users className="w-3 h-3 text-zinc-500" /> {match.players_count}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex items-center justify-center gap-6 w-full md:w-2/4 p-6">
                                            <div className="text-right w-1/3 text-white">
                                                <div className="text-sm md:text-xl font-black uppercase tracking-wider truncate drop-shadow-md">{match.team_a_name}</div>
                                            </div>
                                            
                                            <div className="bg-black/60 backdrop-blur-sm border border-zinc-700/80 rounded-lg px-8 py-4 shadow-inner flex items-center justify-center min-w-[140px]">
                                                <span className="text-3xl font-black text-yellow-500">{match.score_a}</span>
                                                <span className="mx-4 text-zinc-600 font-black text-2xl">:</span>
                                                <span className="text-3xl font-black text-yellow-500">{match.score_b}</span>
                                            </div>

                                            <div className="text-left w-1/3 text-white">
                                                <div className="text-sm md:text-xl font-black uppercase tracking-wider truncate drop-shadow-md">{match.team_b_name}</div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 w-full md:w-1/4 flex justify-end p-6 mt-4 md:mt-0">
                                            {match.gotv_enabled ? (
                                                <button
                                                    onClick={() => copyGotvCommand(match.id, match.gotv_ip, match.gotv_port)}
                                                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-5 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center gap-2"
                                                >
                                                    {copiedId === match.id ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-black" /> Skopiowano!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Tv className="w-3.5 h-3.5" /> Oglądaj GOTV
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="px-4 py-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                                                    GOTV Wyłączone
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {currentLimit < totalCount && (
                            <div className="p-6 bg-[#0e0e11] border border-zinc-800 rounded-xl text-center mt-6 shadow-xl relative z-10">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="px-8 py-3.5 bg-zinc-800 hover:bg-yellow-500 text-zinc-300 hover:text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 mx-auto disabled:opacity-50"
                                >
                                    <ChevronDown className={`w-4 h-4 ${loadingMore ? 'animate-bounce' : ''}`} />
                                    {loadingMore ? 'Ładowanie kolejnych meczów...' : 'Załaduj kolejne 25 meczów'}
                                </button>
                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">
                                    Wyświetlono {matches.length} z {totalCount} trwających spotkań
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-lg p-16 flex flex-col items-center justify-center text-center shadow-lg">
                        <Swords className="w-16 h-16 text-zinc-800 mb-6" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Brak aktywnych spotkań</h3>
                        <p className="text-zinc-500 font-medium max-w-md mx-auto">W tym momencie na serwerach nie są prowadzone żadne mecze na żywo. Utwórz lobby i rozpocznij nową rozgrywkę!</p>
                    </div>
                )}
            </main>
            <CookieConsent />
        </div>
    );
}
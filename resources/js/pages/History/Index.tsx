import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, Trophy, Calendar, Swords, ChevronRight, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import CookieConsent from '../../components/CookieConsent';

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

export default function HistoryIndex() {
    const { matches, totalCount, currentLimit } = usePage<{ matches: any[], totalCount: number, currentLimit: number }>().props;
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMore = () => {
        const nextLimit = currentLimit + 25;
        if (nextLimit > 500) return;

        setLoadingMore(true);
        router.get('/history', { limit: nextLimit }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoadingMore(false)
        });
    };

    return (
        <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black pb-20">
            <Head title="Historia Twoich Meczów" />

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
                            <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                            <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Archiwum Spotkań</span>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Twoje Mecze</h1>
                    </div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest bg-[#0e0e11] border border-zinc-800 px-4 py-2 rounded-lg">
                        Łącznie rozgrywek w archiwum: <span className="text-white">{totalCount}</span>
                    </div>
                </div>

                {matches.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {matches.map((match: any) => {
                                const winA = match.series_score_a > match.series_score_b;
                                const winB = match.series_score_b > match.series_score_a;
                                const firstMap = match.map_history && match.map_history.length > 0 ? match.map_history[0].map : '';
                                
                                return (
                                    <Link 
                                        key={match.id} 
                                        href={`/history/${match.id}`} 
                                        className="relative overflow-hidden border border-zinc-800/80 hover:border-yellow-500/50 rounded-lg transition-all group flex flex-col md:flex-row items-center justify-between shadow-lg min-h-[120px]"
                                    >
                                        <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundImage: firstMap ? `url(${getMapImage(firstMap)})` : 'none' }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e11] via-[#0e0e11]/80 to-[#0e0e11]/30"></div>
                                        
                                        <div className="relative z-10 flex flex-col gap-2 w-full md:w-1/4 p-6 mb-4 md:mb-0">
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                <Calendar className="w-3 h-3" /> {new Date(match.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded text-[10px] font-black uppercase drop-shadow-md">
                                                    {match.format}
                                                </span>

                                                {Array.isArray(match.map_history) && match.map_history.map((mapItem: any, index: number) => {
                                                    const rawMapName = typeof mapItem === 'string' ? mapItem : (mapItem.map || mapItem.name || '');
                                                    const cleanMapName = rawMapName.replace('de_', '').replace('am_', '');

                                                    return (
                                                        <span 
                                                            key={index} 
                                                            className="bg-zinc-900/90 text-zinc-400 border border-zinc-800 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-inner"
                                                        >
                                                            {cleanMapName}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex items-center justify-center gap-6 w-full md:w-2/4 p-6">
                                            <div className={`text-right w-1/3 ${winA ? 'text-white' : 'text-zinc-500'}`}>
                                                <div className="text-sm md:text-xl font-black uppercase tracking-wider truncate drop-shadow-md">{match.team_a_name}</div>
                                                {winA && <div className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest mt-1 flex items-center justify-end gap-1"><Trophy className="w-3 h-3"/> Zwycięzca</div>}
                                            </div>
                                            
                                            <div className="bg-black/60 backdrop-blur-sm border border-zinc-700/80 rounded-lg px-8 py-4 shadow-inner flex items-center justify-center min-w-[140px]">
                                                <span className={`text-3xl font-black ${winA ? 'text-blue-400' : 'text-white'}`}>{match.series_score_a}</span>
                                                <span className="mx-4 text-zinc-600 font-black text-2xl">:</span>
                                                <span className={`text-3xl font-black ${winB ? 'text-red-400' : 'text-white'}`}>{match.series_score_b}</span>
                                            </div>

                                            <div className={`text-left w-1/3 ${winB ? 'text-white' : 'text-zinc-500'}`}>
                                                <div className="text-sm md:text-xl font-black uppercase tracking-wider truncate drop-shadow-md">{match.team_b_name}</div>
                                                {winB && <div className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest mt-1 flex items-center justify-start gap-1"><Trophy className="w-3 h-3"/> Zwycięzca</div>}
                                            </div>
                                        </div>

                                        <div className="relative z-10 w-full md:w-1/4 flex justify-end p-6 mt-4 md:mt-0">
                                            <div className="text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                Szczegóły <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
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
                                    Wyświetlono {matches.length} z {totalCount} rozegranych spotkań
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-lg p-16 flex flex-col items-center justify-center text-center shadow-lg">
                        <Swords className="w-16 h-16 text-zinc-800 mb-6" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Brak rozegranych spotkań</h3>
                        <p className="text-zinc-500 font-medium max-w-md mx-auto">W tym momencie Twoje osobiste archiwum jest puste. Rozegraj mecze na platformie IEM SZTUM, aby budować historię i statystyki.</p>
                    </div>
                )}
            </main>
            <CookieConsent />
        </div>
    );
}
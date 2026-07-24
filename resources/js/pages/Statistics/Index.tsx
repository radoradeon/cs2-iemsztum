import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, Crown, Medal, Award, Target, Flame, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

interface User {
    id: number;
    nickname: string;
    avatar_url: string;
    elo: number;
    matches_played: number;
    mvps: number;
    avg_rating?: number;
}

const getLevelInfo = (elo: number) => {
    if (elo < 800) return { level: 1, color: 'from-zinc-500 to-zinc-700', text: 'text-zinc-400' };
    if (elo < 1200) return { level: 2, color: 'from-emerald-500 to-emerald-700', text: 'text-emerald-400' };
    if (elo < 1600) return { level: 3, color: 'from-blue-500 to-blue-700', text: 'text-blue-400' };
    if (elo < 2000) return { level: 4, color: 'from-purple-500 to-purple-700', text: 'text-purple-400' };
    return { level: 5, color: 'from-yellow-400 to-orange-600', text: 'text-yellow-400' };
};

export default function StatisticsIndex() {
    const { players, totalCount, currentLimit } = usePage<{ players: User[], totalCount: number, currentLimit: number }>().props;

    const [loadingMore, setLoadingMore] = useState(false);

    const loadMore = () => {
        const nextLimit = currentLimit + 25;
        if (nextLimit > 500) return;

        setLoadingMore(true);
        router.get('/statistics', { limit: nextLimit }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoadingMore(false)
        });
    };

    return (
        <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black pb-24">
            <Head title="Globalny Ranking - IEM SZTUM" />

            <nav className="sticky top-0 z-50 bg-[#0a0a0c]/90 border-b border-zinc-800/60 backdrop-blur-xl">
                <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-zinc-800 group-hover:bg-yellow-500 rounded-sm flex items-center justify-center transform -skew-x-12 transition-colors">
                            <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-black transform skew-x-12" strokeWidth={3} />
                        </div>
                        <div className="text-xl font-black tracking-tighter text-white uppercase italic">
                            IEM <span className="text-yellow-500">SZTUM</span>
                        </div>
                    </Link>
                </div>
            </nav>

            <main className="max-w-[1400px] mx-auto py-12 px-6">
                
                <div className="mb-10 flex flex-col md:flex-row items-start md:items-end justify-between border-b border-zinc-800/80 pb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                            <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">TOP 500 graczy</span>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Ranking #IEM_SZTUM</h1>
                    </div>
                    
                    <div className="bg-[#0e0e11] border border-yellow-500/30 px-5 py-3 rounded-xl shadow-inner flex items-center gap-3">
                        <Flame className="w-5 h-5 text-yellow-500 animate-pulse" />
                        <div>
                            <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Restrykcja Systemowa</div>
                            <div className="text-xs font-bold text-zinc-400">Wyświetlamy wyłącznie <span className="text-white">500 najlepszych graczy</span> w systemie.</div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="overflow-x-auto relative z-10">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#0a0a0c]/90 border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 w-20 text-center">Pozycja</th>
                                    <th className="px-6 py-4">Zawodnik</th>
                                    <th className="px-6 py-4 text-center">Poziom</th>
                                    <th className="px-6 py-4 text-center">Rozegrane Mecze</th>
                                    <th className="px-6 py-4 text-center">Średni Rating</th>
                                    <th className="px-6 py-4 text-center">MVP</th>
                                    <th className="px-6 py-4 text-right">Punkty SZELO</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {players.map((player, index) => {
                                    const rank = index + 1;
                                    const levelInfo = getLevelInfo(player.elo);
                                    
                                    const isFirst = rank === 1;
                                    const isSecond = rank === 2;
                                    const isThird = rank === 3;

                                    return (
                                        <tr 
                                            key={player.id} 
                                            className={`transition-colors hover:bg-zinc-800/30 ${
                                                isFirst ? 'bg-yellow-500/5' : isSecond ? 'bg-zinc-300/5' : isThird ? 'bg-orange-900/10' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4 text-center font-black">
                                                {isFirst ? (
                                                    <div className="w-9 h-9 bg-yellow-500/20 border border-yellow-500/50 rounded-xl flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                                        <Crown className="w-5 h-5 text-yellow-500" />
                                                    </div>
                                                ) : isSecond ? (
                                                    <div className="w-9 h-9 bg-zinc-300/15 border border-zinc-400/40 rounded-xl flex items-center justify-center mx-auto">
                                                        <Medal className="w-5 h-5 text-zinc-300" />
                                                    </div>
                                                ) : isThird ? (
                                                    <div className="w-9 h-9 bg-orange-600/15 border border-orange-500/40 rounded-xl flex items-center justify-center mx-auto">
                                                        <Medal className="w-5 h-5 text-orange-500" />
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-500 text-sm font-mono">#{rank}</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={player.avatar_url || 'https://steamuserimages-a.akamaihd.net/ugc/885384897182110030/F095539864AC9E94AE5236E04C8CA7C2725BCEEA/'} 
                                                        alt="" 
                                                        className={`w-10 h-10 rounded-lg object-cover border ${
                                                            isFirst ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'border-zinc-700'
                                                        }`} 
                                                    />
                                                    <span className={`font-black text-base uppercase tracking-wider ${isFirst ? 'text-yellow-400' : 'text-white'}`}>
                                                        {player.nickname}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-xs bg-zinc-900 border border-zinc-800 ${levelInfo.text} shadow-inner font-mono`}>
                                                    {levelInfo.level}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center font-bold text-zinc-400 font-mono">
                                                {player.matches_played}
                                            </td>

                                            <td className="px-6 py-4 text-center font-black text-zinc-200 font-mono">
                                                {Number(player.avg_rating || 1.00).toFixed(2)}
                                            </td>

                                            <td className="px-6 py-4 text-center font-black text-yellow-500 font-mono">
                                                {player.mvps > 0 ? player.mvps : <span className="text-zinc-700">-</span>}
                                            </td>

                                            <td className="px-6 py-4 text-right font-mono">
                                                <span className="text-lg font-black text-white tracking-wider drop-shadow-sm">
                                                    {player.elo} <span className="text-xs text-zinc-600">PKT</span>
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {players.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-zinc-500 font-medium">
                                            Brak zarejestrowanych graczy w bazie danych.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {currentLimit < 500 && players.length < 500 && (
                        <div className="p-6 bg-[#0a0a0c]/80 border-t border-zinc-800 text-center relative z-10">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-zinc-800 hover:bg-yellow-500 text-zinc-300 hover:text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 mx-auto disabled:opacity-50"
                            >
                                <ChevronDown className={`w-4 h-4 ${loadingMore ? 'animate-bounce' : ''}`} />
                                {loadingMore ? 'Ładowanie kolejnych zawodników...' : 'Załaduj kolejne 25 osób'}
                            </button>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">
                                Wyświetlono {players.length} z {Math.min(500, totalCount)} dostępnych miejsc
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronLeft, Trophy, Calendar, Download, Map as MapIcon, Crosshair, Crown, Zap, Flame, Skull, Target, ArrowUpRight, ArrowDownRight, Info, Activity, X, Shield, Star } from 'lucide-react';
import React, { useState } from 'react';

const getMapImage = (mapName: string) => {
    const mapLower = mapName.toLowerCase();
    const name = mapLower.replace('de_', '').replace('am_', '');
    const standardMaps = ['mirage', 'dust2', 'inferno', 'nuke', 'ancient', 'anubis', 'vertigo', 'overpass'];
    
    if (standardMaps.includes(name)) {
        return `https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/thumbs/de_${name}_1_png.png`;
    }
    return `https://image.gametracker.com/images/maps/160x120/csgo/${mapLower}.jpg`;
};

export default function HistoryShow() {
    const { matchData } = usePage<any>().props;
    const [activeTab, setActiveTab] = useState<'overview' | number>('overview');
    const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

    const winA = matchData.series_score_a > matchData.series_score_b;
    const winB = matchData.series_score_b > matchData.series_score_a;
    const isDraw = matchData.series_score_a === matchData.series_score_b;

    const teamA = matchData.players.filter((p: any) => p.team === 'team_a').sort((a: any, b: any) => b.rating - a.rating);
    const teamB = matchData.players.filter((p: any) => p.team === 'team_b').sort((a: any, b: any) => b.rating - a.rating);

    const PlayerTable = ({ players, teamName, matchStatus, accentColor }: { players: any[], teamName: string, matchStatus: 'win' | 'loss' | 'draw', accentColor: string }) => (
        <div className="bg-[#131317] border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl mb-8 relative">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-${accentColor}-600/5 blur-3xl rounded-full pointer-events-none`}></div>
            
            <div className={`px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-gradient-to-r ${matchStatus === 'win' ? 'from-emerald-900/20' : matchStatus === 'loss' ? 'from-red-900/20' : 'from-zinc-900/40'} to-transparent relative z-10`}>
                <div className="flex items-center gap-4">
                    {matchStatus === 'win' && <Trophy className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                    {matchStatus === 'loss' && <Skull className="w-6 h-6 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
                    {matchStatus === 'draw' && <Shield className="w-6 h-6 text-zinc-500" />}
                    
                    <h3 className={`text-xl md:text-2xl font-black uppercase tracking-wider flex items-center gap-3 ${matchStatus === 'win' ? 'text-emerald-500 drop-shadow-md' : matchStatus === 'loss' ? 'text-red-500 drop-shadow-md' : 'text-zinc-400'}`}>
                        {teamName}
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 bg-black/40 px-2 py-1 rounded border border-zinc-800">
                            {matchStatus === 'win' ? 'Zwycięstwo' : matchStatus === 'loss' ? 'Przegrana' : 'Remis'}
                        </span>
                    </h3>
                </div>
            </div>
            
            <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0a0a0c]/80 border-b border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest w-1/4">Gracz</th>
                            <th className="px-3 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center" title="Kills - Deaths - Assists">K-D-A</th>
                            <th className="px-3 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center hidden md:table-cell" title="Zadane Obrażenia">DMG</th>
                            <th className="px-3 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center" title="Most Valuable Player">MVP</th>
                            <th className="px-3 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center hidden lg:table-cell" title="Effective Flashes">EF</th>
                            <th className="px-3 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center hidden lg:table-cell" title="Utility Damage">UD</th>
                            <th className="px-3 py-4 text-[10px] font-black text-yellow-500 uppercase tracking-widest text-center" title="Rating 2.0 (Custom)">Rating</th>
                            <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">SZELO</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {players.map((p, idx) => (
                            <tr 
                                key={idx} 
                                onClick={() => setSelectedPlayer(p)}
                                className="hover:bg-zinc-800/40 transition-all cursor-pointer group"
                            >
                                <td className="px-6 py-3 flex items-center gap-3">
                                    <div className="relative">
                                        <img src={p.user?.avatar_url || 'https://steamuserimages-a.akamaihd.net/ugc/885384897182110030/F095539864AC9E94AE5236E04C8CA7C2725BCEEA/'} className="w-9 h-9 rounded-sm border border-zinc-700 object-cover group-hover:border-yellow-500 transition-colors" alt="" />
                                        {idx === 0 && <Crown className="absolute -top-2 -left-2 w-4 h-4 text-yellow-500 drop-shadow-md" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-white truncate max-w-[150px] group-hover:text-yellow-400 transition-colors">{p.nickname}</span>
                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
                                            Szczegóły <ArrowUpRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-3 text-center bg-black/20">
                                    <span className="font-black text-emerald-400">{p.kills}</span>
                                    <span className="text-zinc-600 font-bold mx-1">-</span>
                                    <span className="font-black text-red-400">{p.deaths}</span>
                                    <span className="text-zinc-600 font-bold mx-1">-</span>
                                    <span className="font-bold text-zinc-400">{p.assists}</span>
                                </td>
                                <td className="px-3 py-3 text-center font-bold text-zinc-300 hidden md:table-cell">{p.damage}</td>
                                <td className="px-3 py-3 text-center">
                                    {p.mvp > 0 ? (
                                        <span className="inline-flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black px-2 py-0.5 rounded text-xs">
                                            <Star className="w-3 h-3 mr-1" fill="currentColor" /> {p.mvp}
                                        </span>
                                    ) : <span className="text-zinc-700">-</span>}
                                </td>
                                <td className="px-3 py-3 text-center font-bold text-zinc-400 hidden lg:table-cell">{p.ef}</td>
                                <td className="px-3 py-3 text-center font-bold text-orange-400 hidden lg:table-cell">{p.ud}</td>
                                <td className="px-3 py-3 text-center bg-black/20">
                                    <span className="font-black text-yellow-500 text-sm drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]">{parseFloat(p.rating).toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <span className={`text-xs font-black px-2.5 py-1 rounded inline-flex items-center justify-center gap-1 min-w-[50px] ${p.elo_change > 0 ? 'text-emerald-400 bg-emerald-900/20 border border-emerald-900/50' : 'text-red-400 bg-red-900/20 border border-red-900/50'}`}>
                                        {p.elo_change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {Math.abs(p.elo_change)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black pb-28">
            <Head title={`Mecz #${matchData.id} - Historia`} />

            {selectedPlayer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200 p-4">
                    <div className="bg-[#0e0e11] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative transform animate-in zoom-in-95 duration-200">
                        <div className={`h-32 w-full absolute top-0 left-0 bg-gradient-to-b ${selectedPlayer.team === 'team_a' ? 'from-blue-600/20' : 'from-red-600/20'} to-transparent pointer-events-none`}></div>
                        
                        <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-red-500 text-zinc-400 hover:text-white rounded-full transition-colors border border-zinc-700/50 hover:border-red-500">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 relative z-10 flex flex-col items-center mt-4">
                            <div className="relative mb-4">
                                <img src={selectedPlayer.user?.avatar_url || 'https://steamuserimages-a.akamaihd.net/ugc/885384897182110030/F095539864AC9E94AE5236E04C8CA7C2725BCEEA/'} alt="" className={`w-28 h-28 rounded-xl object-cover border-2 shadow-2xl ${selectedPlayer.team === 'team_a' ? 'border-blue-500' : 'border-red-500'}`} />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#131317] border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 whitespace-nowrap shadow-lg">
                                    <Shield className={`w-3 h-3 ${selectedPlayer.team === 'team_a' ? 'text-blue-500' : 'text-red-500'}`} /> 
                                    {selectedPlayer.team === 'team_a' ? matchData.team_a_name : matchData.team_b_name}
                                </div>
                            </div>
                            
                            <h2 className="text-3xl font-black text-white uppercase tracking-wider text-center">{selectedPlayer.nickname}</h2>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.3em] mt-2 mb-8">Karta Zawodnika</p>

                            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-[#131317] border border-zinc-800/80 rounded-lg p-4 text-center shadow-inner">
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Rating HLTV</div>
                                    <div className="text-3xl font-black text-yellow-500 drop-shadow-md">{parseFloat(selectedPlayer.rating).toFixed(2)}</div>
                                </div>
                                <div className="bg-[#131317] border border-zinc-800/80 rounded-lg p-4 text-center shadow-inner">
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">SZELO</div>
                                    <div className={`text-3xl font-black flex items-center justify-center gap-1 ${selectedPlayer.elo_change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {selectedPlayer.elo_change > 0 ? '+' : ''}{selectedPlayer.elo_change}
                                    </div>
                                </div>
                                <div className="bg-[#131317] border border-zinc-800/80 rounded-lg p-4 text-center shadow-inner">
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">K/D Ratio</div>
                                    <div className="text-3xl font-black text-white">
                                        {selectedPlayer.deaths > 0 ? (selectedPlayer.kills / selectedPlayer.deaths).toFixed(2) : selectedPlayer.kills.toFixed(2)}
                                    </div>
                                </div>
                                <div className="bg-[#131317] border border-zinc-800/80 rounded-lg p-4 text-center shadow-inner">
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Obrażenia</div>
                                    <div className="text-3xl font-black text-zinc-300">{selectedPlayer.damage}</div>
                                </div>
                            </div>

                            <div className="w-full bg-[#131317]/50 border border-zinc-800/50 rounded-xl p-6">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-yellow-500" /> Zaawansowane Metryki
                                </h4>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest" title="Zabójstwa">Kills</span>
                                            <span className="text-sm font-black text-emerald-400">{selectedPlayer.kills}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest" title="Asysty">Assists</span>
                                            <span className="text-sm font-black text-zinc-300">{selectedPlayer.assists}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest" title="Śmierci">Deaths</span>
                                            <span className="text-sm font-black text-red-400">{selectedPlayer.deaths}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1" title="Opening Duels won"><Crosshair className="w-3 h-3 text-blue-400"/> 1st Kills</span>
                                            <span className="text-sm font-black text-blue-400">{selectedPlayer.first_kills}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest" title="Podwójne zabójstwa">2K Rounds</span>
                                            <span className="text-sm font-black text-white">{selectedPlayer.k2}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest" title="Potrójne zabójstwa">3K Rounds</span>
                                            <span className="text-sm font-black text-white">{selectedPlayer.k3}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest" title="Poczwórne zabójstwa">4K Rounds</span>
                                            <span className="text-sm font-black text-white">{selectedPlayer.k4}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1" title="ACE"><Flame className="w-3 h-3 text-orange-500"/> ACE (5K)</span>
                                            <span className="text-sm font-black text-orange-500">{selectedPlayer.k5}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 md:col-span-1 col-span-2">
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1" title="MVP"><Trophy className="w-3 h-3 text-yellow-500" /> MVP</span>
                                            <span className="text-sm font-black text-yellow-500">{selectedPlayer.mvp}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1" title="Effective Flashes"><Zap className="w-3 h-3 text-blue-400"/> Flash EF</span>
                                            <span className="text-sm font-black text-zinc-300">{selectedPlayer.ef}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1" title="Utility Damage"><Flame className="w-3 h-3 text-orange-400"/> Util DMG</span>
                                            <span className="text-sm font-black text-orange-400">{selectedPlayer.ud}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1">
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1" title="Wygrane Clutche 1vX"><Skull className="w-3 h-3 text-purple-400"/> Clutches</span>
                                            <span className="text-sm font-black text-purple-400">{selectedPlayer.clutch_kills}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="sticky top-0 z-50 bg-[#0a0a0c]/90 border-b border-zinc-800/60 backdrop-blur-xl">
                <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/history" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group">
                        <div className="p-2 bg-zinc-900 rounded group-hover:bg-zinc-800 transition-colors"><ChevronLeft className="w-4 h-4" /></div>
                        <span className="text-xs font-bold uppercase tracking-widest">Wróć do listy</span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-[1400px] mx-auto py-12 px-6">
                
                <div 
                    className="bg-[#0e0e11] border border-zinc-800/80 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-cover bg-center"
                    style={{ backgroundImage: matchData.map_history && matchData.map_history.length > 0 ? `url(${getMapImage(matchData.map_history[0].map)})` : 'none' }}
                >
                    <div className="absolute inset-0 bg-[#070708]/80 backdrop-blur-sm z-0"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent z-0"></div>
                    <div className={`absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r ${winA ? 'from-blue-600/20' : 'from-zinc-600/10'} to-transparent blur-3xl z-0`}></div>
                    <div className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l ${winB ? 'from-red-600/20' : 'from-zinc-600/10'} to-transparent blur-3xl z-0`}></div>
                    
                    <div className="relative z-10 w-full md:w-1/3 text-center md:text-left mb-6 md:mb-0">
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] mb-3 flex items-center justify-center md:justify-start gap-2">
                            <Calendar className="w-3 h-3" /> {new Date(matchData.created_at).toLocaleString()}
                        </div>
                        <h2 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-2xl ${winA ? 'text-white' : 'text-zinc-400'}`}>
                            {matchData.team_a_name}
                        </h2>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-black/60 backdrop-blur-md border border-zinc-700/50 rounded-2xl px-10 py-5 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex items-center justify-center min-w-[200px] mb-4 transform hover:scale-105 transition-transform duration-300">
                            <span className={`text-6xl font-black drop-shadow-[0_0_15px_currentColor] ${winA ? 'text-blue-500' : (isDraw ? 'text-white' : 'text-zinc-500')}`}>{matchData.series_score_a}</span>
                            <span className="mx-6 text-zinc-600 font-black text-3xl">:</span>
                            <span className={`text-6xl font-black drop-shadow-[0_0_15px_currentColor] ${winB ? 'text-red-500' : (isDraw ? 'text-white' : 'text-zinc-500')}`}>{matchData.series_score_b}</span>
                        </div>
                        <div className="bg-yellow-500 text-black px-5 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center gap-2">
                            <Trophy className="w-3 h-3" strokeWidth={3} /> {matchData.format}
                        </div>
                    </div>

                    <div className="relative z-10 w-full md:w-1/3 text-center md:text-right mt-6 md:mt-0">
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] mb-3 flex items-center justify-center md:justify-end gap-2">
                            ID Meczu: #{matchData.id} <Crosshair className="w-3 h-3" />
                        </div>
                        <h2 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-2xl ${winB ? 'text-white' : 'text-zinc-400'}`}>
                            {matchData.team_b_name}
                        </h2>
                    </div>
                </div>

                <div className="flex gap-2 border-b border-zinc-800 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-4 font-black text-xs uppercase tracking-widest whitespace-nowrap rounded-t-lg transition-all border-b-2 ${activeTab === 'overview' ? 'bg-[#131317] text-yellow-500 border-yellow-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50 border-transparent'}`}
                    >
                        Podsumowanie Serii
                    </button>
                    
                    {matchData.map_history && matchData.map_history.map((m: any, index: number) => (
                        <button 
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`px-6 py-4 font-black text-xs uppercase tracking-widest whitespace-nowrap rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${activeTab === index ? 'bg-[#131317] text-white border-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50 border-transparent'}`}
                        >
                            <MapIcon className="w-3 h-3" /> Mapa {index + 1}: {m.map.replace('de_', '')}
                        </button>
                    ))}
                </div>

                <div className="animate-in fade-in duration-500">
                    {activeTab === 'overview' ? (
                        <>
                            {matchData.map_history && matchData.map_history.length > 0 && (
                                <div className="mb-8">
                                    <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-4">Rozegrane Mapy</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {matchData.map_history.map((m: any, idx: number) => {
                                            const mapWinA = m.score_a > m.score_b;
                                            const mapWinB = m.score_b > m.score_a;
                                            
                                            return (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => setActiveTab(idx)}
                                                    className="relative h-28 rounded-xl overflow-hidden group cursor-pointer border border-zinc-800 hover:border-yellow-500/50 transition-all shadow-lg"
                                                >
                                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${getMapImage(m.map)})` }}></div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-[#0e0e11]/60 to-transparent"></div>
                                                    
                                                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                                        <div className="text-[9px] text-yellow-500 font-black uppercase tracking-widest mb-1">Mapa {idx + 1}</div>
                                                        <div className="flex items-end justify-between">
                                                            <div className="text-sm font-black text-white uppercase tracking-wider">{m.map.replace('de_', '')}</div>
                                                            <div className="bg-black/80 backdrop-blur-sm border border-zinc-700 px-2 py-1 rounded text-xs font-black flex gap-1">
                                                                <span className={mapWinA ? 'text-blue-400' : 'text-zinc-400'}>{m.score_a}</span>
                                                                <span className="text-zinc-600">:</span>
                                                                <span className={mapWinB ? 'text-red-400' : 'text-zinc-400'}>{m.score_b}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {(() => {
                                const mvpPlayer = matchData.players && matchData.players.length > 0 
                                    ? matchData.players.reduce((prev: any, current: any) => parseFloat(current.rating) > parseFloat(prev.rating) ? current : prev)
                                    : null;

                                return mvpPlayer ? (
                                    <div className="mb-8 bg-gradient-to-r from-yellow-500/20 via-[#131317] to-[#131317] border border-yellow-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.1)] flex flex-col md:flex-row items-center gap-6 md:gap-8 group transition-all hover:shadow-[0_0_60px_rgba(234,179,8,0.2)]">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-3xl rounded-full pointer-events-none"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="relative">
                                                <img src={mvpPlayer.user?.avatar_url || 'https://steamuserimages-a.akamaihd.net/ugc/885384897182110030/F095539864AC9E94AE5236E04C8CA7C2725BCEEA/'} alt="MVP" className="w-28 h-28 rounded-xl object-cover border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)] transform group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 p-2 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)] border-2 border-[#131317]">
                                                    <Crown className="w-6 h-6 text-black" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 text-center md:text-left z-10 mt-2 md:mt-0">
                                            <div className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.5em] mb-1 animate-pulse">Most Valuable Player</div>
                                            <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider truncate max-w-sm drop-shadow-md">{mvpPlayer.nickname}</h3>
                                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 flex items-center justify-center md:justify-start gap-2">
                                                <Shield className={`w-4 h-4 ${mvpPlayer.team === 'team_a' ? 'text-blue-400' : 'text-red-400'}`} />
                                                <span className={mvpPlayer.team === 'team_a' ? 'text-blue-400' : 'text-red-400'}>{mvpPlayer.team === 'team_a' ? matchData.team_a_name : matchData.team_b_name}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 z-10 bg-[#0a0a0c]/80 backdrop-blur-sm border border-zinc-700/50 px-8 py-5 rounded-2xl shadow-inner mt-4 md:mt-0">
                                            <div className="text-center">
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Rating 2.0</div>
                                                <div className="text-4xl font-black text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]">{parseFloat(mvpPlayer.rating).toFixed(2)}</div>
                                            </div>
                                            <div className="w-px h-16 bg-zinc-800"></div>
                                            <div className="text-center">
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">K-D</div>
                                                <div className="text-2xl font-black text-white tracking-widest">{mvpPlayer.kills}<span className="text-zinc-600 mx-1">-</span>{mvpPlayer.deaths}</div>
                                            </div>
                                            <div className="w-px h-16 bg-zinc-800"></div>
                                            <div className="text-center">
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">SZELO</div>
                                                <div className={`text-2xl font-black flex items-center justify-center gap-1 ${mvpPlayer.elo_change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {mvpPlayer.elo_change > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                                    {Math.abs(mvpPlayer.elo_change)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null;
                            })()}

                            <div className="mb-6 bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-zinc-400 font-medium leading-relaxed">
                                    <strong className="text-white">Wskazówka:</strong> Kliknij na dowolnego zawodnika w tabeli, aby otworzyć jego szczegółową Kartę Gracza i sprawdzić zaawansowane statystyki takie jak otwierające zabójstwa, clutche czy multikille (ACE).
                                </span>
                            </div>

                            <PlayerTable 
                                players={teamA} 
                                teamName={matchData.team_a_name} 
                                matchStatus={winA ? 'win' : winB ? 'loss' : 'draw'} 
                                accentColor="blue" 
                            />
                            <PlayerTable 
                                players={teamB} 
                                teamName={matchData.team_b_name} 
                                matchStatus={winB ? 'win' : winA ? 'loss' : 'draw'} 
                                accentColor="red" 
                            />
                        </>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="w-full lg:w-1/3">
                                <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
                                    <div className="h-56 bg-cover bg-center transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: `url(${getMapImage(matchData.map_history[activeTab].map)})` }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-[#0e0e11]/80 to-transparent"></div>
                                    </div>
                                    <div className="p-8 relative -mt-20 z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.3em] drop-shadow-md bg-black/50 px-3 py-1 rounded backdrop-blur-sm">Mapa {activeTab + 1}</div>
                                            <MapIcon className="w-5 h-5 text-zinc-500" />
                                        </div>
                                        
                                        <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-8 drop-shadow-lg">{matchData.map_history[activeTab].map.replace('de_', '')}</h3>
                                        
                                        <div className="bg-[#131317]/80 backdrop-blur-sm border border-zinc-700/80 rounded-xl p-6 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-8">
                                            <div className="text-center w-2/5">
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 truncate" title={matchData.team_a_name}>{matchData.team_a_name}</div>
                                                <div className={`text-4xl font-black drop-shadow-md ${matchData.map_history[activeTab].score_a > matchData.map_history[activeTab].score_b ? 'text-blue-500' : 'text-zinc-400'}`}>
                                                    {matchData.map_history[activeTab].score_a}
                                                </div>
                                            </div>
                                            <div className="text-zinc-600 font-black text-2xl w-1/5 text-center">:</div>
                                            <div className="text-center w-2/5">
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 truncate" title={matchData.team_b_name}>{matchData.team_b_name}</div>
                                                <div className={`text-4xl font-black drop-shadow-md ${matchData.map_history[activeTab].score_b > matchData.map_history[activeTab].score_a ? 'text-red-500' : 'text-zinc-400'}`}>
                                                    {matchData.map_history[activeTab].score_b}
                                                </div>
                                            </div>
                                        </div>

                                        {matchData.demo_links && matchData.demo_links[activeTab] ? (
                                            <a href={matchData.demo_links[activeTab]} target="_blank" rel="noreferrer" className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black border border-emerald-500/30 py-4 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 transform skew-x-[-5deg]">
                                                <span className="block transform skew-x-[5deg] flex items-center gap-2"><Download className="w-4 h-4" /> Pobierz Demo GOTV</span>
                                            </a>
                                        ) : (
                                            <div className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 py-4 rounded-lg font-bold text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-2">
                                                <Info className="w-4 h-4" /> Plik demo niedostępny
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full lg:w-2/3 flex items-center justify-center bg-[#0e0e11]/50 border border-zinc-800/50 rounded-2xl p-10 border-dashed relative overflow-hidden group">
                                <div className="absolute inset-0 bg-zinc-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="text-center relative z-10 max-w-md">
                                    <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <Target className="w-10 h-10 text-zinc-600" />
                                    </div>
                                    <h4 className="text-xl font-black text-zinc-300 uppercase tracking-wider mb-3">Statystyki Mapy</h4>
                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                                        Obecnie algorytm serwera CS2 (MatchZy) sumuje i przesyła wyniki wyłącznie na koniec całej serii. Aby zobaczyć zaawansowaną wydajność graczy, wróć do zakładki <strong className="text-zinc-300">Podsumowanie Serii</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
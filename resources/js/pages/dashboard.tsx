import { Head, usePage, router, Link } from '@inertiajs/react';
import { 
    Trophy, Target, Crown, ChevronRight, Clock, Server, Download,
    Map, Key, Gamepad2, Hash, Play, Swords, ChevronLeft, LogOut
} from 'lucide-react';
import React, { useState } from 'react';
import PromoBanner from '../components/PromoBanner';
import LogoIemSztum from '../components/LogoIemSztum';

interface User {
    id: number;
    steam_id: string;
    nickname: string;
    avatar_url: string;
    role: string;
    elo: number;
    matches_played: number;
    mvps: number;
}

interface LobbyData {
    id: number;
    code: string;
    format: string;
    team_size: number;
}

interface PageProps {
    auth: {
        user: User;
    };
    active_lobby: LobbyData | null;
    server_stats: {
        available: number;
        total: number;
    };
    recent_matches?: any[];
    [key: string]: any;
}

const getLevelInfo = (elo: number) => {
    if (elo < 800) return { level: 1, min: 0, max: 800, color: 'from-zinc-500 to-zinc-700', text: 'text-zinc-400' };
    if (elo < 1200) return { level: 2, min: 800, max: 1200, color: 'from-emerald-500 to-emerald-700', text: 'text-emerald-400' };
    if (elo < 1600) return { level: 3, min: 1200, max: 1600, color: 'from-blue-500 to-blue-700', text: 'text-blue-400' };
    if (elo < 2000) return { level: 4, min: 1600, max: 2000, color: 'from-purple-500 to-purple-700', text: 'text-purple-400' };
    return { level: 5, min: 2000, max: 3000, color: 'from-yellow-400 to-orange-600', text: 'text-yellow-400' };
};

const getMapImage = (mapName: string) => {
    if (!mapName) return '';
    const mapLower = mapName.toLowerCase();
    const name = mapLower.replace('de_', '').replace('am_', '');
    const standardMaps = ['mirage', 'dust2', 'inferno', 'nuke', 'ancient', 'anubis', 'vertigo', 'overpass'];
    
    if (standardMaps.includes(name)) {
        return `https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/thumbs/de_${name}_1_png.png`;
    }
    return `https://image.gametracker.com/images/maps/160x120/csgo/${mapLower}.jpg`;
};

export default function Dashboard() {
    const { auth, active_lobby, server_stats, recent_matches = [], errors } = usePage<PageProps>().props;
    const user = auth.user;
    const levelInfo = getLevelInfo(user.elo);
    const progress = user.elo >= 2500 ? 100 : ((user.elo - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [lobbyCode, setLobbyCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const handleCreateLobby = () => {
        setIsCreating(true);
        router.post('/lobbies', {}, {
            onError: () => setIsCreating(false)
        });
    };

    const handleJoinLobby = () => {
        if (lobbyCode.length !== 6) return;
        setIsJoining(true);
        
        router.post('/lobbies/join', { code: lobbyCode }, {
            onError: () => setIsJoining(false)
        });
    };

    return (
        <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black">
            <Head title="PANEL" />

            <PromoBanner positionY="bottom" positionX="right" />

            <nav className="sticky top-0 z-50 bg-[#0a0a0c]/90 border-b border-zinc-800/60 backdrop-blur-xl">
                <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3">
                            <LogoIemSztum className="w-10 h-10" />
                            <div className="text-xl font-black tracking-tighter text-white uppercase italic">
                                IEM <span className="text-yellow-500">SZTUM</span>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-2">
                            <Link href="/dashboard" className="px-5 py-2 text-xs font-bold text-black uppercase tracking-wider bg-yellow-500 rounded-sm transform skew-x-[-10deg]">
                                <span className="block transform skew-x-[10deg]">PANEL</span>
                            </Link>
                            <Link href="/history" className="px-5 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider hover:text-white transition-colors transform skew-x-[-10deg]">
                                <span className="block transform skew-x-[10deg]">Historia Meczów</span>
                            </Link>
                            <Link href="/statistics" className="px-5 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider hover:text-white transition-colors transform skew-x-[-10deg]">
                                <span className="block transform skew-x-[10deg]">Statystyki</span>
                            </Link>
                            {user.role === 'admin' && (
                                <Link href="/admin/dashboard" className="px-5 py-2 text-xs font-bold text-red-400 uppercase tracking-wider hover:text-red-300 transition-colors transform skew-x-[-10deg] ml-4 border border-red-900/50 bg-red-900/10">
                                    <span className="block transform skew-x-[10deg]">Admin Panel</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-2 bg-[#131317] border border-zinc-800/80 px-3 py-1.5 rounded-sm">
                            <Server className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dostępne serwery:</span>
                            <span className="text-xs font-black text-white">{server_stats.available}<span className="text-zinc-600">/{server_stats.total}</span></span>
                        </div>

                        <div className="relative">
                            <div 
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors">{user.nickname}</span>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{user.role}</span>
                                </div>
                                <div className="relative">
                                    <img
                                        src={user.avatar_url}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-sm bg-zinc-800 object-cover border border-zinc-700 group-hover:border-yellow-500 transition-colors"
                                    />
                                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#0a0a0c] rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                    </div>
                                </div>
                            </div>

                            {isDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40 cursor-default" 
                                        onClick={() => setIsDropdownOpen(false)}
                                    ></div>
                                    
                                    <div className="absolute right-0 mt-3 w-56 bg-[#0a0a0c]/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-50 p-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                                        
                                        <div className="px-3 py-2 border-b border-zinc-800/60 mb-2">
                                            <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Dodatkowa nawigacja</span>
                                            {/* <span className="block text-xs text-zinc-300 font-black truncate mt-0.5">{user.nickname}</span> */}
                                        </div>

                                        <button
                                            onClick={() => router.post('/logout')}
                                            className="relative w-full text-left px-3 py-2.5 text-xs font-bold text-zinc-400 hover:text-red-400 uppercase tracking-widest transition-all duration-300 flex items-center gap-3 rounded-lg overflow-hidden group"
                                        >
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)] transition-all duration-300 group-hover:h-3/4 rounded-r-full"></div>
                                            
                                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                            <LogOut className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" /> 
                                            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">Wyloguj się</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1800px] mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-gradient-to-b from-[#131317] to-[#0a0a0c] border border-zinc-800/80 rounded-3xl p-8 relative overflow-hidden group shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                        
                        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 transition-all duration-700 group-hover:scale-125 group-hover:bg-yellow-500/15 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
                        
                        <div className="flex flex-col items-center mb-10 relative z-10">
                            <div className="relative mb-6 group/avatar cursor-default">
                                <div className="absolute inset-0 bg-yellow-500/30 blur-2xl rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500"></div>
                                
                                <img 
                                    src={user.avatar_url} 
                                    alt={user.nickname} 
                                    className="w-32 h-32 rounded-2xl object-cover border-2 border-zinc-700/80 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 relative group-hover/avatar:border-yellow-500/50 transition-colors duration-300" 
                                />
                                
                                <div className={`absolute -bottom-3 -right-3 w-14 h-14 transform rotate-45 bg-gradient-to-br ${levelInfo.color} p-1 shadow-[0_0_20px_rgba(0,0,0,0.8)] z-20 group-hover/avatar:scale-110 transition-transform duration-300 ease-out`}>
                                    <div className="w-full h-full bg-[#0e0e11] flex items-center justify-center border border-black/60 shadow-inner">
                                        <span className={`transform -rotate-45 text-2xl font-black ${levelInfo.text} drop-shadow-md`}>
                                            {levelInfo.level}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg text-center leading-none mt-2">{user.nickname}</h2>
                            <div className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.4em] mt-3 bg-black/40 px-4 py-1.5 rounded-full border border-zinc-800/80 shadow-inner">
                                Twój Profil
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="bg-[#0a0a0c]/90 backdrop-blur-md border border-zinc-700/50 hover:border-zinc-600/50 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group/elo">
                
                            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${levelInfo.color} opacity-10 blur-3xl group-hover/elo:opacity-20 transition-opacity duration-500 pointer-events-none`}></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Target className={`w-4 h-4 ${levelInfo.text} drop-shadow-[0_0_8px_currentColor]`} />
                                        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em]">Twoje SZELO</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-4xl md:text-5xl font-black ${levelInfo.text} drop-shadow-[0_0_15px_currentColor] tracking-tighter leading-none`}>
                                            {user.elo}
                                        </span>
                                        {levelInfo.level !== 5 && (
                                            <span className="text-xs text-zinc-500 font-bold tracking-widest">
                                                / {levelInfo.max}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end justify-start">
                                    {levelInfo.level === 5 ? (
                                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 text-yellow-500 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest shadow-inner flex items-center gap-1.5">
                                            <Crown className="w-3 h-3" /> Max LVL
                                        </div>
                                    ) : (
                                        <div className="bg-[#131317] border border-zinc-800 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] text-zinc-400 flex flex-col items-center shadow-inner group-hover/elo:border-zinc-600 transition-colors">
                                            <span className="text-white text-sm mb-0.5">{Math.max(0, levelInfo.max - user.elo)}</span>
                                            <span className="text-zinc-500 text-[8px]">PKT DO AWANSU</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="w-full bg-[#070708] rounded-full h-3 border border-zinc-800 overflow-hidden relative shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)]">
                                    <div 
                                        className={`h-full rounded-full bg-gradient-to-r ${levelInfo.color} relative transition-all duration-1000 ease-out flex items-center justify-end`} 
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20 mix-blend-overlay"></div>
                                        
                                        <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/50 to-white/90 blur-[2px]"></div>
                                        
                                        <div className="w-1.5 h-full bg-white rounded-r-full shadow-[0_0_10px_#fff]"></div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-3 px-1">
                                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${levelInfo.text} drop-shadow-[0_0_5px_currentColor]`}>
                                        <ChevronLeft className="w-3 h-3 opacity-50" />
                                        Poziom {levelInfo.level}
                                    </div>
                                    
                                    {levelInfo.level !== 5 ? (
                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 transition-colors group-hover/elo:text-zinc-400">
                                            Poziom {levelInfo.level + 1}
                                            <ChevronRight className="w-3 h-3 opacity-50" />
                                        </div>
                                    ) : (
                                        <div className="text-[10px] font-black uppercase tracking-widest text-yellow-500 flex items-center gap-1.5 drop-shadow-[0_0_5px_currentColor]">
                                            Global Elite <Crown className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-gradient-to-b from-[#1a1a20] to-[#131317] border border-zinc-700/50 hover:border-zinc-500/50 rounded-2xl p-5 text-center group/stat transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                                    <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-800 group-hover/stat:border-zinc-500 group-hover:bg-zinc-800 transition-colors shadow-inner">
                                        <Target className="w-5 h-5 text-zinc-400 group-hover/stat:text-white transition-colors" />
                                    </div>
                                    <div className="text-3xl font-black text-white drop-shadow-md">{user.matches_played}</div>
                                    <div className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1.5">Rozgrywek</div>
                                </div>
                                
                                <div className="bg-gradient-to-b from-[#1a1a20] to-[#131317] border border-yellow-900/30 hover:border-yellow-500/50 rounded-2xl p-5 text-center group/stat transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-[0_10px_20px_rgba(234,179,8,0.15)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 blur-xl rounded-full pointer-events-none"></div>
                                    <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-500/30 group-hover/stat:border-yellow-500 group-hover:bg-yellow-500/20 transition-colors shadow-inner relative z-10">
                                        <Crown className="w-5 h-5 text-yellow-500 group-hover/stat:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className="text-3xl font-black text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)] relative z-10">{user.mvps}</div>
                                    <div className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1.5 relative z-10">Tytuły MVP</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-9 flex flex-col gap-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {active_lobby ? (
                            <div className="bg-[#0e0e11] border border-emerald-500/30 rounded-lg p-8 relative overflow-hidden group flex flex-col justify-between">
                                <div className="absolute inset-0 bg-[url('https://community.fastly.steamstatic.com/public/shared/images/responsive/header_logo.png')] bg-no-repeat bg-right-bottom opacity-5 mix-blend-overlay"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
                                
                                <div className="relative z-10 mb-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Aktywna Poczekalnia</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">KOD: {active_lobby.code}</h2>
                                    <p className="text-sm text-zinc-400 font-medium">
                                        Posiadasz już utworzoną i aktywną poczekalnię. Zbierz drużynę i przejdź do fazy Veto lub zamknij je wewnątrz pokoju.
                                    </p>
                                </div>

                                <Link href={`/lobbies/${active_lobby.code}`} className="relative z-10 w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-sm font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transform skew-x-[-5deg]">
                                    <span className="block transform skew-x-[5deg] flex items-center gap-2">
                                        <Play className="w-5 h-5" fill="currentColor" /> WRÓĆ DO poczekalni
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-[#0e0e11] border border-yellow-500/20 rounded-lg p-8 relative overflow-hidden group flex flex-col justify-between">
                                <div className="absolute inset-0 bg-[url('https://community.fastly.steamstatic.com/public/shared/images/responsive/header_logo.png')] bg-no-repeat bg-right-bottom opacity-5 mix-blend-overlay"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full"></div>
                                
                                <div className="relative z-10 mb-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                                        <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">NOWA ROZGRYWKA</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Utwórz poczekalnię</h2>
                                    <p className="text-sm text-zinc-400 font-medium">
                                        Wygeneruj unikalny kod. Skonfiguruj tryb (1v1 - 5v5), system BO1/BO3/BO5, zarządzaj drużynami i banowaniem map.
                                    </p>
                                </div>

                                <button 
                                    onClick={handleCreateLobby}
                                    disabled={isCreating || server_stats.available === 0}
                                    className={`relative z-10 w-full py-4 rounded-sm font-black text-sm uppercase tracking-wider transition-all transform skew-x-[-5deg] flex items-center justify-center gap-2 ${
                                        server_stats.available === 0 
                                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50 shadow-none' 
                                            : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)]'
                                    }`}
                                >
                                    <span className="block transform skew-x-[5deg] flex items-center gap-2">
                                        <Play className="w-5 h-5" /> 
                                        {server_stats.available === 0 
                                            ? 'BRAK WOLNYCH SERWERÓW' 
                                            : (isCreating ? 'TWORZENIE...' : 'ROZPOCZNIJ NOWĄ POCZEKALNIĘ')}
                                    </span>
                                </button>
                                {server_stats.available === 0 && (
                                    <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2 text-center">
                                        Wszystkie serwery meczowe są obecnie zajęte. Poczekaj, aż ktoś zakończy rozgrywkę.
                                    </div>
                                )}
                                {errors.error && (
                                    <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2 text-center">
                                        {errors.error}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-[#0e0e11] border border-zinc-800/60 rounded-lg p-8 relative overflow-hidden flex flex-col justify-between">
                            <div className="relative z-10 mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Dołączanie</span>
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Kod Dostępu</h2>
                                <p className="text-sm text-zinc-400 font-medium">
                                    Otrzymałeś kod od znajomego? Wpisz go poniżej, aby dołączyć do poczekalni i czekać na przydział do drużyny.
                                </p>
                            </div>

                            <div className="relative z-10 flex flex-col gap-2">
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                            <Hash className="w-4 h-4 text-zinc-500" />
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="KOD POCZEKALNI (6 ZNAKÓW)" 
                                            value={lobbyCode}
                                            onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                                            maxLength={6}
                                            className={`w-full bg-[#131317] border ${errors.code ? 'border-red-500' : 'border-zinc-800 focus:border-blue-500'} focus:ring-1 focus:ring-blue-500 text-white rounded-sm pl-10 pr-4 py-4 text-sm font-bold tracking-widest uppercase outline-none transition-all placeholder:text-zinc-600 placeholder:font-normal`}
                                        />
                                    </div>
                                    <button 
                                        onClick={handleJoinLobby}
                                        disabled={lobbyCode.length !== 6 || isJoining}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-sm font-black text-sm uppercase tracking-wider transition-all border border-zinc-700/50 flex items-center justify-center gap-2 transform skew-x-[-5deg] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="block transform skew-x-[5deg] flex items-center gap-2">
                                            <Gamepad2 className="w-4 h-4" /> {isJoining ? '...' : 'DOŁĄCZ'}
                                        </span>
                                    </button>
                                </div>
                                {errors.code && (
                                    <div className="text-red-500 text-xs font-bold uppercase tracking-wider mt-1">{errors.code}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0e0e11] border border-zinc-800/60 rounded-lg flex-1 flex flex-col">
                        <div className="px-8 py-5 border-b border-zinc-800/60 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-zinc-500" />
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Twoje Ostatnie Mecze</h3>
                            </div>
                            <Link href="/history" className="text-xs font-bold text-zinc-500 hover:text-white flex items-center transition-colors uppercase tracking-widest">
                                Pełna historia <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                        
                        {recent_matches.length > 0 ? (
                            <div className="flex-1 p-3 space-y-3">
                                {recent_matches.map((match) => {
                                    const winA = match.series_score_a > match.series_score_b;
                                    const winB = match.series_score_b > match.series_score_a;
                                    const isDraw = match.series_score_a === match.series_score_b;
                                    const firstMap = match.map_history && match.map_history.length > 0 ? match.map_history[0].map : '';
                                    
                                    return (
                                        <Link key={match.id} href={`/history/${match.id}`} className="relative flex items-center justify-between border border-zinc-800/80 rounded-md transition-colors group overflow-hidden h-20 shadow-md">
                                            <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundImage: firstMap ? `url(${getMapImage(firstMap)})` : 'none' }}></div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#131317] via-[#131317]/80 to-[#131317]/40"></div>
                                            
                                            <div className="relative z-10 flex items-center gap-6 w-1/3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">{new Date(match.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-wider bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded w-fit">{match.format}</span>
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex items-center justify-center gap-4 w-1/3">
                                                <span className={`text-sm font-black uppercase tracking-wider truncate w-24 text-right ${winA ? 'text-white' : (isDraw ? 'text-zinc-400' : 'text-zinc-500')}`}>{match.team_a_name}</span>
                                                <div className="flex items-center bg-black/60 backdrop-blur-sm border border-zinc-700/80 rounded px-4 py-1.5 shadow-inner">
                                                    <span className={`text-lg font-black ${winA ? 'text-blue-400' : 'text-white'}`}>{match.series_score_a}</span>
                                                    <span className="mx-2 text-zinc-600 font-bold">-</span>
                                                    <span className={`text-lg font-black ${winB ? 'text-red-400' : 'text-white'}`}>{match.series_score_b}</span>
                                                </div>
                                                <span className={`text-sm font-black uppercase tracking-wider truncate w-24 text-left ${winB ? 'text-white' : (isDraw ? 'text-zinc-400' : 'text-zinc-500')}`}>{match.team_b_name}</span>
                                            </div>

                                            <div className="relative z-10 flex justify-end w-1/3 pr-4">
                                                <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    Zobacz szczegóły <ChevronRight className="w-3 h-3 ml-1" />
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 p-6 flex items-center justify-center text-center min-h-[200px]">
                                <div>
                                    <Swords className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                    <div className="text-sm font-bold text-zinc-400">Brak historii spotkań</div>
                                    <div className="text-xs text-zinc-600 mt-1">Rozegraj swój pierwszy mecz, aby zobaczyć statystyki.</div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
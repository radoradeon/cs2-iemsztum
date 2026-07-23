import { Head, usePage, router, Link } from '@inertiajs/react';
import { 
    Trophy, Target, Crown, ChevronRight, Clock, Server, Download,
    Map, Key, Gamepad2, Hash, Play
} from 'lucide-react';
import React, { useState } from 'react';

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
    [key: string]: any;
}

const getLevelInfo = (elo: number) => {
    if (elo < 800) return { level: 1, min: 0, max: 800, color: 'from-zinc-500 to-zinc-700', text: 'text-zinc-400' };
    if (elo < 1200) return { level: 2, min: 800, max: 1200, color: 'from-emerald-500 to-emerald-700', text: 'text-emerald-400' };
    if (elo < 1600) return { level: 3, min: 1200, max: 1600, color: 'from-blue-500 to-blue-700', text: 'text-blue-400' };
    if (elo < 2000) return { level: 4, min: 1600, max: 2000, color: 'from-purple-500 to-purple-700', text: 'text-purple-400' };
    return { level: 5, min: 2000, max: 3000, color: 'from-yellow-400 to-orange-600', text: 'text-yellow-400' };
};

export default function Dashboard() {
    const { auth, active_lobby, server_stats, errors } = usePage<PageProps>().props;
    const user = auth.user;
    const levelInfo = getLevelInfo(user.elo);
    const progress = user.elo >= 2500 ? 100 : ((user.elo - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100;

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

            <nav className="sticky top-0 z-50 bg-[#0a0a0c]/90 border-b border-zinc-800/60 backdrop-blur-xl">
                <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm flex items-center justify-center transform -skew-x-12 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                                <Trophy className="w-4 h-4 text-black transform skew-x-12" strokeWidth={3} />
                            </div>
                            <div className="text-xl font-black tracking-tighter text-white uppercase italic">
                                IEM <span className="text-yellow-500">SZTUM</span>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-2">
                            <button className="px-5 py-2 text-xs font-bold text-black uppercase tracking-wider bg-yellow-500 rounded-sm transform skew-x-[-10deg]">
                                <span className="block transform skew-x-[10deg]">PANEL</span>
                            </button>
                            <button className="px-5 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider hover:text-white transition-colors transform skew-x-[-10deg]">
                                <span className="block transform skew-x-[10deg]">Turnieje</span>
                            </button>
                            <button className="px-5 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider hover:text-white transition-colors transform skew-x-[-10deg]">
                                <span className="block transform skew-x-[10deg]">Statystyki</span>
                            </button>
                            {user.role === 'admin' && (
                                <button className="px-5 py-2 text-xs font-bold text-red-400 uppercase tracking-wider hover:text-red-300 transition-colors transform skew-x-[-10deg] ml-4 border border-red-900/50 bg-red-900/10">
                                    <span className="block transform skew-x-[10deg]">Admin Panel</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-2 bg-[#131317] border border-zinc-800/80 px-3 py-1.5 rounded-sm">
                            <Server className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dostępne serwery:</span>
                            <span className="text-xs font-black text-white">{server_stats.available}<span className="text-zinc-600">/{server_stats.total}</span></span>
                        </div>

                        <div className="flex items-center gap-3 cursor-pointer group">
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
                    </div>
                </div>
            </nav>

            <main className="max-w-[1800px] mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-[#0e0e11] border border-zinc-800/60 rounded-lg p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        
                        <div className="flex flex-col items-center mb-8 relative z-10">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0e0e11] z-10 top-1/2"></div>
                                <div className={`w-20 h-20 my-3 transform rotate-45 bg-gradient-to-br ${levelInfo.color} p-1 shadow-2xl`}>
                                    <div className="w-full h-full bg-[#0e0e11] flex items-center justify-center border border-black/50">
                                        <span className={`transform -rotate-45 text-4xl font-black ${levelInfo.text}`}>
                                            {levelInfo.level}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">{user.nickname}</h2>
                            <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Poziom Umiejętności</div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
                                    <span className="text-zinc-400" title="SZELO - SZTUM ELO POINTS">PUNKTY SZELO</span>
                                    <span className={levelInfo.text}>{user.elo} <span className="text-zinc-600">/ {levelInfo.max}</span></span>
                                </div>
                                <div className="w-full bg-zinc-900 rounded-sm h-1.5 border border-zinc-800">
                                    <div 
                                        className={`h-full rounded-sm bg-gradient-to-r ${levelInfo.color}`} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/50">
                                <div className="bg-[#131317] border border-zinc-800/50 rounded p-3 text-center">
                                    <Target className="w-4 h-4 text-zinc-500 mx-auto mb-2" />
                                    <div className="text-xl font-black text-white">{user.matches_played}</div>
                                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Mecze</div>
                                </div>
                                <div className="bg-[#131317] border border-zinc-800/50 rounded p-3 text-center">
                                    <Crown className="w-4 h-4 text-yellow-500 mx-auto mb-2" />
                                    <div className="text-xl font-black text-white">{user.mvps}</div>
                                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">MVP</div>
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
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Ostatnie Mecze</h3>
                            </div>
                            <button className="text-xs font-bold text-zinc-500 hover:text-white flex items-center transition-colors uppercase tracking-widest">
                                Pełna historia <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                        
                        <div className="flex-1 p-6 flex items-center justify-center text-center">
                            <div>
                                <Map className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                                <div className="text-sm font-bold text-zinc-400">Brak historii spotkań</div>
                                <div className="text-xs text-zinc-600 mt-1">Rozegraj swój pierwszy mecz, aby zobaczyć statystyki.</div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
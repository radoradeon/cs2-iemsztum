import { Head, usePage, router } from '@inertiajs/react';
import { 
    Users, Settings, Play, Shield, Copy, Crown, ChevronLeft,
    Check, RefreshCw, MessageSquare, Mic, X, Send, Edit3, CheckCircle2, Clock, Trash2, AlertCircle, Skull, Info, Star, Download
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Player {
    id: number;
    team: string;
    is_ready: boolean;
    user: {
        id: number;
        nickname: string;
        avatar_url: string;
        elo: number;
    };
}

interface LobbyData {
    id: number;
    code: string;
    leader_id: number;
    team_a_captain_id: number | null;
    team_b_captain_id: number | null;
    status: string;
    format: string;
    team_size: number;
    team_assignment: string;
    allow_coaches: boolean;
    team_a_name: string;
    team_b_name: string;
    voice_comm: string | null;
    map_pool: string[];
    demo_links?: string[];
    leader: {
        nickname: string;
        avatar_url: string;
    };
    players: any[];
    server_ip: string;
    server_password: string;
    match_status: string;
    match_live_data?: {
        series_score_a?: number;
        series_score_b?: number;
        map_history?: Array<{
            map: string;
            score_a: number;
            score_b: number;
        }>;
        score_a: number;
        score_b: number;
        round: number;
        phase: string;
        players: Array<{
            steam_id: string;
            name: string;
            team: string;
            kills: number;
            assists: number;
            deaths: number;
            score: number;
        }>;
    };
}

interface ChatMessage {
    user: string;
    text: string;
    time: string;
    isSystem: boolean;
}

interface PageProps {
    auth: {
        user: {
            id: number;
            nickname: string;
            avatar_url: string;
        };
    };
    lobby: LobbyData & { veto_state?: any };
    expiresAt: string;
    chatHistory: ChatMessage[];
    vetoDevMode: boolean;
    [key: string]: any;
}

const getLevelInfo = (elo: number) => {
    if (elo < 800) return { level: 1, color: 'from-zinc-500 to-zinc-700', text: 'text-zinc-400', border: 'border-zinc-500' };
    if (elo < 1200) return { level: 2, color: 'from-emerald-500 to-emerald-700', text: 'text-emerald-400', border: 'border-emerald-500' };
    if (elo < 1600) return { level: 3, color: 'from-blue-500 to-blue-700', text: 'text-blue-400', border: 'border-blue-500' };
    if (elo < 2000) return { level: 4, color: 'from-purple-500 to-purple-700', text: 'text-purple-400', border: 'border-purple-500' };
    return { level: 5, color: 'from-yellow-400 to-orange-600', text: 'text-yellow-400', border: 'border-yellow-500' };
};

const getMapImage = (mapName: string) => {
    const mapLower = mapName.toLowerCase();
    const name = mapLower.replace('de_', '').replace('am_', '');
    const nameToImg = mapLower;
    const standardMaps = ['mirage', 'dust2', 'inferno', 'nuke', 'ancient', 'anubis', 'vertigo', 'overpass'];
    if (standardMaps.includes(name)) return `https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/thumbs/${nameToImg}_1_png.png`;
    return `https://image.gametracker.com/images/maps/160x120/csgo/${mapLower}.jpg`;
};

export default function Lobby() {
    const { auth, lobby, expiresAt, chatHistory, vetoDevMode } = usePage<PageProps>().props;
    const isLeader = auth.user.id === lobby.leader_id;
    const currentPlayer = lobby.players.find(p => p.user.id === auth.user.id);
    
    const [copied, setCopied] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    
    const [chatMsg, setChatMsg] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>(chatHistory || []);
    const [isChatCooldown, setIsChatCooldown] = useState(false);
    const [chatError, setChatError] = useState('');
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        format: lobby.format,
        team_size: lobby.team_size,
        team_assignment: lobby.team_assignment,
        allow_coaches: lobby.allow_coaches,
        server_password: lobby.server_password || ''
    });

    const [isEditingTeamA, setIsEditingTeamA] = useState(false);
    const [teamAName, setTeamAName] = useState(lobby.team_a_name || 'Drużyna A');
    const [isEditingTeamB, setIsEditingTeamB] = useState(false);
    const [teamBName, setTeamBName] = useState(lobby.team_b_name || 'Drużyna B');
    const [isEditingVoice, setIsEditingVoice] = useState(false);
    const [voiceComm, setVoiceComm] = useState(lobby.voice_comm || '');
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState('05:00:00');

    useEffect(() => {
        const targetDate = new Date(expiresAt).getTime();
        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance <= 0) {
                setTimeLeft('00:00:00');
                router.visit('/dashboard');
                return;
            }

            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            //chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        const channel = (window as any).Echo?.private(`lobby.${lobby.id}`);
        if (!channel) return;
        
        channel.listen('LobbyStateUpdated', () => { router.reload({ only: ['lobby'] }); });
        channel.listen('LobbyChatMessage', (e: any) => {
            setMessages(prev => [...prev, { user: e.user, text: e.message, time: e.time, isSystem: false }]);
        });

        return () => {
            channel.stopListening('LobbyStateUpdated');
            channel.stopListening('LobbyChatMessage');
            (window as any).Echo.leave(`lobby.${lobby.id}`);
        };
    }, [lobby.id]);

    const copyCode = () => {
        navigator.clipboard.writeText(lobby.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleDrawTeams = () => {
        setIsDrawing(true);
        router.post(`/lobbies/${lobby.id}/draw`, {}, { onFinish: () => setIsDrawing(false), preserveScroll: true });
    };

    const handleStartVeto = () => {
        router.post(`/lobbies/${lobby.id}/veto/start`, {}, { preserveScroll: true });
    };

    const handleVoteMap = (mapName: string) => {
        const state = lobby.veto_state;
        const currentStep = state.steps[state.current_step_index];
        if (currentStep.team !== currentPlayer?.team) return;
        router.post(`/lobbies/${lobby.id}/veto/vote`, { map: mapName }, { preserveScroll: true });
    };

    const isFinalizing = useRef(false);
    const [vetoTimeLeft, setVetoTimeLeft] = useState(() => {
        if (lobby.status === 'map_veto' && lobby.veto_state) {
            const endsAt = lobby.veto_state.ends_at;
            return Math.max(0, Math.floor((endsAt - new Date().getTime()) / 1000));
        }
        return 20;
    });

    useEffect(() => {
        if (lobby.status !== 'map_veto' || !lobby.veto_state) return;
        
        const tick = () => {
            const endsAt = lobby.veto_state.ends_at;
            const now = new Date().getTime();
            const dist = Math.max(0, Math.floor((endsAt - now) / 1000));
            setVetoTimeLeft(dist);

            if (dist === 0 && isLeader && !isFinalizing.current) {
                isFinalizing.current = true;
                router.post(`/lobbies/${lobby.id}/veto/finalize`, {}, { 
                    preserveScroll: true,
                    onFinish: () => { isFinalizing.current = false; }
                });
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [lobby.status, lobby.veto_state, isLeader, lobby.id]);

    const handleSettingsSave = () => {
        router.put(`/lobbies/${lobby.id}/settings`, settingsForm, { onSuccess: () => setIsSettingsOpen(false), preserveScroll: true });
    };

    const handleToggleReady = () => { router.post(`/lobbies/${lobby.id}/ready`, {}, { preserveScroll: true }); };

    const handleTeamNameUpdate = (team: 'A' | 'B', newName: string) => {
        const data = team === 'A' ? { team_a_name: newName } : { team_b_name: newName };
        router.put(`/lobbies/${lobby.id}/settings`, data, { preserveScroll: true });
        team === 'A' ? setIsEditingTeamA(false) : setIsEditingTeamB(false);
    };

    const handleVoiceUpdate = () => {
        router.put(`/lobbies/${lobby.id}/settings`, { voice_comm: voiceComm }, { onSuccess: () => setIsEditingVoice(false), preserveScroll: true });
    };

    const handleSendMsg = async (e: React.FormEvent) => {
        e.preventDefault();
        setChatError('');
        const trimmedMsg = chatMsg.trim();
        if (!trimmedMsg || isChatCooldown) return;

        const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9\-\.]+\.(com|pl|net|org|eu|gg|io|info|biz|tv)\b)/i;
        if (urlRegex.test(trimmedMsg)) { setChatError('Wysyłanie linków jest zablokowane.'); return; }

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        setMessages(prev => [...prev, { user: auth.user.nickname, text: trimmedMsg, time: timeStr, isSystem: false }]);
        setChatMsg('');
        setIsChatCooldown(true);
        
        try {
            await axios.post(`/lobbies/${lobby.id}/chat`, { message: trimmedMsg });
        } catch (err: any) {
            if (err.response?.data?.error) setChatError(err.response.data.error);
            else if (err.response?.data?.errors?.message) setChatError(err.response.data.errors.message[0]);
        } finally {
            setTimeout(() => setIsChatCooldown(false), 3000);
        }
    };

    const handleDragStart = (e: React.DragEvent, userId: number, isReady: boolean) => {
        if (!isLeader || isReady) { e.preventDefault(); return; }
        setDraggedPlayer(userId);
        e.dataTransfer.setData('text/plain', userId.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

    const handleDrop = (e: React.DragEvent, targetTeam: string) => {
        e.preventDefault();
        const userId = e.dataTransfer.getData('text/plain');
        setDraggedPlayer(null);
        if (userId) { router.post(`/lobbies/${lobby.id}/move`, { user_id: userId, team: targetTeam }, { preserveScroll: true }); }
    };

    const handleDeleteLobby = () => {
        if (confirm('Czy na pewno chcesz zamknąć i usunąć poczekalnię? Spowoduje to wyrzucenie wszystkich przypisanych do niej graczy. Tej akcji nie można cofnąć - wymusi to konieczność utworzenia nowej poczekalni i jej konfiguracji w przypadku kontynuowania rozgrywki w IEM SZTUM.')) {
            router.delete(`/lobbies/${lobby.id}`);
        }
    };

    const unassignedPlayers = lobby.players.filter(p => p.team === 'unassigned');
    const teamAPlayers = lobby.players.filter(p => p.team === 'team_a');
    const teamBPlayers = lobby.players.filter(p => p.team === 'team_b');
    const readyCount = lobby.players.filter(p => p.is_ready && p.team !== 'unassigned').length;
    const allReady = readyCount === (lobby.team_size * 2);
    const anyReady = readyCount > 0;

    const handleSetCaptain = (team: 'team_a' | 'team_b', userId: number) => {
        router.post(`/lobbies/${lobby.id}/captain`, { team, user_id: userId }, { preserveScroll: true });
    };

    const PlayerCard = ({ player, side = 'neutral' }: { player: Player, side?: 'neutral' | 'blue' | 'red' }) => {
        const lvl = getLevelInfo(player.user.elo);
        const bgColors = { neutral: 'bg-[#131317]', blue: 'bg-blue-950/20', red: 'bg-red-950/20' };
        const borderColors = { neutral: 'border-zinc-800/80', blue: 'border-blue-900/50', red: 'border-red-900/50' };
        const canDrag = isLeader && !player.is_ready;
        const isCaptain = (side === 'blue' && lobby.team_a_captain_id === player.user.id) || 
                          (side === 'red' && lobby.team_b_captain_id === player.user.id);

        return (
            <div 
                draggable={canDrag}
                onDragStart={(e) => handleDragStart(e, player.user.id, player.is_ready)}
                onDragEnd={() => setDraggedPlayer(null)}
                className={`${bgColors[side]} ${borderColors[side]} border p-3 rounded-sm flex items-center justify-between group transition-all duration-300 ${canDrag ? 'cursor-grab active:cursor-grabbing hover:border-yellow-500/50' : ''} ${draggedPlayer === player.user.id ? 'opacity-50' : 'opacity-100'}`}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={player.user.avatar_url} className={`w-9 h-9 rounded-sm object-cover border-b-2 ${lvl.border} ${canDrag ? 'pointer-events-none' : ''}`} alt="" />
                        {player.user.id === lobby.leader_id && (
                            <div className="absolute -top-2 -left-2 bg-[#0e0e11] p-1 rounded-full">
                                <Crown className="w-3 h-3 text-yellow-500" />
                            </div>
                        )}
                        <div className={`absolute -right-2 -bottom-2 w-5 h-5 transform rotate-45 bg-gradient-to-br ${lvl.color} border border-black flex items-center justify-center`}>
                            <span className="transform -rotate-45 text-[9px] font-black text-black">{lvl.level}</span>
                        </div>
                    </div>
                    <div className="ml-2">
                        <div className="text-sm font-bold text-white tracking-wide">{player.user.nickname}</div>
                        <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            {player.user.elo} <span title="SZELO - SZTUM ELO POINTS">szelo</span>
                        </div>
                        <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            {player.team !== 'unassigned' && (
                                <span className={player.is_ready ? 'text-emerald-500' : 'text-zinc-500'}>
                                    {player.is_ready ? 'GOTOWY' : 'NIEGOTOWY'}
                                </span>
                            )}
                            {player.team === 'unassigned' && 'POCZEKALNIA'}
                        </div>
                    </div>
                </div>
                {isLeader && side !== 'neutral' && !isCaptain && (
                    <button 
                        onClick={() => handleSetCaptain(side === 'blue' ? 'team_a' : 'team_b', player.user.id)}
                        className="opacity-0 group-hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/80 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all border border-zinc-700"
                        title="Zrób Kapitanem"
                    >
                        <Star className="w-3 h-3" />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black pb-28">
            <Head title={`Lobby ${lobby.code} - IEM SZTUM`} />

            {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#0e0e11] border border-zinc-800 rounded-lg w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Settings className="w-5 h-5 text-yellow-500" /> Konfiguracja
                            </h2>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Format Map</label>
                                <select className="w-full bg-[#131317] border border-zinc-800 text-white rounded p-3 text-sm font-bold uppercase outline-none focus:border-yellow-500" value={settingsForm.format} onChange={e => setSettingsForm({...settingsForm, format: e.target.value})}>
                                    <option value="bo1">Best of 1</option>
                                    <option value="bo3">Best of 3</option>
                                    <option value="bo5">Best of 5</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Rozmiar Drużyn (Zmienia pulę map!)</label>
                                <select className="w-full bg-[#131317] border border-zinc-800 text-white rounded p-3 text-sm font-bold uppercase outline-none focus:border-yellow-500" value={settingsForm.team_size} onChange={e => setSettingsForm({...settingsForm, team_size: Number(e.target.value)})}>
                                    <option value={1}>1 v 1</option>
                                    <option value={2}>2 v 2</option>
                                    <option value={3}>3 v 3</option>
                                    <option value={4}>4 v 4</option>
                                    <option value={5}>5 v 5</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Tryb Przydziału Graczy</label>
                                <select className="w-full bg-[#131317] border border-zinc-800 text-white rounded p-3 text-sm font-bold uppercase outline-none focus:border-yellow-500" value={settingsForm.team_assignment} onChange={e => setSettingsForm({...settingsForm, team_assignment: e.target.value})}>
                                    <option value="random">Losowy przydział</option>
                                    <option value="manual">Wybierany ręcznie przez lidera</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Trenerzy</label>
                                <select 
                                    className="w-full bg-[#131317] border border-zinc-800 text-white rounded p-3 text-sm font-bold uppercase outline-none focus:border-yellow-500" 
                                    value={settingsForm.allow_coaches ? 'true' : 'false'} 
                                    onChange={e => setSettingsForm({...settingsForm, allow_coaches: e.target.value === 'true'})}
                                >
                                    <option value="false">BRAK ZEZWOLENIA</option>
                                    <option value="true">Dozwoleni (+2 sloty dla trenerów)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Hasło Serwera CS2 (Max 8 znaków, bez specjalnych)</label>
                                <input 
                                    type="text" 
                                    maxLength={8}
                                    placeholder="np. secret12"
                                    value={settingsForm.server_password || ''}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                                        setSettingsForm({...settingsForm, server_password: val});
                                    }}
                                    className="w-full bg-[#131317] border border-zinc-800 text-white rounded p-3 text-sm font-bold uppercase outline-none focus:border-yellow-500" 
                                />
                            </div>
                            <button onClick={handleSettingsSave} className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded font-black text-sm uppercase tracking-wider transition-all transform skew-x-[-5deg]">
                                <span className="block transform skew-x-[5deg]">Zapisz Ustawienia</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="sticky top-0 z-50 bg-[#0a0a0c]/90 border-b border-zinc-800/60 backdrop-blur-xl">
                <div className="max-w-[1800px] mx-auto px-6 h-34 flex items-center justify-between">
                    <a href="/dashboard" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group">
                        <div className="p-2 bg-zinc-900 rounded group-hover:bg-zinc-800 transition-colors"><ChevronLeft className="w-4 h-4" /></div>
                        <span className="text-xs font-bold uppercase tracking-widest">Wyjście</span>
                    </a>
                    
                    <div className="flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] my-1">KOD poczekalni</div>
                        <div onClick={copyCode} className="flex gap-2 cursor-pointer group relative" title="Kliknij w kod aby skopiować go do schowka">
                            {lobby.code.split('').map((char, i) => (
                                <div key={i} className={`w-10 h-12 flex items-center justify-center text-xl font-black rounded-sm border transition-all duration-300 ${copied ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-[#131317] border-zinc-700 text-white group-hover:border-yellow-500/50 group-hover:text-yellow-400'}`}>{char}</div>
                            ))}
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20" title="Czas ważności poczekalni - po tym czasie zostanie ona automatycznie zamknięta i usunięta.">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span className="text-[10px] font-black tracking-widest">{timeLeft}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right flex flex-col items-center">
                            <img src={lobby.leader.avatar_url} className={`w-6 h-6 rounded-sm object-cover border-b-2 mb-2`} alt="" />
                            <span className="text-xs font-black text-white uppercase tracking-wider">{lobby.leader.nickname}</span>
                            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5"><Crown className="w-3 h-3" /> Lider Poczekalni</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1800px] mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-[#0e0e11] border border-zinc-800/60 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><Settings className="w-4 h-4 text-zinc-500" /> Ustawienia</h3>
                            {isLeader && lobby.status === 'waiting' && (
                                <button onClick={() => setIsSettingsOpen(true)} className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest hover:text-yellow-400">Zmień</button>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="bg-[#131317] border border-zinc-800/50 p-3 rounded-sm flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Format</span>
                                <span className="text-sm font-black text-white uppercase">{lobby.format}</span>
                            </div>
                            <div className="bg-[#131317] border border-zinc-800/50 p-3 rounded-sm flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Gracze</span>
                                <span className="text-sm font-black text-white uppercase">{lobby.team_size} v {lobby.team_size}</span>
                            </div>
                            <div className="bg-[#131317] border border-zinc-800/50 p-3 rounded-sm flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tryb</span>
                                <span className="text-sm font-black text-white uppercase">{lobby.team_assignment === 'random' ? 'Losowy' : 'Ręczny'}</span>
                            </div>
                            <div className="bg-[#131317] border border-zinc-800/50 p-3 rounded-sm flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Trenerzy</span>
                                <span className="text-sm font-black text-white uppercase">{lobby.allow_coaches === true ? 'Dozwoleni' : 'Niedozwoleni'}</span>
                            </div>
                            <div className="bg-[#131317] border border-zinc-800/50 p-3 rounded-sm flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Przypisany serwer</span>
                                <span className="text-sm font-black text-white uppercase">{lobby.server_ip}</span>
                            </div>
                            <div className="bg-[#131317] border border-zinc-800/50 p-3 rounded-sm flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Hasło</span>
                                <span className="text-sm font-black text-white uppercase">{lobby.server_password}</span>
                            </div>
                        </div>
                        {isLeader && (
                            <button onClick={handleDeleteLobby} className="w-full mt-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                <Trash2 className="w-4 h-4" /> Usuń poczekalnię
                            </button>
                        )}
                    </div>

                    <div className="bg-[#0e0e11] border border-zinc-800/60 rounded-lg p-6">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Mic className="w-4 h-4 text-zinc-500" /> Komunikacja Głosowa</h3>
                        <div className="bg-[#131317] border border-zinc-800/50 rounded-sm p-4">
                            {!isEditingVoice ? (
                                <div className="flex items-center justify-between">
                                    <div className="truncate text-xs font-bold text-zinc-400 mr-2">{voiceComm || 'Brak ustawionego serwera'}</div>
                                    {isLeader && lobby.status === 'waiting' && <button onClick={() => setIsEditingVoice(true)}><Edit3 className="w-4 h-4 text-zinc-500 hover:text-white" /></button>}
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input type="text" value={voiceComm} onChange={(e) => setVoiceComm(e.target.value)} placeholder="Link Discord / TS3 IP" className="flex-1 bg-[#0a0a0c] border border-zinc-700 text-white rounded p-2 text-xs outline-none" />
                                    <button onClick={handleVoiceUpdate} className="bg-yellow-500 text-black px-3 rounded font-bold text-xs"><Check className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#0e0e11] border border-zinc-800/60 rounded-lg flex flex-col overflow-hidden h-[500px]">
                        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-zinc-500" />
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Czat Poczekalni</h3>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-[#0a0a0c]">
                            {messages.map((m, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className={`text-[10px] font-black uppercase ${m.isSystem ? 'text-yellow-500' : 'text-zinc-400'}`}>{m.user}</span>
                                        <span className="text-[9px] text-zinc-600">{m.time}</span>
                                    </div>
                                    <div className={`text-xs p-2.5 rounded-md inline-block max-w-[90%] break-words ${m.isSystem ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-[#131317] text-zinc-300 border border-zinc-800'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-3 bg-[#0e0e11] border-t border-zinc-800/80 relative">
                            {chatError && (
                                <div className="absolute -top-10 left-0 w-full px-3 z-10">
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded flex items-center gap-2 shadow-lg backdrop-blur-md">
                                        <AlertCircle className="w-3 h-3" /> {chatError}
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handleSendMsg} className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <input type="text" maxLength={250} value={chatMsg} onChange={(e) => {setChatMsg(e.target.value); setChatError('');}} placeholder={isChatCooldown ? "Czekaj 3s..." : "Napisz wiadomość..."} disabled={isChatCooldown} className="flex-1 bg-[#131317] border border-zinc-800 focus:border-zinc-600 disabled:opacity-50 text-white rounded p-2.5 text-xs outline-none transition-all" />
                                    <button type="submit" disabled={isChatCooldown || !chatMsg.trim()} className="bg-zinc-800 disabled:opacity-50 text-white p-2.5 rounded hover:bg-zinc-700 transition-colors"><Send className="w-4 h-4" /></button>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-1">
                                    <span className={isChatCooldown ? 'text-zinc-600' : ''}>{isChatCooldown ? 'Wysyłanie...' : ''}</span>
                                    <span>{chatMsg.length} / 250</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {lobby.status === 'waiting' ? (
                    <div className="lg:col-span-9 flex flex-col gap-6">
                        <div className="bg-[#0e0e11] border border-zinc-800/60 rounded-lg p-6 flex flex-col min-h-[600px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-zinc-800 italic uppercase">VS</div>
                                
                                <div 
                                    className={`flex flex-col rounded-md transition-colors duration-300 ${isLeader ? 'p-2 -m-2' : ''} ${draggedPlayer ? 'border-2 border-dashed border-blue-500/30 bg-blue-900/5' : 'border-2 border-transparent'}`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, 'team_a')}
                                >
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/80">
                                        {!isEditingTeamA ? (
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => isLeader && setIsEditingTeamA(true)} title={`Kliknij aby zacząć edytować nazwę drużyny - ${lobby.team_a_name}`}>
                                                <Shield className="w-5 h-5 text-blue-500" />
                                                <h3 className="text-lg font-black text-white uppercase tracking-wider">{lobby.team_a_name}</h3>
                                                {isLeader && <Edit3 className="w-3 h-3 text-zinc-600 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 w-full">
                                                <input type="text" value={teamAName} onChange={(e) => setTeamAName(e.target.value)} className="w-full bg-[#131317] border border-blue-900 text-white font-black uppercase text-lg px-2 py-1 rounded outline-none" autoFocus onBlur={() => handleTeamNameUpdate('A', teamAName)} onKeyDown={(e) => e.key === 'Enter' && handleTeamNameUpdate('A', teamAName)} />
                                            </div>
                                        )}
                                        <span className="text-xs font-bold text-blue-500">{teamAPlayers.length}/{lobby.team_size}</span>
                                    </div>
                                    <div className="space-y-2 flex-1 pointer-events-none">
                                        <div className="pointer-events-auto space-y-2">
                                            {teamAPlayers.map(player => <PlayerCard key={player.id} player={player} side="blue" />)}
                                        </div>
                                        {isLeader && draggedPlayer && teamAPlayers.length < lobby.team_size && (
                                            <div className="h-16 border-2 border-dashed border-blue-500/50 rounded-sm flex items-center justify-center text-blue-500/50 text-[10px] font-black uppercase tracking-widest mt-2">
                                                Upuść gracza tutaj
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div 
                                    className={`flex flex-col rounded-md transition-colors duration-300 ${isLeader ? 'p-2 -m-2' : ''} ${draggedPlayer ? 'border-2 border-dashed border-red-500/30 bg-red-900/5' : 'border-2 border-transparent'}`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, 'team_b')}
                                >
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/80">
                                        {!isEditingTeamB ? (
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => isLeader && setIsEditingTeamB(true)} title={`Kliknij aby zacząć edytować nazwę drużyny - ${lobby.team_b_name}`}>
                                                <Shield className="w-5 h-5 text-red-500 ml-auto" />
                                                <h3 className="text-lg font-black text-white uppercase tracking-wider">{lobby.team_b_name}</h3>
                                                {isLeader && <Edit3 className="w-3 h-3 text-zinc-600 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 w-full">
                                                <input type="text" value={teamBName} onChange={(e) => setTeamBName(e.target.value)} className="w-full bg-[#131317] border border-red-900 text-white font-black uppercase text-lg px-2 py-1 rounded text-right outline-none" autoFocus onBlur={() => handleTeamNameUpdate('B', teamBName)} onKeyDown={(e) => e.key === 'Enter' && handleTeamNameUpdate('B', teamBName)} />
                                            </div>
                                        )}
                                        <span className="text-xs font-bold text-red-500">{teamBPlayers.length}/{lobby.team_size}</span>
                                    </div>
                                    <div className="space-y-2 flex-1 pointer-events-none">
                                        <div className="pointer-events-auto space-y-2">
                                            {teamBPlayers.map(player => <PlayerCard key={player.id} player={player} side="red" />)}
                                        </div>
                                        {isLeader && draggedPlayer && teamBPlayers.length < lobby.team_size && (
                                            <div className="h-16 border-2 border-dashed border-red-500/50 rounded-sm flex items-center justify-center text-red-500/50 text-[10px] font-black uppercase tracking-widest mt-2">
                                                Upuść gracza tutaj
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div 
                                className={`mt-8 pt-6 border-t border-zinc-800/60 transition-colors duration-300 ${draggedPlayer ? 'bg-yellow-500/5 rounded-b-lg' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'unassigned')}
                            >
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 text-center">Poczekalnia ({unassignedPlayers.length})</div>
                                <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto p-2 bg-[#131317] border border-zinc-800/50 rounded min-h-[4rem]">
                                    {unassignedPlayers.map(player => <PlayerCard key={player.id} player={player} side="neutral" />)}
                                    {isLeader && draggedPlayer && (
                                        <div className="w-full h-12 border-2 border-dashed border-zinc-700 rounded-sm flex items-center justify-center text-zinc-600 text-[10px] font-black uppercase tracking-widest pointer-events-none">
                                            Wrzuć do poczekalni
                                        </div>
                                    )}
                                </div>
                                
                                {isLeader && lobby.team_assignment === 'random' && !anyReady && (
                                    <button onClick={handleDrawTeams} disabled={isDrawing} className="mt-4 mx-auto block bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                                        <RefreshCw className={`w-4 h-4 ${isDrawing ? 'animate-spin text-yellow-500' : ''}`} /> {isDrawing ? 'LOSOWANIE...' : 'LOSUJ SKŁADY'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-9 flex flex-col gap-6">
                        {lobby.status === 'map_veto' && lobby.veto_state && (
                            <>
                                {(() => {
                                    const state = lobby.veto_state;
                                    const currentStep = state.steps[state.current_step_index];
                                    const isMyTurn = currentStep.team === currentPlayer?.team;
                                    const activeTeamName = currentStep.team === 'team_a' ? lobby.team_a_name : lobby.team_b_name;
                                    const teamColor = currentStep.team === 'team_a' ? 'text-blue-500' : 'text-red-500';
                                    const bgPulse = currentStep.team === 'team_a' ? 'bg-blue-500/5' : 'bg-red-500/5';

                                    const myVotes = state.votes[auth.user.id] || [];
                                    const isMaxVotesReached = myVotes.length >= currentStep.count;

                                    return (
                                        <div className="bg-[#0e0e11] border border-zinc-800/60 rounded-lg p-8 relative overflow-hidden min-h-[600px] flex flex-col">
                                            <div className={`absolute inset-0 ${bgPulse} transition-colors duration-1000 pointer-events-none`}></div>
                                            <div className="bg-[#131317] border border-zinc-800 p-3 rounded-sm text-xs text-zinc-400 mb-6 flex items-center justify-between shadow-md">
                                                <span className="flex items-center"><Info className="mr-2"></Info> <b>Zasady Veto ({lobby.format.toUpperCase()}):</b> {lobby.format === 'bo1' ? 'Drużyny odrzucają mapy naprzemiennie, aż zostanie 1 decydująca mapa.' : lobby.format === 'bo3' ? 'Drużyny odrzucają mapy, aż w puli zostaną dokładnie 3 mapy do rozegrania serii.' : 'Drużyny odrzucają mapy, aż zostanie 5 map do wyboru.'}</span>
                                            </div>
                                            {state.history && state.history.length > 0 && (
                                                <div className="relative z-10 flex flex-wrap gap-2 mb-6">
                                                    {state.history.map((h: any, i: number) => (
                                                        <div key={i} className="px-3 py-1.5 bg-[#131317] border border-zinc-800 rounded-sm text-[10px] font-bold uppercase tracking-widest text-zinc-400 shadow-sm flex items-center gap-2">
                                                            <span className="text-zinc-600">FAZA {h.phase}.</span>
                                                            <span className={h.team === 'team_a' ? 'text-blue-500' : (h.team === 'team_b' ? 'text-red-500' : 'text-yellow-500')}>
                                                                {h.team === 'team_a' ? lobby.team_a_name : (h.team === 'team_b' ? lobby.team_b_name : 'SYSTEM')}
                                                            </span>
                                                            <span className="text-zinc-500">{h.action === 'ban' ? 'odrzuca' : 'wybiera'}</span>
                                                            <span className="text-white">{h.maps.map((m:string) => m.replace('de_','').replace('am_','')).join(', ')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="relative z-10 flex items-center justify-between mb-8 pb-6 border-b border-zinc-800">
                                                <div>
                                                    <div className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 animate-pulse">FAZA {state.current_step_index + 1}</div>
                                                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
                                                        <span className={teamColor}>{activeTeamName}</span> {currentStep.action === 'ban' ? 'ODRZUCA' : 'WYBIERA'} <span className="bg-[#131317] px-3 py-1 border border-zinc-700 text-yellow-500">{currentStep.count}</span> MAPY
                                                    </h2>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">POZOSTAŁY CZAS</div>
                                                    <div className={`text-5xl font-black ${vetoTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{vetoTimeLeft}s</div>
                                                </div>
                                            </div>

                                            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 flex-1">
                                                {!isMyTurn && (
                                                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center border border-zinc-800">
                                                        <div className="text-center">
                                                            <RefreshCw className="w-12 h-12 text-zinc-500 animate-spin mx-auto mb-4" />
                                                            <div className="text-xl font-black text-white uppercase tracking-widest">{activeTeamName} w trakcie głosowania...</div>
                                                            <div className="text-xs text-zinc-500 mt-2 font-bold uppercase tracking-widest">Oczekuj na swoją kolej</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {lobby.map_pool.map((mapName: string) => {
                                                    const isBanned = state.banned_maps?.includes(mapName);
                                                    const isPicked = state.picked_maps?.includes(mapName);
                                                    
                                                    const votesForMap = Object.entries(state.votes || {}).filter(([userId, userVotes]) => (userVotes as string[]).includes(mapName));
                                                    
                                                    const isMyVote = myVotes.includes(mapName);

                                                    return (
                                                        <div 
                                                            key={mapName}
                                                            onClick={() => !isBanned && !isPicked && isMyTurn ? handleVoteMap(mapName) : null}
                                                            style={{ backgroundImage: `url(${getMapImage(mapName)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                                            className={`relative overflow-hidden rounded-md border flex flex-col justify-end p-4 transition-all duration-300 min-h-[250px]
                                                                ${isBanned ? 'border-red-900/50 bg-red-950/10 grayscale' : 
                                                                  isPicked ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] scale-105 z-20' : 
                                                                  isMyTurn ? (isMyVote ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] -translate-y-2' : 'border-zinc-700 hover:border-yellow-500 cursor-pointer') : 
                                                                  'border-zinc-800 opacity-60'}`}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-[#0e0e11]/60 to-transparent z-10"></div>
                                                            
                                                            <div className="relative z-20 flex flex-col h-full justify-between">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {votesForMap.map(([userId]) => {
                                                                        const voter = lobby.players.find(p => p.user.id.toString() === userId);
                                                                        return voter && (
                                                                            <img key={userId} src={voter.user.avatar_url} className="w-8 h-8 rounded-sm border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" alt="vote" />
                                                                        );
                                                                    })}
                                                                </div>

                                                                <div className="relative">
                                                                    {isBanned && <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-30">
                                                                                    <span className="text-red-500 font-black text-lg tracking-wider uppercase bg-black/80 px-3 py-1 rounded border border-red-500/30"><Skull className="w-10 h-10 text-red-500 mb-1" />ODRZUCONA</span>
                                                                                </div>
                                                                    }
                                                                    {isPicked && <div className="text-yellow-500 font-black text-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-black/50 px-3 py-1 rounded">WYBRANA</div>}
                                                                    
                                                                    <div className={`text-xl font-black uppercase tracking-widest ${isBanned ? 'text-zinc-600' : 'text-white'}`}>{mapName.replace('de_', '').replace('am_', '')}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </>
                        )}
                        
                        {lobby.status === 'starting' && (
                            <div className="bg-[#0e0e11] border border-zinc-800/60 rounded-lg p-8 relative overflow-hidden min-h-[600px] flex flex-col items-center justify-center text-center">
                                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${getMapImage(lobby.veto_state.picked_maps[0])})` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-[#0e0e11]/80 to-[#0e0e11]/40"></div>

                                <div className="relative z-10 flex flex-col items-center max-w-xl w-full">
                                    <div className="w-24 h-24 bg-yellow-500/10 border border-yellow-500/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                                        <CheckCircle2 className="w-12 h-12 text-yellow-500" />
                                    </div>
                                        {/* BANER STATUSU MECZU */}
                                        <div className="w-full bg-[#131317] border border-zinc-800 rounded-lg p-4 mb-4 flex items-center justify-between shadow-lg">
                                            <div className="w-full bg-[#131317] border border-zinc-800 rounded-lg p-4 mb-4 flex items-center justify-between shadow-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-3 h-3 rounded-full animate-pulse ${
                                                        lobby.match_status === 'live' ? 'bg-emerald-500' : 'bg-zinc-500'
                                                    }`} />
                                                    <span className="text-xs font-black uppercase tracking-wider text-white">
                                                        Status: {
                                                            lobby.match_status === 'configuring' ? 'Konfiguracja' :
                                                            lobby.match_status === 'finished' ? 'Mecz Zakończony' :
                                                            (lobby.match_live_data?.phase || 'Oczekiwanie na dołączenie')
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            {lobby.match_live_data?.phase && (
                                                <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded text-zinc-400 border border-zinc-800">
                                                    Faza: {lobby.match_live_data.phase}
                                                </span>
                                            )}
                                        </div>
                                    
                                    <div className="mb-6 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
                                        {lobby.match_status === 'configuring' ? 'Trwa konfiguracja serwera CS2...' : 'Serwer gotowy do gry'}
                                    </div>

                                    <div className="w-full bg-[#131317] border border-zinc-800 rounded-lg p-6 mb-8 text-left space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-widest">Format rozgrywki:</span>
                                            <span className="font-black text-white tracking-wider uppercase">{lobby.format}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-widest">Gracze:</span>
                                            <span className="font-black text-white tracking-wider">{lobby.team_size} vs {lobby.team_size} ({lobby.team_size + lobby.team_size} graczy)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-widest">Trenerzy:</span>
                                            <span className="font-black text-white tracking-wider">{lobby.allow_coaches === true ? 'Dozwoleni' : 'Niedozwoleni'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-widest">Wybrane mapy:</span>
                                            <span className="font-black text-yellow-500 tracking-wider uppercase">{lobby.veto_state.picked_maps.map((m: string) => m.replace('de_', '').replace('am_', '')).join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-widest">Zbanowane mapy:</span>
                                            <span className="font-black text-red-400 tracking-wider uppercase">{lobby.veto_state.banned_maps.map((m: string) => m.replace('de_', '').replace('am_', '')).join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-800">
                                            <span className="text-zinc-500 font-bold uppercase tracking-widest">Adres IP Serwera:</span>
                                            <span className="font-black text-white tracking-wider">{lobby.server_ip || '127.0.0.1:27015'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-widest">Hasło Meczu:</span>
                                            <span className="font-black text-yellow-500 tracking-wider">{lobby.server_password ? lobby.server_password : 'Brak (Publiczny)'}</span>
                                        </div>
                                    </div>

                                    {isLeader && (
                                        <div className="w-full bg-[#131317]/95 border border-yellow-500/40 rounded-lg p-5 mb-8 text-left shadow-2xl">
                                            <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <Settings className="w-4 h-4" /> Panel Sterowania Meczem (Lider / Admin)
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                {lobby.match_status === 'live' ? (
                                                    <button onClick={() => router.post(`/lobbies/${lobby.id}/match/pause`)} className="bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 px-4 rounded font-black text-[10px] uppercase tracking-wider transition-all">
                                                        Pauza Techniczna
                                                    </button>
                                                ) : (
                                                    <button onClick={() => router.post(`/lobbies/${lobby.id}/match/pause`)} className="bg-blue-500 hover:bg-blue-400 text-black py-2.5 px-4 rounded font-black text-[10px] uppercase tracking-wider transition-all">
                                                        Wznów Mecz
                                                    </button>
                                                )}

                                                <button onClick={() => router.post(`/lobbies/${lobby.id}/match/action`, { action: 'restart_match' })} className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 py-2.5 px-4 rounded font-black text-[10px] uppercase tracking-wider transition-all">
                                                    Restart Meczu
                                                </button>

                                                <button onClick={() => router.post(`/lobbies/${lobby.id}/match/action`, { action: 'restart_round' })} className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 py-2.5 px-4 rounded font-black text-[10px] uppercase tracking-wider transition-all" title="Restartuje bieżącą rundę do zera">
                                                    Restart Rundy (Cofnij)
                                                </button>

                                                <button onClick={() => router.post(`/lobbies/${lobby.id}/match/action`, { action: 'end_warmup' })} className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 py-2.5 px-4 rounded font-black text-[10px] uppercase tracking-wider transition-all">
                                                    Zakończ rozgrzewkę
                                                </button>

                                                <button onClick={() => router.post(`/lobbies/${lobby.id}/match/stop`)} className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 py-2.5 px-4 rounded font-black text-[10px] uppercase tracking-wider transition-all">
                                                    Zakończ Mecz
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                                                <form onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const form = e.currentTarget;
                                                    const input = form.elements.namedItem('rcon_msg') as HTMLInputElement;
                                                    if (!input.value) return;
                                                    router.post(`/lobbies/${lobby.id}/match/action`, { action: 'say', message: input.value }, { onSuccess: () => input.value = '' });
                                                }} className="flex gap-2">
                                                    <input type="text" name="rcon_msg" placeholder="Napisz na czacie serwera (say)..." className="flex-1 bg-[#0a0a0c] border border-zinc-700 text-white rounded px-3 py-2 text-xs outline-none" maxLength={100} />
                                                    <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded text-xs font-bold uppercase">Wyślij</button>
                                                </form>

                                                {lobby.veto_state.picked_maps.length > 1 && (
                                                    <div className="flex gap-2">
                                                        <select id="map_changer" className="flex-1 bg-[#0a0a0c] border border-zinc-700 text-white rounded px-3 py-2 text-xs uppercase font-bold outline-none">
                                                            {lobby.veto_state.picked_maps.map((m: string) => (
                                                                <option key={m} value={m}>{m.replace('de_', '').replace('am_', '')}</option>
                                                            ))}
                                                        </select>
                                                        <button onClick={() => {
                                                            const select = document.getElementById('map_changer') as HTMLSelectElement;
                                                            router.post(`/lobbies/${lobby.id}/match/action`, { action: 'change_map', map: select.value });
                                                        }} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 rounded text-xs font-black uppercase">
                                                            Zmień Mapę
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* LIVE TABELA GRACZY / DRUŻYN */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
                                        <div className="bg-[#131317] border border-blue-900/40 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-blue-500" />
                                                    <span className="text-xs font-black text-white uppercase tracking-wider">{lobby.team_a_name}</span>
                                                </div>
                                                <span className="text-[10px] text-blue-500 font-bold uppercase">CT / T</span>
                                            </div>
                                            <div className="space-y-2">
                                                {teamAPlayers.map(p => (
                                                    <div key={p.id} className="flex items-center justify-between bg-[#0a0a0c] p-2 rounded border border-zinc-800/60 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <img src={p.user.avatar_url} className="w-6 h-6 rounded object-cover" alt="" />
                                                            <span className="font-bold text-white">{p.user.nickname}</span>
                                                        </div>
                                                        <span className="text-[10px] text-zinc-500 font-mono">SZELO: {p.user.elo}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-[#131317] border border-red-900/40 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-red-500" />
                                                    <span className="text-xs font-black text-white uppercase tracking-wider">{lobby.team_b_name}</span>
                                                </div>
                                                <span className="text-[10px] text-red-500 font-bold uppercase">T / CT</span>
                                            </div>
                                            <div className="space-y-2">
                                                {teamBPlayers.map(p => (
                                                    <div key={p.id} className="flex items-center justify-between bg-[#0a0a0c] p-2 rounded border border-zinc-800/60 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <img src={p.user.avatar_url} className="w-6 h-6 rounded object-cover" alt="" />
                                                            <span className="font-bold text-white">{p.user.nickname}</span>
                                                        </div>
                                                        <span className="text-[10px] text-zinc-500 font-mono">SZELO: {p.user.elo}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {lobby.match_live_data && (
                                        <div className="w-full bg-[#131317] border border-zinc-800 rounded-lg p-5 mb-6 shadow-2xl space-y-4 text-left">
                                            <div className="flex items-center justify-between bg-[#0a0a0c] p-4 rounded border border-zinc-800">
                                                <div className="text-sm font-black text-blue-500 uppercase">{lobby.team_a_name}</div>
                                                <div className="text-center">
                                                    <div className="text-3xl font-black text-white px-6 py-1 bg-black rounded border border-zinc-800 tracking-wider">
                                                        {lobby.match_live_data.series_score_a ?? 0} : {lobby.match_live_data.series_score_b ?? 0}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Wynik Serii (BO{lobby.veto_state?.picked_maps?.length || 1})</div>
                                                </div>
                                                <div className="text-sm font-black text-red-500 uppercase">{lobby.team_b_name}</div>
                                            </div>

                                            <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded border border-zinc-800/80 text-xs">
                                                <span className="font-bold text-zinc-300">Mapa: <span className="text-white uppercase">{lobby.veto_state?.picked_maps?.[(lobby.match_live_data.map_history?.length || 0)] || 'Nieznana'}</span></span>
                                                <span className="font-mono text-yellow-500 font-bold">Runda: {lobby.match_live_data.round ?? 1} | Wynik mapy: {lobby.match_live_data.score_a ?? 0} : {lobby.match_live_data.score_b ?? 0}</span>
                                            </div>

                                            {lobby.match_live_data.map_history && lobby.match_live_data.map_history.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider self-center mr-2">Rozegrane mapy:</span>
                                                    {lobby.match_live_data.map_history.map((m: any, index: number) => (
                                                        <div key={index} className="bg-black border border-zinc-800 px-3 py-1 rounded text-xs flex items-center gap-2">
                                                            <span className="text-zinc-400 font-bold uppercase">{m.map.replace('de_', '')}:</span>
                                                            <span className="text-white font-black">{m.score_a} : {m.score_b}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {lobby.match_live_data.players && lobby.match_live_data.players.length > 0 && (
                                                <div className="overflow-x-auto pt-2">
                                                    <table className="w-full text-left text-xs">
                                                        <thead>
                                                            <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                                                                <th className="p-2">Gracz</th>
                                                                <th className="p-2 text-center">T/CT</th>
                                                                <th className="p-2 text-center">K</th>
                                                                <th className="p-2 text-center">A</th>
                                                                <th className="p-2 text-center">D</th>
                                                                <th className="p-2 text-center">Punkty</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-zinc-800/50">
                                                            {lobby.match_live_data.players.map((p: any) => (
                                                                <tr key={p.steam_id} className="hover:bg-zinc-800/20">
                                                                    <td className="p-2 font-bold text-white flex items-center gap-2">
                                                                        {p.name}
                                                                    </td>
                                                                    <td className={`p-2 text-center font-black uppercase ${p.team === 'CT' ? 'text-blue-400' : 'text-yellow-500'}`}>{p.team}</td>
                                                                    <td className="p-2 text-center font-black text-emerald-400">{p.kills}</td>
                                                                    <td className="p-2 text-center font-bold text-zinc-400">{p.assists}</td>
                                                                    <td className="p-2 text-center font-black text-red-400">{p.deaths}</td>
                                                                    <td className="p-2 text-center font-bold text-zinc-300">{p.score}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {lobby.match_status === 'configuring' ? (
                                        <div className="w-full py-4 bg-[#131317] border border-yellow-500/30 text-yellow-500 font-black text-xs uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-3 shadow-lg">
                                            <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" />
                                            Trwa konfiguracja serwera gry...
                                        </div>
                                    ) : lobby.match_status === 'finished' ? (
                                        <div className="w-full py-6 px-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-sm flex flex-col items-center justify-center gap-4 shadow-lg">
                                            <div className="text-xl font-black uppercase tracking-wider">Mecz został zakończony!</div>
                                            <div className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Punkty SZELO zostały przeliczone.</div>
                                            
                                            {lobby.demo_links && lobby.demo_links.length > 0 ? (
                                                <div className="mt-4 w-full flex flex-col gap-2">
                                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest text-left font-bold mb-1">Dema do pobrania:</div>
                                                    {lobby.demo_links.map((link: string, idx: number) => (
                                                        <a key={idx} href={link} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-black/40 border border-emerald-900/50 hover:bg-emerald-900/30 p-3 rounded transition-colors">
                                                            <span className="text-white text-xs font-bold uppercase">Mapa {idx + 1} ({lobby.match_live_data?.map_history?.[idx]?.map?.replace('de_', '') || 'Nieznana'})</span>
                                                            <Download className="w-4 h-4 text-emerald-500" />
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="mt-4 text-xs text-yellow-500 font-bold uppercase tracking-widest">Trwa kompresja dem na serwerze, odśwież za chwilę...</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                            <a 
                                                href={`steam://connect/${lobby.server_ip}${lobby.server_password ? `/${lobby.server_password}` : ''}`}
                                                className="bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center justify-center gap-2 transform skew-x-[-5deg]"
                                            >
                                                <span className="block transform skew-x-[5deg]">POŁĄCZ Z SERWEREM CS2</span>
                                            </a>

                                            <button 
                                                onClick={() => {
                                                    const cmd = `connect ${lobby.server_ip}; password ${lobby.server_password || ''}`;
                                                    navigator.clipboard.writeText(cmd);
                                                    alert('Skopiowano polecenie konsoli do schowka!');
                                                }}
                                                className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 py-4 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 transform skew-x-[-5deg]"
                                            >
                                                <span className="block transform skew-x-[5deg]">SKOPIUJ POLECENIE KONSOLI</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0c]/95 border-t border-zinc-800/80 backdrop-blur-xl z-40 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <CheckCircle2 className={`w-8 h-8 ${allReady ? 'text-emerald-500' : 'text-zinc-700'}`} />
                        <div>
                            <div className="text-sm font-black text-white uppercase tracking-wider">Status Gotowości</div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                Gotowych graczy: <span className="text-emerald-500 font-black text-xs">{readyCount}</span> / {lobby.team_size * 2}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {lobby.status === 'waiting' && currentPlayer && currentPlayer.team !== 'unassigned' && (
                            <button onClick={handleToggleReady} className={`px-10 py-4 font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 transform skew-x-[-10deg] rounded-sm ${currentPlayer.is_ready ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}>
                                <span className="block transform skew-x-[10deg] flex items-center gap-2"><Check className="w-5 h-5" /> {currentPlayer.is_ready ? 'JESTEŚ GOTOWY' : 'POTWIERDŹ GOTOWOŚĆ'}</span>
                            </button>
                        )}
                        
                        {lobby.status === 'waiting' && isLeader && (
                            <button onClick={handleStartVeto} disabled={!(vetoDevMode || allReady)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-12 py-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform skew-x-[-10deg] ml-4">
                                <span className="block transform skew-x-[10deg] flex items-center gap-2"><Play className="w-5 h-5" fill="currentColor" /> START VETO {vetoDevMode && '(DEV)'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
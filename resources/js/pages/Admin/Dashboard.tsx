import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Server, Settings, Shield, Plus, Edit3, Trash2, Key, HardDrive, Terminal, X, Check, Save, Map, MapPin } from 'lucide-react';
import React, { useState } from 'react';

export default function AdminDashboard() {
    const { servers, mapSettings } = usePage<any>().props;

    const [isServerModalOpen, setIsServerModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingServer, setEditingServer] = useState<any>(null);

    const { data: sData, setData: sSetData, post: sPost, put: sPut, reset: sReset, processing: sProcessing, errors: sErrors } = useForm({
        name: '', ip: '', port: 27015, rcon_password: '', ftp_host: '', ftp_port: 21, ftp_user: '', ftp_password: '', is_active: true
    });

    const { data: pData, setData: pSetData, post: pPost, reset: pReset, processing: pProcessing, recentlySuccessful: pSuccess } = useForm({
        new_password: ''
    });

    const { data: mData, setData: mSetData, post: mPost, processing: mProcessing, recentlySuccessful: mSuccess } = useForm({
        standard: mapSettings?.standard || '',
        wingman: mapSettings?.wingman || '',
        '1v1': mapSettings?.['1v1'] || ''
    });

    const openCreateModal = () => {
        setEditingServer(null);
        sReset();
        setIsServerModalOpen(true);
    };

    const openEditModal = (server: any) => {
        setEditingServer(server);
        sSetData({
            name: server.name,
            ip: server.ip,
            port: server.port,
            rcon_password: '',
            ftp_host: server.ftp_host || '',
            ftp_port: server.ftp_port || 21,
            ftp_user: server.ftp_user || '',
            ftp_password: '',
            is_active: server.is_active
        });
        setIsServerModalOpen(true);
    };

    const handleServerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingServer) {
            sPut(`/admin/servers/${editingServer.id}`, { onSuccess: () => setIsServerModalOpen(false) });
        } else {
            sPost('/admin/servers', { onSuccess: () => setIsServerModalOpen(false) });
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        pPost('/admin/password', { onSuccess: () => pReset() });
    };

    const handleMapsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mPost('/admin/maps');
    };

    const deleteServer = (id: number) => {
        if (confirm('Usunąć ten serwer definitywnie?')) {
            import('@inertiajs/react').then(({ router }) => {
                router.delete(`/admin/servers/${id}`);
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#070708] text-zinc-300 font-sans selection:bg-red-500 selection:text-white pb-20 relative">
            <Head title="Panel Administratora" />
            
            <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none"></div>

            <nav className="sticky top-0 z-50 bg-[#0a0a0c]/90 border-b border-zinc-800/80 backdrop-blur-xl">
                <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="px-4 py-1.5 text-xs font-black text-black bg-white rounded uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                            Wróć do aplikacji
                        </Link>
                        <div className="w-px h-6 bg-zinc-800"></div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-red-500" />
                            <span className="text-xl font-black text-white uppercase tracking-tighter">Sudo Mode</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white bg-[#131317] border border-zinc-800 px-4 py-2 rounded-lg transition-colors shadow-inner"
                    >
                        <Key className="w-4 h-4 text-red-500" /> Zmień hasło Admina
                    </button>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto py-12 px-6 relative z-10 space-y-16">
                
                <section>
                    <div className="flex flex-col md:flex-row items-end justify-between mb-8 border-b border-zinc-800/80 pb-6 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Server className="w-4 h-4 text-red-500" />
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Architektura</span>
                            </div>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tight drop-shadow-md">Maszyny CS2</h2>
                        </div>
                        
                        <button 
                            onClick={openCreateModal}
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                        >
                            <Plus className="w-4 h-4" strokeWidth={3} /> Podłącz nowy serwer
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {servers.map((server: any) => (
                            <div key={server.id} className="bg-[#0e0e11]/80 backdrop-blur-sm border border-zinc-800/80 hover:border-red-900/50 rounded-2xl overflow-hidden shadow-2xl transition-all group">
                                <div className="px-6 py-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900/50 to-transparent flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${server.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                        <h3 className="font-black text-white uppercase tracking-wider truncate max-w-[200px]">{server.name}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(server)} className="p-1.5 bg-zinc-800 hover:bg-yellow-500 text-zinc-400 hover:text-black rounded transition-colors" title="Edytuj konfigurację">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deleteServer(server.id)} className="p-1.5 bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white rounded transition-colors" title="Usuń maszynę">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Terminal className="w-3 h-3"/> Połączenie GRY & RCON</div>
                                        <div className="text-sm font-black text-white font-mono bg-[#131317] border border-zinc-800 px-3 py-2 rounded shadow-inner">
                                            {server.ip}:{server.port}
                                        </div>
                                        <div className="text-[10px] text-red-400 font-bold mt-1 px-1 tracking-widest">HASŁO RCON ZASZYFROWANE</div>
                                    </div>
                                    
                                    {server.ftp_host && (
                                        <div className="pt-2 border-t border-zinc-800/50">
                                            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><HardDrive className="w-3 h-3"/> Dostęp FTP (Do pobierania DEM)</div>
                                            <div className="text-xs font-bold text-zinc-300">
                                                {server.ftp_user}@{server.ftp_host}:{server.ftp_port}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex flex-col md:flex-row items-end justify-between mb-8 border-b border-zinc-800/80 pb-6 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Map className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Ustawienia Rozgrywki</span>
                            </div>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tight drop-shadow-md">Pule Map</h2>
                        </div>
                    </div>

                    <form onSubmit={handleMapsSubmit} className="bg-[#0e0e11]/80 backdrop-blur-sm border border-zinc-800/80 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-3xl rounded-full pointer-events-none"></div>
                        
                        <div className="relative z-10 grid grid-cols-1 gap-6 mb-8">
                            <div className="bg-[#131317] border border-zinc-800/50 p-5 rounded-2xl shadow-inner">
                                <label className="text-xs font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-400" /> Map Pool - Standard (5v5)
                                </label>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-3">Oddzielaj nazwy map średnikiem (;)</p>
                                <input 
                                    type="text" 
                                    value={mData.standard} 
                                    onChange={e => mSetData('standard', e.target.value)} 
                                    required 
                                    className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-blue-500 text-white px-4 py-3 rounded-xl text-sm font-mono outline-none" 
                                />
                            </div>

                            <div className="bg-[#131317] border border-zinc-800/50 p-5 rounded-2xl shadow-inner">
                                <label className="text-xs font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-400" /> Map Pool - Wingman (2v2)
                                </label>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-3">Oddzielaj nazwy map średnikiem (;)</p>
                                <input 
                                    type="text" 
                                    value={mData.wingman} 
                                    onChange={e => mSetData('wingman', e.target.value)} 
                                    required 
                                    className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-mono outline-none" 
                                />
                            </div>

                            <div className="bg-[#131317] border border-zinc-800/50 p-5 rounded-2xl shadow-inner">
                                <label className="text-xs font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-orange-400" /> Map Pool - Aim (1v1)
                                </label>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-3">Oddzielaj nazwy map średnikiem (;)</p>
                                <input 
                                    type="text" 
                                    value={mData['1v1']} 
                                    onChange={e => mSetData('1v1', e.target.value)} 
                                    required 
                                    className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-orange-500 text-white px-4 py-3 rounded-xl text-sm font-mono outline-none" 
                                />
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80 pt-6">
                            <div className="w-full sm:w-1/2">
                                {mSuccess && (
                                    <div className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/30 w-fit">
                                        <Check className="w-4 h-4" /> Ustawienia Map zapisane!
                                    </div>
                                )}
                            </div>
                            <button 
                                disabled={mProcessing} 
                                type="submit" 
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> {mProcessing ? 'Zapisywanie...' : 'Zapisz Rotację Map'}
                            </button>
                        </div>
                    </form>
                </section>

            </main>

            {isServerModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0e0e11] border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative transform animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-3xl rounded-full pointer-events-none"></div>
                        
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800/80 relative z-10">
                            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Server className="w-5 h-5 text-red-500" /> {editingServer ? 'Edycja Maszyny' : 'Podłącz Maszynę'}
                            </h2>
                            <button onClick={() => setIsServerModalOpen(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        
                        <form onSubmit={handleServerSubmit} className="p-6 relative z-10 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Nazwa Robocza Serwera</label>
                                    <input type="text" value={sData.name} onChange={e => sSetData('name', e.target.value)} required className="w-full bg-[#131317] border border-zinc-800 focus:border-red-500 text-white px-4 py-3 rounded-xl text-sm font-bold outline-none" placeholder="np. Serwer Warszawa #1" />
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Adres IP</label>
                                    <input type="text" value={sData.ip} onChange={e => sSetData('ip', e.target.value)} required className="w-full bg-[#131317] border border-zinc-800 focus:border-red-500 text-white px-4 py-3 rounded-xl text-sm font-mono outline-none" placeholder="193.33.176.69" />
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Port Gry / RCON</label>
                                    <input type="number" value={sData.port} onChange={e => sSetData('port', parseInt(e.target.value))} required className="w-full bg-[#131317] border border-zinc-800 focus:border-red-500 text-white px-4 py-3 rounded-xl text-sm font-mono outline-none" />
                                </div>

                                <div className="md:col-span-2 bg-red-900/10 border border-red-900/30 p-4 rounded-xl">
                                    <label className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Key className="w-3 h-3"/> Hasło RCON (Szyfrowane w DB)</label>
                                    <input type="password" value={sData.rcon_password} onChange={e => sSetData('rcon_password', e.target.value)} required={!editingServer} className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-red-500 text-white px-4 py-3 rounded-xl text-sm font-mono outline-none" placeholder={editingServer ? "Zostaw puste, aby nie zmieniać aktualnego hasła" : "Tajne hasło rcon"} />
                                </div>
                            </div>

                            <div className="border-t border-zinc-800/80 pt-6 mb-6">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-zinc-500" /> Konfiguracja FTP (Dema)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">FTP Host</label>
                                        <input type="text" value={sData.ftp_host} onChange={e => sSetData('ftp_host', e.target.value)} className="w-full bg-[#131317] border border-zinc-800 focus:border-zinc-500 text-white px-4 py-3 rounded-xl text-sm font-mono outline-none" placeholder="ftp.pukawka.pl" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">FTP Port</label>
                                        <input type="number" value={sData.ftp_port} onChange={e => sSetData('ftp_port', parseInt(e.target.value))} className="w-full bg-[#131317] border border-zinc-800 focus:border-zinc-500 text-white px-4 py-3 rounded-xl text-sm font-mono outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">FTP User</label>
                                        <input type="text" value={sData.ftp_user} onChange={e => sSetData('ftp_user', e.target.value)} className="w-full bg-[#131317] border border-zinc-800 focus:border-zinc-500 text-white px-4 py-3 rounded-xl text-sm font-mono outline-none" placeholder="user123" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 block flex items-center gap-1"><Key className="w-3 h-3"/> FTP Password</label>
                                        <input type="password" value={sData.ftp_password} onChange={e => sSetData('ftp_password', e.target.value)} className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-zinc-500 text-white px-4 py-3 rounded-xl text-sm font-mono outline-none" placeholder={editingServer ? "Zostaw puste, aby nie zmieniać" : "Hasło FTP"} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-[#131317] border border-zinc-800/80 p-4 rounded-xl mb-8 cursor-pointer" onClick={() => sSetData('is_active', !sData.is_active)}>
                                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${sData.is_active ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-transparent'}`}>
                                    <Check className="w-3 h-3" strokeWidth={4} />
                                </div>
                                <span className="text-sm font-bold text-white uppercase tracking-wider">Serwer jest aktywny (dostępny dla graczy)</span>
                            </div>

                            <button disabled={sProcessing} type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] disabled:opacity-50 flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> {sProcessing ? 'Zapisywanie...' : 'Zapisz konfigurację serwera'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0e0e11] border border-red-900/50 rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)] relative transform animate-in zoom-in-95 duration-200 p-8">
                        <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-4 right-4 z-20 p-2 text-zinc-500 hover:text-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-red-900/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Key className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">Hasło Sudo</h2>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Zmiana globalnego hasła panelu</p>
                        </div>

                        {pSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold uppercase tracking-widest p-3 rounded-lg text-center mb-6 flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" /> Hasło zmienione pomyślnie
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="mb-6">
                                <input type="password" required minLength={6} value={pData.new_password} onChange={e => pSetData('new_password', e.target.value)} className="w-full bg-[#131317] border border-zinc-800 focus:border-red-500 text-white px-4 py-4 rounded-xl text-sm font-black tracking-widest text-center outline-none" placeholder="NOWE HASŁO" />
                            </div>
                            <button disabled={pProcessing || pData.new_password.length < 6} type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50">
                                Aktualizuj Hasło
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Settings, Lock, Code, FileText, AlertTriangle } from 'lucide-react';

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'cookies' | 'legal'>('cookies');
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        const consent = localStorage.getItem('iem_sztum_cookie_consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const allTrue = { necessary: true, analytics: true, marketing: true };
        localStorage.setItem('iem_sztum_cookie_consent', JSON.stringify(allTrue));
        setIsVisible(false);
    };

    const handleSaveCustom = () => {
        localStorage.setItem('iem_sztum_cookie_consent', JSON.stringify(preferences));
        setIsVisible(false);
        setIsSettingsOpen(false);
    };

    if (!isVisible) return null;

    return (
        <>
            {!isSettingsOpen ? (
                <div className="fixed bottom-6 left-6 right-6 md:left-6 md:right-auto md:max-w-md z-[300] bg-[#0e0e11]/95 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-yellow-600 to-transparent rounded-t-2xl"></div>
                    
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 shrink-0">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">Platforma Open-Source & Prywatność</h3>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                IEM Sztum to hobbystyczny projekt open-source tworzony w celach rozrywkowych. Korzystanie z serwisu i zapraszanie graczy jest w pełni dobrowolne. Używamy plików cookie niezbędnych do działania sesji.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <Settings className="w-3.5 h-3.5" /> Ustawienia i Nota Prawna
                        </button>
                        <button
                            onClick={handleAcceptAll}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] flex items-center justify-center gap-2"
                        >
                            <Check className="w-3.5 h-3.5" /> Akceptuję
                        </button>
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 z-[310] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0e0e11] border border-zinc-800 rounded-2xl w-full max-w-xl p-6 md:p-8 shadow-2xl relative transform animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setIsSettingsOpen(false)} 
                            className="absolute top-5 right-5 p-2 bg-zinc-900 hover:bg-red-500 text-zinc-400 hover:text-white rounded-full transition-colors border border-zinc-800"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider">Ustawienia i Informacje Prawne</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Zarządzanie zgodami oraz status projektu</p>
                            </div>
                        </div>

                        <div className="flex gap-2 border-b border-zinc-800 mb-6 pb-2">
                            <button
                                onClick={() => setActiveTab('cookies')}
                                className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'cookies' ? 'bg-yellow-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white bg-zinc-900/50'}`}
                            >
                                <Settings className="w-3.5 h-3.5" /> Pliki Cookie
                            </button>
                            <button
                                onClick={() => setActiveTab('legal')}
                                className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'legal' ? 'bg-yellow-500 text-black shadow-lg' : 'text-zinc-400 hover:text-white bg-zinc-900/50'}`}
                            >
                                <FileText className="w-3.5 h-3.5" /> Nota Prawna & Open-Source
                            </button>
                        </div>

                        {activeTab === 'cookies' ? (
                            <div className="space-y-4 mb-8">
                                <div className="bg-[#131317] border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between">
                                    <div className="space-y-1 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-white uppercase tracking-wider">Niezbędne</span>
                                            <span className="bg-zinc-800 text-zinc-400 text-[8px] font-black px-2 py-0.5 rounded uppercase">Wymagane</span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 leading-normal">Kluczowe dla utrzymania sesji gracza, uwierzytelniania Steam oraz mechaniki platformy.</p>
                                    </div>
                                    <div className="p-2 bg-zinc-900 rounded-lg text-yellow-500 border border-zinc-800">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="bg-[#131317] border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between">
                                    <div className="space-y-1 pr-4">
                                        <span className="text-xs font-black text-white uppercase tracking-wider">Analityczne</span>
                                        <p className="text-[11px] text-zinc-500 leading-normal">Pomagają w optymalizacji działania skryptów i stabilności serwera.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input 
                                            type="checkbox" 
                                            checked={preferences.analytics}
                                            onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                    </label>
                                </div>

                                <div className="bg-[#131317] border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between">
                                    <div className="space-y-1 pr-4">
                                        <span className="text-xs font-black text-white uppercase tracking-wider">Marketingowe</span>
                                        <p className="text-[11px] text-zinc-500 leading-normal">Wykorzystywane opcjonalnie do celów promocyjnych turniejów.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input 
                                            type="checkbox" 
                                            checked={preferences.marketing}
                                            onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-8 bg-[#131317] border border-zinc-800/80 p-5 rounded-xl text-xs text-zinc-400 leading-relaxed">
                                <div className="flex items-center gap-2 text-yellow-500 font-black uppercase tracking-wider mb-2">
                                    <Code className="w-4 h-4" /> Projekt Open-Source & Wyłączenie Odpowiedzialności
                                </div>
                                <p>
                                    1. <strong>Charakter projektu:</strong> Serwis <span className="text-white font-bold">IEM Sztum</span> jest otwartoźródłowym projektem typu <span className="text-yellow-500 font-bold">open-source</span> udostępnianym społeczności wyłącznie w celach hobbystycznych i rozrywkowych.
                                </p>
                                <p>
                                    2. <strong>Dobrowolność:</strong> Dołączanie do platformy, zakładanie kont, uczestnictwo w meczach oraz zapraszanie innych graczy ma charakter w 100% dobrowolny.
                                </p>
                                <p>
                                    3. <strong>Brak regulaminu i wyłączenie odpowiedzialności:</strong> Platforma nie posiada sformalizowanego regulaminu komercyjnego. Administrator serwera oraz twórcy oprogramowania <span className="text-red-400 font-bold">nie ponoszą absolutnie żadnej odpowiedzialności</span> za funkcjonowanie serwisu, zachowania użytkowników, ewentualne przerwy w dostępie, utratę danych czy jakiekolwiek szkody pośrednie lub bezpośrednie wynikające z korzystania z serwisu. Korzystasz z platformy na własną odpowiedzialność.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors border border-zinc-800"
                            >
                                Zamknij
                            </button>
                            <button
                                onClick={handleSaveCustom}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                            >
                                Zapisz wybór
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
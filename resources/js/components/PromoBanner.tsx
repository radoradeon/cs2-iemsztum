import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, X, Sparkles, Globe } from 'lucide-react';

interface PromoBannerProps {
    customLink?: string;
    title?: string;
    subtitle?: string;
    positionY?: 'top' | 'bottom';
    positionX?: 'left' | 'right' | 'center';
}

export default function PromoBanner({ 
    customLink, 
    title = "Zaproś znajomych do gry!", 
    subtitle = "Prześlij ten link swoim znajomym i zacznijcie wspólnie rywalizować w rozgrywkach IEM SZTUM!",
    positionY = 'bottom',
    positionX = 'right'
}: PromoBannerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [link, setLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const isDismissed = sessionStorage.getItem('promo_banner_dismissed');
        if (!isDismissed) {
            setIsVisible(true);
        }

        if (customLink) {
            setLink(customLink);
        } else if (typeof window !== 'undefined') {
            setLink(window.location.origin);
        }
    }, [customLink]);

    if (!isVisible) return null;

    const handleClose = () => {
        sessionStorage.setItem('promo_banner_dismissed', 'true');
        setIsVisible(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const yClass = positionY === 'top' ? 'top-6' : 'bottom-6';
    const xClass = positionX === 'left' ? 'left-6' : positionX === 'right' ? 'right-6' : 'left-1/2 -translate-x-1/2';
    const slideAnim = positionY === 'top' ? 'slide-in-from-top-12' : 'slide-in-from-bottom-12';

    return (
        <div className={`fixed z-[200] ${yClass} ${xClass} w-[calc(100vw-3rem)] md:w-[700px] max-w-full bg-gradient-to-r from-[#0e0e11] via-[#131317] to-[#0a0a0c] border border-yellow-500/40 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] group/banner animate-in fade-in ${slideAnim} duration-700 ease-out`}>
            
            <div className="absolute inset-0 bg-[url('https://community.fastly.steamstatic.com/public/shared/images/responsive/header_logo.png')] bg-no-repeat bg-right-bottom opacity-5 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none transition-all duration-1000 group-hover/banner:bg-yellow-500/20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <button 
                onClick={handleClose}
                className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-red-500 text-zinc-400 hover:text-white rounded-full transition-colors border border-zinc-700/50 hover:border-red-500 shadow-lg"
                title="Zamknij na czas trwania sesji"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-5 md:p-6 gap-6">
                
                <div className="flex items-center gap-5 w-full md:w-[55%]">
                    <div className="hidden sm:flex relative shrink-0">
                        <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center transform -skew-x-6 shadow-xl border-2 border-yellow-300/50 relative z-10">
                            <Users className="w-7 h-7 text-black transform skew-x-6" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                            <span className="text-[9px] text-yellow-500 font-black uppercase tracking-[0.3em] drop-shadow-md">Dołącz do gry</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider drop-shadow-lg mb-1.5 leading-tight">
                            {title}
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-[45%] flex flex-col justify-center">
                    <div className="w-full bg-[#0a0a0c]/90 backdrop-blur-sm border border-zinc-700/80 rounded-xl p-2.5 shadow-inner relative group/input">
                        <div className="absolute -top-2.5 left-3 bg-[#131317] border border-zinc-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1 shadow-md">
                            <Globe className="w-2.5 h-2.5" /> Adres WWW
                        </div>
                        
                        <div className="flex gap-2 mt-1.5">
                            <input 
                                type="text" 
                                readOnly 
                                value={link}
                                className="flex-1 bg-transparent border-none text-yellow-500 font-mono text-xs font-bold outline-none px-2 select-all selection:bg-yellow-500/30 truncate"
                            />
                            
                            <button 
                                onClick={handleCopy}
                                className={`relative overflow-hidden px-4 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 min-w-[120px] transform hover:scale-[1.03] active:scale-95 ${
                                    copied 
                                        ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400' 
                                        : 'bg-zinc-800 hover:bg-yellow-500 text-white hover:text-black border border-zinc-700 hover:border-yellow-400 shadow-md'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3 animate-in zoom-in" strokeWidth={3} />
                                        <span>Skopiowano</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3" />
                                        <span>Kopiuj Link</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
import { Head, usePage } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';
import { AlertCircle } from 'lucide-react';
import React from 'react';

interface PageProps {
    flash?: {
        error?: string;
    };
    [key: string]: any;
}

export default function Login() {
    const { flash } = usePage<PageProps>().props;

    return (
        <AuthLayout title="Autoryzacja" description="Wymagane Konto Steam">
            <Head title="Logowanie - IEM SZTUM" />

            <div className="flex flex-col gap-6 relative z-10">
                
                {flash?.error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest p-4 rounded-sm flex items-center justify-center gap-3 text-center shadow-lg">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                <div className="grid gap-8">
                    <p className="text-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        Dołączenie do intergalaktycznej ligi wymaga weryfikacji tożsamości poprzez platformę Steam. 
                        Pobierzemy tylko twój <span className="text-zinc-300">Nickname, Avatar</span> oraz <span className="text-zinc-300">SteamID</span>.
                    </p>

                    <a 
                        href="/login/steam"
                        className="group relative w-full bg-[#171a21] hover:bg-[#2a475e] text-white py-5 rounded-sm font-black text-sm uppercase tracking-widest transition-all border border-[#2a475e] hover:border-[#66c0f4] flex items-center justify-center gap-4 transform skew-x-[-5deg] shadow-[0_0_20px_rgba(42,71,94,0.3)] hover:shadow-[0_0_30px_rgba(102,192,244,0.4)]"
                    >
                        <span className="block transform skew-x-[5deg] flex items-center gap-3">
                            <svg className="w-6 h-6 text-[#66c0f4] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.979 0C5.353 0 0 5.373 0 12c0 2.518.777 4.856 2.11 6.804L6.924 14c-.046-.3-.075-.609-.075-.925 0-3.136 2.53-5.688 5.643-5.688 3.111 0 5.642 2.552 5.642 5.688 0 3.134-2.531 5.685-5.642 5.685-.623 0-1.22-.107-1.777-.298l-3.35 4.881C9.096 23.821 10.512 24 12 24c6.627 0 12-5.373 12-12S18.605 0 11.979 0zM12.49 8.653c-2.457 0-4.453 2.006-4.453 4.475 0 .227.026.446.062.66l-4.1 5.975c.928 1.139 2.138 2.062 3.513 2.658l2.946-4.292c.626.241 1.309.38 2.032.38 2.459 0 4.456-2.007 4.456-4.477 0-2.468-1.997-4.475-4.456-4.475V8.653zm0 1.258c1.761 0 3.197 1.442 3.197 3.217 0 1.773-1.436 3.215-3.197 3.215-1.76 0-3.196-1.442-3.196-3.215 0-1.775 1.436-3.217 3.196-3.217z"/>
                            </svg>
                            Zaloguj przez Steam
                        </span>
                    </a>

                    <div className="text-center pt-2">
                        <a href="/" className="text-[10px] font-bold text-zinc-500 hover:text-yellow-500 uppercase tracking-widest transition-colors">
                            Powrót do strony głównej
                        </a>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
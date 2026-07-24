import React from 'react';

export default function IemSztumLogo({ className = "w-24 h-24" }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 500 500" 
            className={className}
        >
            <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#131317" />
                    <stop offset="100%" stopColor="#070708" />
                </linearGradient>
                <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
            </defs>
            
            <rect width="500" height="500" rx="40" fill="url(#bgGrad)" />
            
            <path 
                d="M250 60 L400 100 L400 300 C400 410 250 460 250 460 C250 460 100 410 100 300 L100 100 Z" 
                fill="none" 
                stroke="url(#yellowGrad)" 
                strokeWidth="12" 
                strokeLinejoin="round"
            />
            
            <path 
                d="M250 90 L370 125 L370 290 C370 380 250 425 250 425 C250 425 130 380 130 290 L130 125 Z" 
                fill="#0e0e11" 
                stroke="#3f3f46" 
                strokeWidth="4"
            />
            
            <circle cx="250" cy="220" r="50" fill="none" stroke="#52525b" strokeWidth="4" strokeDasharray="10 5" />
            <line x1="250" y1="140" x2="250" y2="190" stroke="url(#yellowGrad)" strokeWidth="8" strokeLinecap="round"/>
            <line x1="250" y1="250" x2="250" y2="300" stroke="url(#yellowGrad)" strokeWidth="8" strokeLinecap="round"/>
            <line x1="170" y1="220" x2="220" y2="220" stroke="url(#yellowGrad)" strokeWidth="8" strokeLinecap="round"/>
            <line x1="280" y1="220" x2="330" y2="220" stroke="url(#yellowGrad)" strokeWidth="8" strokeLinecap="round"/>
            
            <circle cx="250" cy="220" r="6" fill="#ef4444" />
            
            <text x="250" y="360" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="42" fill="#ffffff" textAnchor="middle" fontStyle="italic" letterSpacing="4">IEM</text>
            <text x="250" y="405" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="48" fill="url(#yellowGrad)" textAnchor="middle" fontStyle="italic" letterSpacing="2">SZTUM</text>
        </svg>
    );
}
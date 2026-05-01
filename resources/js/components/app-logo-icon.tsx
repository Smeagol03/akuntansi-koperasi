import type { SVGAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: SVGAttributes<SVGElement>) {
    return (
        <svg 
            {...props} 
            className={className} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* The Foundation (Roof) */}
            <rect x="0" y="2" width="24" height="4" fill="currentColor" />
            
            {/* 4 Pillars of Cooperation (Proportional 4px width, 2px gaps) */}
            <g fill="currentColor">
                <rect x="1" y="8" width="4" height="13" />
                <rect x="7" y="8" width="4" height="13" />
                <rect x="13" y="8" width="4" height="13" />
                <rect x="19" y="8" width="4" height="13" />
            </g>

            {/* The Horizontal Split (Representing Merah Putih Flag) */}
            <rect x="0" y="13" width="24" height="2" fill="white" className="dark:fill-black" />

            {/* Base Line */}
            <rect x="0" y="22" width="24" height="1" fill="currentColor" />
        </svg>
    );
}

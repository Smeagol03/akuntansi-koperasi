import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            {/* Background Base */}
            <rect width="100" height="100" fill="none" />
            {/* Landmark Icon (Simplified representation of Cooperative) */}
            <path d="M50 15L15 40V50H85V40L50 15Z" fill="currentColor" />
            <rect x="20" y="55" width="8" height="25" fill="currentColor" />
            <rect x="35" y="55" width="8" height="25" fill="currentColor" />
            <rect x="50" y="55" width="8" height="25" fill="currentColor" />
            <rect x="65" y="55" width="8" height="25" fill="currentColor" />
            <rect x="80" y="55" width="8" height="25" fill="currentColor" />
            <rect x="10" y="85" width="80" height="5" fill="currentColor" />
        </svg>
    );
}

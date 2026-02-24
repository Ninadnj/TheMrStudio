import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

interface SmoothScrollProps {
    children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
    return (
        <ReactLenis root options={{ lerp: 0.08, duration: 1.6, smoothWheel: true, wheelMultiplier: 1 }}>
            {children}
        </ReactLenis>
    );
}

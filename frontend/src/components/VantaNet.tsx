import { useEffect, useRef } from 'react';

interface VantaNetProps {
    className?: string;
}

const VantaNet: React.FC<VantaNetProps> = ({ className = '' }) => {
    const vantaRef = useRef<HTMLDivElement>(null);
    const vantaEffect = useRef<any>(null);

    useEffect(() => {
        if (!vantaRef.current) return;

        // Wait for VANTA to be available
        const initVanta = () => {
            if (window.VANTA && window.THREE) {
                vantaEffect.current = window.VANTA.NET({
                    el: vantaRef.current!,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.0,
                    minWidth: 200.0,
                    scale: 1.0,
                    scaleMobile: 1.0,
                    color: 0x402e7a,
                    backgroundColor: 0x131313,
                    points: 11.0,
                });
            }
        };

        // Check if scripts are loaded
        if (window.VANTA && window.THREE) {
            initVanta();
        } else {
            // Wait for scripts to load
            const checkInterval = setInterval(() => {
                if (window.VANTA && window.THREE) {
                    clearInterval(checkInterval);
                    initVanta();
                }
            }, 100);

            return () => clearInterval(checkInterval);
        }

        return () => {
            if (vantaEffect.current) {
                vantaEffect.current.destroy();
            }
        };
    }, []);

    return <div ref={vantaRef} className={className} />;
};

export default VantaNet;

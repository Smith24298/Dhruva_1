interface VantaNetConfig {
    el: HTMLElement | string;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    backgroundColor?: number;
    points?: number;
}

interface VantaEffect {
    destroy: () => void;
    resize: () => void;
    setOptions: (options: Partial<VantaNetConfig>) => void;
}

interface VantaStatic {
    NET: (config: VantaNetConfig) => VantaEffect;
}

declare global {
    interface Window {
        VANTA: VantaStatic;
        THREE: any;
    }
}

export { };

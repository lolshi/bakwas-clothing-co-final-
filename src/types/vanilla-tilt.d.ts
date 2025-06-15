declare module 'vanilla-tilt' {
  interface VanillaTiltOptions {
    reverse?: boolean;
    max?: number;
    startX?: number;
    startY?: number;
    perspective?: number;
    scale?: number;
    speed?: number;
    transition?: boolean;
    axis?: string | null;
    reset?: boolean;
    easing?: string;
    glare?: boolean;
    'max-glare'?: number;
    'glare-prerender'?: boolean;
    'mouse-event-element'?: string | HTMLElement | null;
    'reset-to-start'?: boolean;
    gyroscope?: boolean;
    gyroscopeMinAngleX?: number;
    gyroscopeMaxAngleX?: number;
    gyroscopeMinAngleY?: number;
    gyroscopeMaxAngleY?: number;
    gyroscopeSamples?: number;
  }

  interface VanillaTiltElement extends HTMLElement {
    vanillaTilt: {
      destroy(): void;
    };
  }

  function VanillaTilt(element: HTMLElement | HTMLElement[], options?: VanillaTiltOptions): void;

  namespace VanillaTilt {
    function init(element: HTMLElement | HTMLElement[], options?: VanillaTiltOptions): void;
  }

  export = VanillaTilt;
} 
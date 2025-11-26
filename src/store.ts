import { create } from 'zustand';

interface GestureState {
    rotation: { x: number; y: number };
    scale: number;
    position: { x: number; y: number; z: number };
    setRotation: (x: number, y: number) => void;
    setScale: (scale: number) => void;
    setPosition: (x: number, y: number, z: number) => void;
}

export const useGestureStore = create<GestureState>((set) => ({
    rotation: { x: 0, y: 0 },
    scale: 1,
    position: { x: 0, y: 0, z: 0 },
    setRotation: (x, y) => set({ rotation: { x, y } }),
    setScale: (scale) => set({ scale }),
    setPosition: (x, y, z) => set({ position: { x, y, z } }),
}));

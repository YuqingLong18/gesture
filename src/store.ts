import { create } from 'zustand';

export type ShapeType = 'ring' | 'heart' | 'octahedron' | 'icosahedron';
export type AppMode = 'visualizer' | 'molecule' | 'gravity' | 'math' | 'solar';

interface GestureState {
    rotation: { x: number; y: number };
    scale: number;
    position: { x: number; y: number; z: number };
    shape: ShapeType;
    mode: AppMode;
    setRotation: (x: number, y: number) => void;
    setScale: (scale: number) => void;
    setPosition: (x: number, y: number, z: number) => void;
    setShape: (shape: ShapeType) => void;
    setMode: (mode: AppMode) => void;
}

export const useGestureStore = create<GestureState>((set) => ({
    rotation: { x: 0, y: 0 },
    scale: 1,
    position: { x: 0, y: 0, z: 0 },
    shape: 'ring',
    mode: 'visualizer',
    setRotation: (x, y) => set({ rotation: { x, y } }),
    setScale: (scale) => set({ scale }),
    setPosition: (x, y, z) => set({ position: { x, y, z } }),
    setShape: (shape) => set({ shape }),
    setMode: (mode) => set({ mode }),
}));

import { useGestureStore, type AppMode } from '../store';

const ModeSelector = () => {
    const { mode, setMode } = useGestureStore();

    const modes: { id: AppMode; label: string }[] = [
        { id: 'visualizer', label: 'Visualizer' },
        { id: 'molecule', label: 'Molecule Inspector' },
        { id: 'gravity', label: 'Gravity Sandbox' },
        { id: 'math', label: 'Math Plotter' },
        { id: 'solar', label: 'Solar System' },
    ];

    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <div className="flex gap-2 p-2 rounded-full bg-black/80 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`
                            px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300
                            ${mode === m.id
                                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                                : 'text-cyan-500 hover:bg-cyan-500/20 hover:text-cyan-300'}
                        `}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ModeSelector;

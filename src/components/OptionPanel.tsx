import { useGestureStore, type ShapeType } from '../store';

const OptionPanel = () => {
    const { shape, setShape } = useGestureStore();

    const shapes: ShapeType[] = ['ring', 'heart', 'octahedron', 'icosahedron'];

    return (
        <div className="absolute top-32 right-8 z-50 pointer-events-auto">
            <div className="border-l-2 border-b-2 border-cyan-500 p-4 rounded-bl-lg bg-black/80 backdrop-blur-md">
                <h2 className="text-cyan-400 font-mono text-sm mb-3 tracking-wider">VISUALIZATION MODE</h2>
                <div className="flex flex-col gap-2">
                    {shapes.map((s) => (
                        <button
                            key={s}
                            onClick={() => setShape(s)}
                            className={`
                                px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all duration-300
                                border border-cyan-500/30 hover:border-cyan-400
                                ${shape === s
                                    ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                    : 'text-cyan-700 hover:text-cyan-400 hover:bg-cyan-500/10'}
                            `}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OptionPanel;

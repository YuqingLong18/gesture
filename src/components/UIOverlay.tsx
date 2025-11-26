const UIOverlay = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-8">
            <div className="flex justify-between items-start">
                <div className="border-l-2 border-t-2 border-cyan-500 p-4 rounded-tl-lg bg-black/30 backdrop-blur-sm">
                    <h1 className="text-cyan-400 font-mono text-2xl tracking-widest uppercase glow">System Online</h1>
                    <p className="text-cyan-700 font-mono text-sm">Tracking Module: Active</p>
                </div>
                <div className="border-r-2 border-t-2 border-cyan-500 p-4 rounded-tr-lg bg-black/30 backdrop-blur-sm">
                    <div className="text-right">
                        <p className="text-cyan-400 font-mono text-sm">FPS: 60</p>
                        <p className="text-cyan-700 font-mono text-xs">Latency: 12ms</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end">
                <div className="border-l-2 border-b-2 border-cyan-500 p-4 rounded-bl-lg bg-black/30 backdrop-blur-sm">
                    <p className="text-cyan-400 font-mono text-xs">COORDINATES</p>
                    <div className="flex gap-4 text-cyan-600 font-mono text-sm">
                        <span>X: 0.00</span>
                        <span>Y: 0.00</span>
                        <span>Z: 0.00</span>
                    </div>
                </div>
                <div className="border-r-2 border-b-2 border-cyan-500 p-4 rounded-br-lg bg-black/30 backdrop-blur-sm">
                    <p className="text-cyan-400 font-mono text-xs animate-pulse">AWAITING INPUT...</p>
                </div>
            </div>

            {/* Center Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-900/30 rounded-full flex items-center justify-center">
                <div className="w-60 h-60 border border-cyan-500/20 rounded-full animate-spin-slow"></div>
                <div className="absolute w-2 h-2 bg-cyan-500 rounded-full"></div>
            </div>
        </div>
    );
};

export default UIOverlay;

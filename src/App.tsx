import Scene from './components/Scene';
import HandTracker from './components/HandTracker';
import UIOverlay from './components/UIOverlay';

function App() {
  return (
    <div className="App relative w-full h-full overflow-hidden" style={{ width: '100vw', height: '100vh' }}>
      <HandTracker />
      <Scene />
      <UIOverlay />
    </div>
  );
}

export default App;

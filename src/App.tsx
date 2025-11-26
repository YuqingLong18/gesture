import Scene from './components/Scene';
import HandTracker from './components/HandTracker';
import UIOverlay from './components/UIOverlay';

function App() {
  return (
    <div className="App relative w-full h-full">
      <UIOverlay />
      <HandTracker />
      <Scene />
    </div>
  );
}

export default App;

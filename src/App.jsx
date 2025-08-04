import { useSnapshot } from 'valtio';

import CanvasModel from './canvas';
import { PartColorPicker } from './components/PartColorPicker';
import Home from './pages/Home';
import state from './store';

function App() {
  const snap = useSnapshot(state);

  return (
    <div className="app">
      {snap.intro ? (
        <Home />
      ) : (
        <>
          <CanvasModel />
          <PartColorPicker />
        </>
      )}
    </div>
  );
}

export default App

import Scene3D from './components/Scene3D';
import UIOverlay from './components/UIOverlay';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Configuração fixa para a apresentação do cliente
  const blurAmount = 0.2;
  const modelUrl = './modelo.glb'; // Caminho relativo para funcionar no GitHub Pages

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-900 touch-none">
      <ErrorBoundary>
        <Scene3D
          modelUrl={modelUrl}
          blurAmount={blurAmount}
        />
      </ErrorBoundary>
      
      <UIOverlay />
    </main>
  );
}

export default App;

import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Html } from '@react-three/drei';
import { Suspense } from 'react';
import ModelLoader from './ModelLoader';
import FPSController from './FPSController';

interface Scene3DProps {
  modelUrl: string | null;
  blurAmount: number;
}

export default function Scene3D({ modelUrl, blurAmount }: Scene3DProps) {
  return (
    <div className="absolute inset-0 z-0 bg-slate-900 cursor-move">
      <Canvas shadows camera={{ position: [0, 1.6, 8], fov: 50 }}>
        <Suspense 
          fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 text-white font-semibold shadow-2xl">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                Carregando Modelo 3D...
              </div>
            </Html>
          }
        >
          <Environment
            preset="city"
            background
            backgroundBlurriness={blurAmount}
          />
          
          <ambientLight intensity={0.8} />
          {/* Sol do meio-dia */}
          <directionalLight castShadow position={[5, 10, 5]} intensity={2.5} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />

          <ContactShadows position={[0, 0, 0]} opacity={0.7} scale={20} blur={2} far={4.5} />
          
          {/* Malha de referência para perceber o movimento no chão */}
          <gridHelper args={[50, 50, "#888888", "#444444"]} position={[0, 0.01, 0]} />

          {/* Sistema FPS Refatorado */}
          <FPSController />

          {modelUrl && <ModelLoader url={modelUrl} />}
        </Suspense>
      </Canvas>
    </div>
  );
}

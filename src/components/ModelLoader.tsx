import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

interface ModelLoaderProps {
  url: string;
}

export default function ModelLoader({ url }: ModelLoaderProps) {
  // useGLTF carrega o modelo, suporta Draco automaticamente via Drei
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (scene) {
      // Ajustar materiais para simular o ACM (Alumínio Composto)
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Se tiver um material, ajustamos as propriedades para parecer ACM
          if (child.material) {
            // Clonamos para não afetar outros materiais compartilhados indevidamente
            const mat = child.material.clone() as THREE.MeshStandardMaterial;
            
            // ACM: Levemente metálico, reflexo médio/alto
            mat.metalness = 0.3;
            mat.roughness = 0.3; // 0.2 para brilhante, 0.6 para fosco

            child.material = mat;
          }
        }
      });
    }
  }, [scene]);

  return <primitive object={scene} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} />;
}

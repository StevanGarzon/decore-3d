import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FirstPersonControls() {
  const { camera, gl } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Rotação da câmera
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isDragging = useRef(false);
  const previousTouch = useRef({ x: 0, y: 0 });

  // Referência para podermos definir a altura e posição inicial apenas uma vez
  const initialized = useRef(false);

  useFrame((_, delta) => {
    if (!initialized.current) {
      // Configura a câmera uma vez com a altura correta e afastada no eixo Z
      camera.position.set(0, 1.75, 8);
      camera.lookAt(0, 1.75, 0);
      euler.current.setFromQuaternion(camera.quaternion);
      initialized.current = true;
    }

    const speed = 4 * delta; // 4 metros por segundo
    
    // Vetores de direção baseados apenas no eixo Y da câmera (olhar para os lados)
    const direction = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, euler.current.y, 0));
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, euler.current.y, 0));

    // Movimentação (Frente/Trás/Esquerda/Direita)
    if (keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['w']) {
      camera.position.addScaledVector(direction, speed);
    }
    if (keys.current['ArrowDown'] || keys.current['KeyS'] || keys.current['s']) {
      camera.position.addScaledVector(direction, -speed);
    }
    if (keys.current['ArrowRight'] || keys.current['KeyD'] || keys.current['d']) {
      camera.position.addScaledVector(right, speed);
    }
    if (keys.current['ArrowLeft'] || keys.current['KeyA'] || keys.current['a']) {
      camera.position.addScaledVector(right, -speed);
    }

    // Trava a altura rigorosamente na altura dos olhos de uma pessoa (1.75m)
    camera.position.y = 1.75;
    
    // Atualiza a rotação da câmera no frame
    camera.quaternion.setFromEuler(euler.current);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      keys.current[e.code] = true; 
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      keys.current[e.code] = false; 
      keys.current[e.key.toLowerCase()] = false;
    };

    // Custom events vindos dos botões mobile
    const handleCustomKeyDown = (e: any) => { keys.current[e.detail.code] = true; };
    const handleCustomKeyUp = (e: any) => { keys.current[e.detail.code] = false; };

    const canvas = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      previousTouch.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = () => {
      // Tenta travar o mouse para estilo FPS padrão
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock().catch(() => {
          console.warn("PointerLock falhou, usando modo arraste.");
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      let movementX = 0;
      let movementY = 0;

      if (document.pointerLockElement === canvas) {
        // Mouse travado (FPS infinito)
        movementX = e.movementX * 0.002;
        movementY = e.movementY * 0.002;
      } else if (isDragging.current) {
        // Fallback: se o mouse não travou, usa o clique-e-arrasta ou toque (Mobile)
        const deltaX = e.clientX - previousTouch.current.x;
        const deltaY = e.clientY - previousTouch.current.y;
        previousTouch.current = { x: e.clientX, y: e.clientY };

        movementX = deltaX * 0.005;
        movementY = deltaY * 0.005;
      } else {
        return; // Nem travado nem arrastando
      }

      euler.current.y -= movementX;
      euler.current.x -= movementY;

      // Limitar olhar para cima/baixo (90 graus)
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mobile-keydown', handleCustomKeyDown);
    window.addEventListener('mobile-keyup', handleCustomKeyUp);
    
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mobile-keydown', handleCustomKeyDown);
      window.removeEventListener('mobile-keyup', handleCustomKeyUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [gl.domElement]);

  return null;
}

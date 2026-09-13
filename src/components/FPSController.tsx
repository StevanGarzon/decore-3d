import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function FPSController() {
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Estado para detectar se é Mobile (Touch)
  const [isMobile, setIsMobile] = useState(false);

  // Inputs recebidos da UI Mobile (Joystick e Touchpad)
  const joystickMove = useRef({ x: 0, y: 0 });
  const touchLook = useRef({ x: 0, y: 0 });

  // Altura fixa simulando os olhos humanos
  const eyeHeight = 1.6;
  const initialized = useRef(false);

  // Rotação manual usada apenas no fallback Mobile
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    // Verifica suporte a Touch
    const checkMobile = () => setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    checkMobile();

    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

    const handleJoystick = (e: any) => { joystickMove.current = e.detail; };
    const handleTouchLook = (e: any) => { 
      touchLook.current.x += e.detail.x * 0.005; 
      touchLook.current.y += e.detail.y * 0.005; 
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('joystick-move', handleJoystick);
    window.addEventListener('touch-look', handleTouchLook);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('joystick-move', handleJoystick);
      window.removeEventListener('touch-look', handleTouchLook);
    };
  }, []);

  useFrame((_, delta) => {
    if (!initialized.current) {
      camera.position.set(0, eyeHeight, 8);
      camera.lookAt(0, eyeHeight, 0);
      euler.current.setFromQuaternion(camera.quaternion);
      initialized.current = true;
    }

    const speed = 4 * delta; // Metros por segundo
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();

    // Obtém a direção global para a qual a câmera está olhando
    camera.getWorldDirection(direction);
    direction.y = 0; // Ignora eixo Y para não voar ao olhar para cima
    
    // PROTEÇÃO: Se olhar perfeitamente para cima ou para baixo, o vetor zera e quebra a tela (NaN)
    if (direction.lengthSq() === 0) {
      direction.set(0, 0, -1);
    }
    
    direction.normalize();
    // A ordem correta do cross product em 3D para obter a 'Direita' é (Frente x Cima)
    right.crossVectors(direction, camera.up).normalize();

    const moveVector = new THREE.Vector3(0, 0, 0);

    // Desktop (Teclado WASD)
    if (keys.current['KeyW'] || keys.current['ArrowUp']) moveVector.add(direction);
    if (keys.current['KeyS'] || keys.current['ArrowDown']) moveVector.sub(direction);
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) moveVector.sub(right);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) moveVector.add(right);

    // Mobile (Joystick)
    if (joystickMove.current.y !== 0) moveVector.addScaledVector(direction, -joystickMove.current.y);
    if (joystickMove.current.x !== 0) moveVector.addScaledVector(right, joystickMove.current.x);

    // Aplica o movimento consolidado
    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      camera.position.addScaledVector(moveVector, speed);
    }

    // Trava altura física (simulando contato com chão firme)
    camera.position.y = eyeHeight;

    // Mobile: Aplica rotação de câmera manual (Desktop usa o PointerLockControls)
    if (isMobile) {
      euler.current.y -= touchLook.current.x;
      euler.current.x -= touchLook.current.y;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
      
      // Reseta o delta do frame
      touchLook.current = { x: 0, y: 0 };
    }
  });

  return (
    <>
      {/* 
        PointerLockControls oficial do Drei (R3F) gerencia perfeitamente a rotação FPS no Desktop.
        Só é ativado se NÃO for mobile. 
      */}
      {!isMobile && <PointerLockControls makeDefault />}
    </>
  );
}

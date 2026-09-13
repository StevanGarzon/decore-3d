import { useState } from 'react';

export default function UIOverlay() {
  const [logoError, setLogoError] = useState(false);
  
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between">
      {/* Header Flutuante - Sempre Visível */}
      <header className="pointer-events-auto flex w-full items-center justify-between p-6 relative z-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20 shadow-xl">
          <img 
            src="logo.png" 
            alt="Logo da Empresa" 
            className={`h-10 w-auto object-contain drop-shadow-md ${logoError ? 'hidden' : 'block'}`}
            onError={() => setLogoError(true)}
          />
          {logoError && (
            <h1 className="text-xl font-semibold text-white tracking-tight">Decore 3D</h1>
          )}
        </div>
      </header>

      {/* Controles de Movimento Mobile (Joystick na Esquerda e TouchPad na Direita) */}
      <div className="pointer-events-auto absolute inset-0 z-0 sm:hidden">
        
        {/* Lado Direito: TouchPad Invisível para girar a câmera */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-full touch-none"
          onPointerDown={(e) => {
            const el = e.currentTarget as any;
            el.isDragging = true;
            el.prevX = e.clientX;
            el.prevY = e.clientY;
          }}
          onPointerMove={(e) => {
            const el = e.currentTarget as any;
            if (!el.isDragging) return;
            const deltaX = e.clientX - el.prevX;
            const deltaY = e.clientY - el.prevY;
            el.prevX = e.clientX;
            el.prevY = e.clientY;
            window.dispatchEvent(new CustomEvent('touch-look', { detail: { x: deltaX, y: deltaY } }));
          }}
          onPointerUp={(e) => { (e.currentTarget as any).isDragging = false; }}
          onPointerLeave={(e) => { (e.currentTarget as any).isDragging = false; }}
        />

        {/* Lado Esquerdo: Joystick Virtual */}
        <div 
          className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 backdrop-blur-md rounded-full border border-white/20 touch-none flex items-center justify-center"
          onPointerDown={(e) => { (e.currentTarget as any).isDragging = true; }}
          onPointerMove={(e) => {
            const el = e.currentTarget as any;
            if (!el.isDragging) return;
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            let dx = e.clientX - centerX;
            let dy = e.clientY - centerY;
            const maxRadius = rect.width / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > maxRadius) {
              dx = (dx / distance) * maxRadius;
              dy = (dy / distance) * maxRadius;
            }
            
            const stick = el.querySelector('#stick');
            if (stick) stick.style.transform = `translate(${dx}px, ${dy}px)`;
            
            window.dispatchEvent(new CustomEvent('joystick-move', { 
              detail: { x: dx / maxRadius, y: dy / maxRadius } 
            }));
          }}
          onPointerUp={(e) => { 
            const el = e.currentTarget as any;
            el.isDragging = false; 
            const stick = el.querySelector('#stick');
            if (stick) stick.style.transform = `translate(0px, 0px)`;
            window.dispatchEvent(new CustomEvent('joystick-move', { detail: { x: 0, y: 0 } }));
          }}
          onPointerLeave={(e) => { 
            const el = e.currentTarget as any;
            el.isDragging = false; 
            const stick = el.querySelector('#stick');
            if (stick) stick.style.transform = `translate(0px, 0px)`;
            window.dispatchEvent(new CustomEvent('joystick-move', { detail: { x: 0, y: 0 } }));
          }}
        >
          <div id="stick" className="w-12 h-12 bg-white/50 rounded-full shadow-lg transition-transform duration-75"></div>
        </div>

      </div>

      {/* Mira central estilo FPS (Crosshair) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center mix-blend-difference z-20">
        <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
      </div>

      {/* Footer / Direitos Autorais */}
      <div className="pointer-events-none absolute bottom-4 w-full text-center z-10">
        <p className="text-xs text-white/50 font-medium">Direitos reservados a Decore 2026 ©</p>
      </div>
    </div>
  );
}

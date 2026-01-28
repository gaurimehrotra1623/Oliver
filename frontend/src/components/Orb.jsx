import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const Orb = ({ state }) => {
  const containerRef = useRef(null);
  const coreRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const ring3Ref = useRef(null);
  const particlesRef = useRef(null);

  useGSAP(() => {
    // Initial setup
    gsap.set([coreRef.current, ring1Ref.current, ring2Ref.current, ring3Ref.current], {
      transformOrigin: '50% 50%'
    });

    const tl = gsap.timeline();

    // Reset animations when state changes
    gsap.killTweensOf([coreRef.current, ring1Ref.current, ring2Ref.current, ring3Ref.current, particlesRef.current]);

    if (state === 'idle') {
      // IDLE STATE: Calm, breathing, slow rotation
      gsap.to(coreRef.current, {
        scale: 1,
        boxShadow: '0 0 60px var(--accent-glow)',
        backgroundColor: '#000',
        duration: 2,
        ease: 'power2.inOut'
      });

      gsap.to(coreRef.current, {
        duration: 4,
        scale: 1.05,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(ring1Ref.current, {
        duration: 20,
        rotation: 360,
        repeat: -1,
        ease: "none",
        border: '1px solid rgba(0, 243, 255, 0.3)',
        scale: 1
      });

      gsap.to(ring2Ref.current, {
        duration: 30,
        rotation: -360,
        repeat: -1,
        ease: "none",
        border: '1px solid rgba(112, 0, 255, 0.2)',
        scale: 1
      });

      gsap.to(ring3Ref.current, {
        duration: 40,
        rotation: 180,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        border: '1px dashed rgba(255, 255, 255, 0.1)',
        scale: 1
      });

    } else if (state === 'listening') {
      // LISTENING STATE: Alert, focus, pulsing
      gsap.to(coreRef.current, {
        scale: 0.8,
        boxShadow: '0 0 80px var(--accent-primary)',
        backgroundColor: 'var(--accent-primary)',
        duration: 0.5
      });

      gsap.to(coreRef.current, {
        duration: 0.8,
        scale: 0.9,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      gsap.to(ring1Ref.current, {
        duration: 2,
        rotation: 360,
        repeat: -1,
        ease: "none",
        borderTopColor: 'var(--accent-primary)',
        borderBottomColor: 'transparent',
        borderLeftColor: 'var(--accent-primary)',
        borderRightColor: 'transparent',
        borderWidth: '2px',
        scale: 1.1
      });

      gsap.to(ring2Ref.current, {
        duration: 3,
        rotation: -360,
        repeat: -1,
        ease: "none",
        border: '1px solid var(--accent-primary)',
        opacity: 0.5,
        scale: 1.2
      });

      gsap.to(ring3Ref.current, {
        scale: 1.5,
        opacity: 0,
        duration: 1,
        repeat: -1,
        ease: "power2.out"
      });

    } else if (state === 'processing') {
      // PROCESSING STATE: Busy, glitchy, rapid movement
      gsap.to(coreRef.current, {
        boxShadow: '0 0 100px var(--accent-secondary)',
        backgroundColor: 'var(--accent-secondary)',
        duration: 0.2
      });

      // Glitch effect on core
      const glitchTl = gsap.timeline({ repeat: -1 });
      glitchTl.to(coreRef.current, { scale: 1.2, duration: 0.1, ease: 'steps(1)' })
        .to(coreRef.current, { scale: 0.8, duration: 0.1, ease: 'steps(1)' })
        .to(coreRef.current, { scale: 1.1, rotation: 10, duration: 0.1 })
        .to(coreRef.current, { scale: 1, rotation: -10, duration: 0.1 });

      gsap.to(ring1Ref.current, {
        duration: 1,
        rotation: 360,
        repeat: -1,
        ease: "none",
        border: '2px solid var(--accent-secondary)',
        borderStyle: 'dashed'
      });

      gsap.to(ring2Ref.current, {
        duration: 1.5,
        rotation: -360,
        repeat: -1,
        ease: "none",
        border: '2px solid #fff',
        opacity: 0.8
      });

    } else if (state === 'speaking') {
      // SPEAKING STATE: Audio reactive simulation, expanding
      gsap.to(coreRef.current, {
        backgroundColor: '#fff',
        boxShadow: '0 0 120px #fff',
        duration: 0.2
      });

      // Simulated voice wave modulation
      gsap.to(coreRef.current, {
        scale: 1.5,
        duration: 0.2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      gsap.to(ring1Ref.current, {
        scale: 2,
        opacity: 0,
        duration: 1,
        repeat: -1,
        ease: "power2.out",
        border: '2px solid #fff'
      });

      gsap.to(ring2Ref.current, {
        scale: 1.5,
        opacity: 0,
        duration: 1.2,
        repeat: -1,
        ease: "power2.out",
        delay: 0.2,
        border: '1px solid var(--accent-primary)'
      });
    }

  }, [state]);

  return (
    <div className="orb-container" ref={containerRef}>
      <div className="orb-ring ring-3" ref={ring3Ref}></div>
      <div className="orb-ring ring-2" ref={ring2Ref}></div>
      <div className="orb-ring ring-1" ref={ring1Ref}></div>
      <div className="orb-core" ref={coreRef}>
        <div className="inner-pulse"></div>
      </div>

      <style>{`
        .orb-container {
          position: relative;
          width: var(--orb-size);
          height: var(--orb-size);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .orb-core {
          width: 50%;
          height: 50%;
          border-radius: 50%;
          background: #000; /* Placeholder, animated by GSAP */
          z-index: 10;
          position: relative;
        }
        
        .inner-pulse {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 100%; height: 100%;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
            mix-blend-mode: overlay;
        }

        .orb-ring {
          position: absolute;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          width: 100%;
          height: 100%;
          box-shadow: 0 0 15px rgba(0,0,0,0.5); /* subtle depth */
        }
      `}</style>
    </div>
  );
};

export default Orb;

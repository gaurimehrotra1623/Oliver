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
  const turbulenceRef = useRef(null);

  useGSAP(() => {
    // Initial setup
    gsap.set([coreRef.current, ring1Ref.current, ring2Ref.current, ring3Ref.current], {
      transformOrigin: '50% 50%'
    });

    const tl = gsap.timeline();

    // Reset animations when state changes
    gsap.killTweensOf([coreRef.current, ring1Ref.current, ring2Ref.current, ring3Ref.current]);

    // Reset filter
    gsap.to(coreRef.current, { filter: 'none', duration: 0.2 });

    if (state === 'idle') {
      // IDLE: Solid pulsing core, slow rotating rings
      gsap.to(coreRef.current, {
        scale: 1,
        backgroundColor: '#00f3ff', // Bright Cyan base
        boxShadow: '0 0 80px rgba(0, 243, 255, 0.6), inset 0 0 40px rgba(255, 255, 255, 0.8)', // Strong inner/outer glow
        duration: 2,
        ease: 'power2.inOut'
      });

      gsap.to(coreRef.current, {
        duration: 3,
        scale: 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(ring1Ref.current, {
        duration: 10,
        rotation: 360,
        repeat: -1,
        ease: "none",
        border: '4px solid rgba(0, 243, 255, 0.4)', // Thicker borders
        scale: 1.2
      });

      gsap.to(ring2Ref.current, {
        duration: 15,
        rotation: -360,
        repeat: -1,
        ease: "none",
        border: '2px solid rgba(112, 0, 255, 0.4)',
        scale: 1.4
      });

    } else if (state === 'listening') {
      // LISTENING: Core turns purple/active, ripple effect
      gsap.to(coreRef.current, {
        scale: 1.2,
        backgroundColor: '#7000ff',
        boxShadow: '0 0 100px rgba(112, 0, 255, 0.8), inset 0 0 60px rgba(255, 255, 255, 0.5)',
        duration: 0.5
      });

      gsap.to(coreRef.current, {
        duration: 0.5,
        scale: 1.15,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      gsap.to(ring1Ref.current, {
        duration: 2,
        rotation: 360,
        repeat: -1,
        ease: "none",
        borderTopColor: '#7000ff',
        borderBottomColor: 'transparent',
        borderLeftColor: '#7000ff',
        borderRightColor: 'transparent',
        borderWidth: '6px',
        scale: 1.3
      });

      gsap.to(ring2Ref.current, {
        duration: 1,
        scale: 1.6,
        opacity: 0,
        border: '4px solid #7000ff',
        repeat: -1,
        ease: "power2.out"
      });

    } else if (state === 'processing') {
      // PROCESSING: Glitch/Search movement
      gsap.to(coreRef.current, {
        scale: 1,
        backgroundColor: '#ff0055', // Alert/Processing color
        boxShadow: '0 0 90px rgba(255, 0, 85, 0.7)',
        duration: 0.2
      });

      gsap.to(ring1Ref.current, {
        duration: 0.5,
        rotation: 360,
        repeat: -1,
        ease: "linear",
        border: '4px dashed #ff0055',
        scale: 1.3
      });

    } else if (state === 'speaking') {
      // SPEAKING: Fluid Watery Effect
      // Apply the SVG filter
      gsap.set(coreRef.current, {
        filter: 'url(#fluid-filter)',
        backgroundColor: '#00f3ff',
        boxShadow: '0 0 100px rgba(0, 243, 255, 0.8)'
      });

      // Animate turbulence to simulate liquid movement
      if (turbulenceRef.current) {
        gsap.to(turbulenceRef.current, {
          attr: { baseFrequency: '0.01 0.02' },
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }

      gsap.to(coreRef.current, {
        scale: 1.3,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(ring1Ref.current, {
        scale: 1.8,
        opacity: 0.5,
        duration: 2,
        repeat: -1,
        border: '2px solid rgba(0, 243, 255, 0.5)',
        ease: "sine.inOut"
      });
    }

  }, [state]);

  return (
    <div className="orb-container" ref={containerRef}>
      {/* SVG Filter Definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="fluid-filter">
          <feTurbulence
            ref={turbulenceRef}
            type="fractalNoise"
            baseFrequency="0.01 0.05"
            numOctaves="3"
            result="warp"
          />
          <feDisplacementMap
            xChannelSelector="R"
            yChannelSelector="G"
            scale="30"
            in="SourceGraphic"
            in2="warp"
          />
        </filter>
      </svg>

      <div className="orb-ring ring-3" ref={ring3Ref}></div>
      <div className="orb-ring ring-2" ref={ring2Ref}></div>
      <div className="orb-ring ring-1" ref={ring1Ref}></div>
      <div className="orb-core" ref={coreRef}></div>

      <style>{`
        .orb-container {
          position: relative;
          width: var(--orb-size);
          height: var(--orb-size);
          display: flex;
          justify-content: center;
          align-items: center;
          /* Filter for "Glow" bleed */
          filter: drop-shadow(0 0 20px rgba(0,0,0,0.5));
        }

        .orb-core {
          width: 60%; /* Larger core */
          height: 60%;
          border-radius: 50%;
          background: #00f3ff;
          z-index: 10;
          position: relative;
          box-shadow: 0 0 60px rgba(0, 243, 255, 0.6); /* Default Fallback */
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
          box-shadow: 0 0 15px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default Orb;

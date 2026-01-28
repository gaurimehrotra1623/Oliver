import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Transcript = ({ messages }) => {
  const containerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) return;

    // Animate the last message with a "decoding" style effect
    const lastMessage = messages[messages.length - 1];
    const element = document.getElementById(`msg-${lastMessage.id}`);

    if (element) {
      // Prepare element
      gsap.set(element, { opacity: 0, x: lastMessage.sender === 'user' ? 20 : -20 });

      const tl = gsap.timeline();

      // Slide in
      tl.to(element, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power3.out"
      });

      // Scroll to bottom smoothly
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          scrollTop: containerRef.current.scrollHeight,
          duration: 0.8,
          ease: "power2.out"
        });
      }
    }
  }, [messages]);

  return (
    <div className="transcript-wrapper">
      <div className="transcript-overlay" ref={containerRef}>
        <div className="transcript-list" ref={listRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={`msg-item ${msg.sender}`}
            >
              <div className="msg-content">
                <span className="msg-role">{msg.sender === 'user' ? 'YOU' : 'OLIVER'}</span>
                <p className="msg-text">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .transcript-wrapper {
            width: 100%;
            max-width: 700px;
            height: 250px;
            margin-top: 3rem;
            position: relative;
            /* Fade out top mask */
            mask-image: linear-gradient(to bottom, transparent, black 20%);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%);
        }
        
        .transcript-overlay {
            width: 100%;
            height: 100%;
            overflow-y: hidden; /* We scroll programmatically */
            position: relative;
        }

        .transcript-list {
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            justify-content: flex-end;
            min-height: 100%;
        }
        
        .msg-item {
            display: flex;
            width: 100%;
            opacity: 0; /* Handled by GSAP */
        }
        
        .msg-item.user {
            justify-content: flex-end;
            text-align: right;
        }
        
        .msg-item.ai {
            justify-content: flex-start;
            text-align: left;
        }
        
        .msg-content {
            max-width: 85%;
            position: relative;
        }
        
        .msg-role {
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.15rem;
            text-transform: uppercase;
            display: block;
            margin-bottom: 0.4rem;
            opacity: 0.6;
            font-family: 'Courier New', monospace;
        }
        
        .user .msg-role { color: var(--accent-secondary); }
        .ai .msg-role { color: var(--accent-primary); }
        
        .msg-text {
            font-size: 1.1rem;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.95);
            font-weight: 300;
            margin: 0;
            text-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        
        /* Decorative line for AI */
        .ai .msg-content::before {
            content: '';
            position: absolute;
            left: -1rem;
            top: 0.5rem;
            bottom: 0.5rem;
            width: 2px;
            background: var(--accent-primary);
            box-shadow: 0 0 10px var(--accent-primary);
            opacity: 0.5;
        }
        
        /* Decorative line for User */
        .user .msg-content::after {
            content: '';
            position: absolute;
            right: -1rem;
            top: 0.5rem;
            bottom: 0.5rem;
            width: 2px;
            background: var(--accent-secondary);
            box-shadow: 0 0 10px var(--accent-secondary);
            opacity: 0.5;
        }

      `}</style>
    </div>
  );
};

export default Transcript;

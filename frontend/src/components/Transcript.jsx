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
            width: 700px;
            max-width: 90vw;
            height: 300px;
            min-height: 300px;
            max-height: 300px;
            flex-shrink: 0;
            margin-top: 1rem;
            position: relative;
            
            /* Glass Panel Look */
            background: rgba(10, 20, 30, 0.6);
            border: 1px solid rgba(0, 243, 255, 0.4);
            border-radius: 12px;
            box-shadow: 
                0 0 15px rgba(0, 243, 255, 0.1),
                inset 0 0 40px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            
            /* Inner glow accent on top */
            background-image: linear-gradient(to bottom, rgba(0, 243, 255, 0.1) 0%, transparent 40%);
        }
        
        .transcript-overlay {
            width: 100%;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
            padding: 1.5rem;
            box-sizing: border-box;

            /* Scrollbar Styling */
            scrollbar-width: thin;
            scrollbar-color: var(--accent-primary) rgba(0,0,0,0.3);
        }

        .transcript-overlay::-webkit-scrollbar {
            width: 8px;
        }

        .transcript-overlay::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
        }

        .transcript-overlay::-webkit-scrollbar-thumb {
            background: var(--accent-primary);
            border-radius: 4px;
        }

        .transcript-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            justify-content: flex-start;
            min-height: min-content;
        }
        
        .msg-item {
            display: flex;
            width: 100%;
            opacity: 0;
            flex-direction: column; 
            gap: 0.3rem;
            overflow: hidden; /* Ensure content doesn't burst out */
        }
        
        .msg-item.user {
            align-items: flex-start;
        }
        
        .msg-item.ai {
            align-items: flex-start;
        }
        
        .msg-content {
            max-width: 100%;
            position: relative;
            padding-left: 1rem;
            border-left: 3px solid transparent; 
        }
        
        /* Accents based on sender */
        .user .msg-content {
             border-left-color: var(--accent-primary); 
        }
        
        .ai .msg-content {
             border-left-color: transparent; 
             padding-left: 0; 
             margin-top: 0.5rem;
        }
        
        .msg-role {
            display: none; 
        }
        
        .msg-text {
            font-family: var(--font-body);
            font-size: 1.2rem;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 400;
            margin: 0;
            text-shadow: 0 0 5px rgba(0,0,0,0.5);
            word-wrap: break-word; /* Ensure long words wrap */
            word-break: break-word;
        }
        
        /* Specific coloring for message text */
        .user .msg-text {
            font-size: 1.3rem;
            color: var(--accent-primary); /* Cyan question */
            font-weight: 500;
        }
        
        .ai .msg-text {
            font-size: 1.1rem;
            color: #ccc; /* Subtler answer */
        }

      `}</style>
    </div>
  );
};

export default Transcript;

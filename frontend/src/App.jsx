import React, { useState, useRef, useEffect } from 'react';
import Orb from './components/Orb';
import './styles/main.css';

function App() {
  const [status, setStatus] = useState('idle');
  const statusRef = useRef('idle');

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioRef = useRef(new Audio());

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    statusRef.current = newStatus;
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        if (statusRef.current === 'listening') {
          handleAudioUpload(audioBlob);
        } else {
          console.log("Recording stopped but status was not listening (cancelled).");
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      updateStatus('listening');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
      updateStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
  };

  const handleAudioUpload = async (audioBlob) => {
    updateStatus('processing');

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/process-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.audio_base64) {
        updateStatus('speaking');
        try {
          const audioSrc = `data:audio/wav;base64,${data.audio_base64}`;
          const newAudio = new Audio(audioSrc);
          audioRef.current = newAudio;

          await newAudio.play();

          newAudio.onended = () => {
            updateStatus('idle');
          };
        } catch (playError) {
          console.error("Audio playback error:", playError);
          updateStatus('idle');
        }
      } else {
        updateStatus('idle');
      }

    } catch (error) {
      console.error("Error processing audio:", error);
      updateStatus('idle');
    }
  };

  const handleOrbClick = () => {
    if (statusRef.current === 'idle') {
      startRecording();
    } else if (statusRef.current === 'listening') {
      stopRecording();
    } else {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      updateStatus('idle');
    }
  };

  return (
    <div className="app-container">
      <div className="background-grid"></div>
      <div className="background-glow"></div>

      <div className="content">
        <div className="header-container fade-in">
          <h1 className="title">OLIVER</h1>
          <p className="subtitle">YOUR PERSONAL VOICE ASSISTANT</p>
        </div>

        <div className="status-text fade-in" style={{ animationDelay: '0.2s' }}>
          <span className="status-indicator"></span>
          <span className="status-bracket">[</span>
          {status === 'idle' && "SYSTEM READY"}
          {status === 'listening' && "AWAITING INPUT"}
          {status === 'processing' && "PROCESSING DATA"}
          {status === 'speaking' && "AUDIO OUTPUT"}
          <span className="status-bracket">]</span>
        </div>

        <h2 className="instruction-text fade-in" style={{ animationDelay: '0.3s' }}>
          TAP THE ORB TO START SPEAKING
        </h2>

        <div className="orb-wrapper fade-in" style={{ animationDelay: '0.4s' }} onClick={handleOrbClick}>
          <Orb state={status} />
        </div>
      </div>
    </div>
  );
}

export default App;

import sounddevice as sd
import webrtcvad
import queue
import time
import numpy as np
import noisereduce as nr

# ---------------- CONFIG ----------------
SAMPLE_RATE = 16000
FRAME_MS = 30
FRAME_SIZE = int(SAMPLE_RATE * FRAME_MS / 1000)
VAD_MODE = 3
PAUSE_THRESHOLD = 0.8  # seconds
# ----------------------------------------

vad = webrtcvad.Vad(VAD_MODE)
audio_q = queue.Queue()

def audio_callback(indata, frames, time_info, status):
    audio_q.put(bytes(indata))

stream = sd.RawInputStream(
    samplerate=SAMPLE_RATE,
    blocksize=FRAME_SIZE,
    dtype="int16",
    channels=1,
    callback=audio_callback
)

speech_frames = []
last_speech_time = time.time()

stream.start()
print("🎙 Speak into the mic. Ctrl+C to stop.\n")

try:
    while True:
        frame = audio_q.get()
        is_speech = vad.is_speech(frame, SAMPLE_RATE)

        if is_speech:
            print("🎤 SPEECH")
            speech_frames.append(frame)
            last_speech_time = time.time()

        else:
            print("🤫 silence")

            if speech_frames and (time.time() - last_speech_time) > PAUSE_THRESHOLD:
                print("\n🟢 UTTERANCE COMPLETE")

                audio_bytes = b"".join(speech_frames)
                audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32)

                print("🧹 Removing noise...")
                clean_audio = nr.reduce_noise(
                    y=audio_np,
                    sr=SAMPLE_RATE
                )

                print(f"✅ Denoising done | Samples: {len(clean_audio)}\n")

                speech_frames = []

except KeyboardInterrupt:
    print("\nStopping...")

finally:
    stream.stop()
    stream.close()

import sounddevice as sd
import webrtcvad
import queue
import time
import numpy as np
import soundfile as sf
import threading
from groq import Groq
import subprocess
from dotenv import load_dotenv
import os
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env")
SAMPLE_RATE = 16000
FRAME_MS = 30
FRAME_SIZE = int(SAMPLE_RATE * FRAME_MS / 1000)
VAD_MODE = 3
PAUSE_THRESHOLD = 0.8
MIN_SPEECH_DURATION = 0.2
MAX_SPEECH_DURATION = 10.0
MIN_VOLUME_DB = -55
MAX_VOLUME_DB = -20
MIN_AVG_VOLUME_DB = -45
SPEECH_ENERGY_RATIO = 0.35
CLICK_PEAK_RATIO = 4.0
groq_client = Groq(api_key=GROQ_API_KEY)
vad = webrtcvad.Vad(VAD_MODE)
audio_q = queue.Queue()
tts_process = None
tts_lock = threading.Lock()
assistant_speaking = False
print("Oliver is ready. Start talking.")
print("=" * 50)

def audio_callback(indata, frames, time_info, status):
    audio_q.put(bytes(indata))

def calculate_db(audio_np):
    rms = np.sqrt(np.mean(audio_np ** 2))
    return 20 * np.log10(rms / 32768.0) if rms > 0 else -100

def simple_noise_gate(audio_np, threshold_db=-55):
    db = 20 * np.log10(np.abs(audio_np) / 32768.0 + 1e-10)
    return audio_np * (db > threshold_db)

def has_speech_characteristics(audio_np):
    fft = np.fft.rfft(audio_np)
    freqs = np.fft.rfftfreq(len(audio_np), 1 / SAMPLE_RATE)
    mags = np.abs(fft)
    speech_energy = np.sum(mags[(freqs >= 85) & (freqs <= 3000)])
    total_energy = np.sum(mags)
    return (speech_energy / (total_energy + 1e-6)) > SPEECH_ENERGY_RATIO

def is_click(audio_np):
    env = np.abs(audio_np)
    return len(env) > 10 and np.max(env) / (np.mean(env) + 1e-6) > CLICK_PEAK_RATIO

def is_valid_speech_frame(frame_bytes):
    audio_np = np.frombuffer(frame_bytes, dtype=np.int16).astype(np.float32)
    if is_click(audio_np):
        return False
    db = calculate_db(audio_np)
    if db < MIN_VOLUME_DB or db > MAX_VOLUME_DB:
        return False
    if not has_speech_characteristics(audio_np):
        return False
    avg_energy = np.mean(np.abs(audio_np))
    avg_db = 20 * np.log10(avg_energy / 32768.0 + 1e-10)
    if avg_db < MIN_AVG_VOLUME_DB:
        return False
    return True

def transcribe_audio(audio_np):
    print("Transcribing...")
    audio_np = simple_noise_gate(audio_np)
    audio_norm = audio_np / 32768.0
    temp_file = "temp.wav"
    sf.write(temp_file, audio_norm, SAMPLE_RATE)
    try:
        with open(temp_file, "rb") as f:
            text = groq_client.audio.transcriptions.create(
                file=f,
                model="whisper-large-v3-turbo",
                language="en",
                response_format="text"
            ).strip()
        print(f"User: {text}")
        return text
    except Exception as e:
        print("STT Error:", e)
        return ""
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

def get_llm_response(user_text):
    print("Thinking...")
    res = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.9,
        max_tokens=80,
        messages=[
            {
                "role": "system",
                "content": (
                    "You're Oliver, a chill voice assistant. "
                    "Talk casually, naturally, and keep replies short."
                )
            },
            {"role": "user", "content": user_text}
        ]
    )
    reply = res.choices[0].message.content
    print(f"Oliver: {reply}")
    return reply


speech_frames = []
is_recording = False
last_speech_time = time.time()
speech_start_time = None

stream = sd.RawInputStream(
    samplerate=SAMPLE_RATE,
    blocksize=FRAME_SIZE,
    dtype="int16",
    channels=1,
    callback=audio_callback
)

stream.start()

try:
    while True:
        frame = audio_q.get()
        frame_np = np.frombuffer(frame, dtype=np.int16).astype(np.float32)
        frame_bytes = frame_np.astype(np.int16).tobytes()
        if assistant_speaking:
            continue
        if vad.is_speech(frame_bytes, SAMPLE_RATE):
            if not is_valid_speech_frame(frame_bytes):
                continue
            if not is_recording:
                is_recording = True
                speech_frames = []
                speech_start_time = time.time()
                print("Listening...")
            speech_frames.append(frame_np)
            last_speech_time = time.time()
        else:
            if is_recording and time.time() - last_speech_time > PAUSE_THRESHOLD:
                duration = time.time() - speech_start_time
                if MIN_SPEECH_DURATION <= duration <= MAX_SPEECH_DURATION:
                    audio = np.concatenate(speech_frames)
                    threading.Thread(

                        args=(audio,),
                        daemon=True
                    ).start()
                is_recording = False
                speech_frames = []
except KeyboardInterrupt:
    print("\n Exiting...")
finally:
    stream.stop()
    stream.close()
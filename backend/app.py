import os
import io
import time
import base64
import numpy as np
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

load_dotenv(dotenv_path="backend/.env")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in backend/.env")

groq_client = Groq(api_key=GROQ_API_KEY)

class TextRequest(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "Oliver AI Backend is running"}

@app.post("/api/process-audio")
async def process_audio(file: UploadFile = File(...)):
    """
    Receives an audio file (blob), transcribes it, queries LLM, generates TTS, 
    and returns the audio response + text.
    """
    try:
        start_time = time.time()
        print(f"[{start_time}] Received audio request")


        audio_bytes = await file.read()
        
        temp_filename = f"temp_{int(time.time()*1000)}.wav"
        with open(temp_filename, "wb") as f:
            f.write(audio_bytes)

        user_text = ""
        try:
            with open(temp_filename, "rb") as f:
                user_text = groq_client.audio.transcriptions.create(
                    file=f,
                    model="whisper-large-v3-turbo",
                    language="en",
                    response_format="text"
                ).strip()
        finally:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

        print(f"Transcribed: {user_text}")

        if not user_text or len(user_text.strip()) < 2:
            return JSONResponse(content={"text": "", "audio": None})

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0.9,
            max_tokens=150,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You're Oliver, a chill voice assistant. "
                        "Talk casually, naturally, and keep replies short and concise."
                    )
                },
                {"role": "user", "content": user_text}
            ]
        )
        ai_text = completion.choices[0].message.content
        print(f"AI Response: {ai_text}")

        response_audio_content = None
        try:
            tts_response = groq_client.audio.speech.create(
                model="canopylabs/orpheus-v1-english",
                voice="troy", 
                input=ai_text,
                response_format="wav"
            )

            temp_tts = f"temp_tts_{int(time.time()*1000)}.wav"
            tts_response.write_to_file(temp_tts)
            
            with open(temp_tts, "rb") as f:
                response_audio_content = f.read()
                
            if os.path.exists(temp_tts):
                os.remove(temp_tts)
                
        except Exception as e:
            print(f"TTS Error: {e}")
        response_data = {
            "user_text": user_text,
            "ai_text": ai_text,
            "audio_base64": base64.b64encode(response_audio_content).decode('utf-8') if response_audio_content else None
        }
        
        return JSONResponse(content=response_data)

    except Exception as e:
        print(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

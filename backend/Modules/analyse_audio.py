# analyse_audio.py
import os
import subprocess
from groq import Groq
import httpx

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key, timeout=httpx.Timeout(60.0))

def transcrire_audio():
    video_file = os.path.join(os.getcwd(), "video_escalier.mp4")
    audio_file = os.path.join(os.getcwd(), "audio.wav")

    print("🎧 Conversion de la vidéo en audio WAV...")
    subprocess.run(["ffmpeg", "-y", "-i", video_file, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", audio_file], check=True)
    print("✅ Conversion réussie.")

    print("🧠 Transcription audio...")
    with open(audio_file, "rb") as file:
        response = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=file,
            language="fr"
        )

    texte = response.text
    print("\n🗒️ Transcription :\n", texte)

    with open("transcription_audio.txt", "w", encoding="utf-8") as f:
        f.write(texte)

    return texte

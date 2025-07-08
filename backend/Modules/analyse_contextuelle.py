# analyse_contextuelle.py
import requests, json
import os

API_KEY = os.getenv("NVAPI_KEY")
MODEL = "mistralai/mistral-small-24b-instruct"

def lire_fichiers():
    with open("descriptions_par_image.txt", "r", encoding="utf-8") as f:
        descriptions = f.read()
    with open("resume_video.txt", "r", encoding="utf-8") as f:
        resume = f.read()
    with open("metadata.json", "r", encoding="utf-8") as f:
        metadata = json.load(f)
    # Lecture optionnelle du fichier audio
    try:
        with open("transcription_audio.txt", "r", encoding="utf-8") as f:
            audio = f.read()
    except FileNotFoundError:
        audio = ""
    return descriptions, resume, metadata, audio

def generer_rapport(transcription_audio):
    descriptions, resume, metadata, _ = lire_fichiers()

    prompt = (
        f"La vidéo '{metadata['video_file']}' contient {metadata['frames_extraites']} images clés.\n"
        f"Descriptions :\n{descriptions}\n\n"
        f"Résumé vidéo :\n{resume}\n\n"
        f"Transcription audio :\n{transcription_audio}\n\n"
        "Analyse la situation et identifie le type d'incident (ex : agression, incendie, etc.). "
        "Indique les services d'urgence à alerter (police, pompiers, etc.). "
        "Propose 1 ou 2 recommandations immédiates."
    )

    headers = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 700,
        "temperature": 0.4,
        "top_p": 0.8,
        "stream": False
    }

    response = requests.post("https://integrate.api.nvidia.com/v1/chat/completions", headers=headers, json=payload)
    if not response.ok:
        raise Exception(f"Erreur API : {response.status_code} - {response.text}")

    rapport = response.json()["choices"][0]["message"]["content"]
    with open("analyse_contextuelle.txt", "w", encoding="utf-8") as f:
        f.write(rapport)

    print("\n=== RAPPORT D'INCIDENT ===\n", rapport)
    return rapport

import cv2
import os
import base64
import requests
import numpy as np
import time
import json
from datetime import datetime

# === CONFIGURATION ===
API_KEY = os.getenv("NVAPI_KEY")
VIDEO_PATH = "video_escalier.mp4"
FRAMES_DIR = "frames"
MODEL = "mistralai/mistral-small-3.1-24b-instruct-2503"
PROMPT = "Décris cette image extraite d'une vidéo de surveillance, en français, de manière très détaillée."
DIFF_THRESHOLD = 7
MIN_INTERVAL = 7

#DIFF_THRESHOLD = 30.0
#MIN_INTERVAL = 30

# === EXTRACTION DES FRAMES CLÉS ===
def extract_key_frames(video_path, output_dir, diff_threshold=30.0, min_interval=30):
    if os.path.exists(output_dir):
        for f in os.listdir(output_dir):
            os.remove(os.path.join(output_dir, f))
    else:
        os.makedirs(output_dir)

    cap = cv2.VideoCapture(video_path)

    prev_gray = None
    frame_count = 0
    saved = 0
    last_saved_frame = -min_interval

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev_gray is not None:
            diff = cv2.absdiff(gray, prev_gray)
            score = np.mean(diff)

            if score > diff_threshold and (frame_count - last_saved_frame) >= min_interval:
                path = os.path.join(output_dir, f"frame_{saved:03d}.png")
                cv2.imwrite(path, frame)
                saved += 1
                last_saved_frame = frame_count

        else:
            path = os.path.join(output_dir, f"frame_{saved:03d}.png")
            cv2.imwrite(path, frame)
            saved += 1
            last_saved_frame = frame_count

        prev_gray = gray
        frame_count += 1

    cap.release()
    print(f"[INFO] {saved} frames extraites avec variation de contenu.")
    return saved

# === APPEL API NVIDIA POUR DESCRIPTION ===
def describe_image(image_path):
    with open(image_path, "rb") as img_file:
        image_data = base64.b64encode(img_file.read()).decode("utf-8")
        base64_image = f"data:image/png;base64,{image_data}"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Accept": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {"type": "image_url", "image_url": {"url": base64_image}}
                ]
            }
        ],
        "max_tokens": 512,
        "temperature": 0.3,
        "top_p": 0.8,
        "stream": False
    }

    try:
        response = requests.post("https://integrate.api.nvidia.com/v1/chat/completions", headers=headers, json=payload)
        if response.ok:
            return response.json()["choices"][0]["message"]["content"]
        else:
            return f"[ERREUR] {response.status_code} : {response.text}"
    except Exception as e:
        return f"[EXCEPTION] {str(e)}"

# === MAIN ===
def main():
    print("[INFO] Début de l'analyse vidéo...")
    total_saved = extract_key_frames(VIDEO_PATH, FRAMES_DIR, DIFF_THRESHOLD, MIN_INTERVAL)

    descriptions = []
    image_files = sorted(os.listdir(FRAMES_DIR))

    for i, img in enumerate(image_files):
        path = os.path.join(FRAMES_DIR, img)
        print(f"[{i+1}/{len(image_files)}] Traitement de : {img}")
        desc = describe_image(path)
        print(desc, "\n")
        descriptions.append(f"{img} :\n{desc}\n")
        time.sleep(1.5)

    with open("descriptions_par_image.txt", "w", encoding="utf-8") as f:
        f.write("\n\n".join(descriptions))

    # Résumé global
    resume_prompt = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": f"Voici les descriptions détaillées d'une vidéo de surveillance :\n\n{''.join(descriptions)}\n\nFais un résumé global clair en français."
            }
        ],
        "max_tokens": 512,
        "temperature": 0.5,
        "top_p": 0.9,
        "stream": False
    }

    print("[INFO] Génération du résumé global...")
    headers = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}
    response = requests.post("https://integrate.api.nvidia.com/v1/chat/completions", headers=headers, json=resume_prompt)

    if response.ok:
        summary = response.json()["choices"][0]["message"]["content"]
        print("\n=== RÉSUMÉ GLOBAL ===\n")
        print(summary)
        with open("resume_video.txt", "w", encoding="utf-8") as f:
            f.write(summary)
    else:
        summary = "[ERREUR] Résumé non généré."
        print(summary)

    metadata = {
        "video_file": VIDEO_PATH,
        "frames_extraites": len(image_files),
        "timestamp": datetime.now().isoformat()
    }

    with open("metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

if __name__ == "__main__":
    main()


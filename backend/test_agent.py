import os
from Modules.agent_decisionel import run_agent

def lire_resume_video():
    """
    Lit uniquement le fichier resume_video.txt du dossier data.
    Returns:
        str: Contenu du résumé vidéo
    """
    data_dir = "data"
    resume_path = os.path.join(data_dir, "resume_video.txt")
    if not os.path.exists(resume_path):
        print(f"❌ Le fichier {resume_path} n'existe pas. Lancez d'abord run_analyses.py")
        return None
    with open(resume_path, "r", encoding="utf-8") as f:
        return f.read()

def main():
    print("🤖 Démarrage du test de l'agent décisionnel...")
    resume = lire_resume_video()
    if not resume:
        print("❌ Impossible de récupérer le résumé vidéo.")
        return
    print(f"\n📊 Résumé vidéo récupéré ({len(resume)} caractères)")
    print("=" * 60)
    run_agent(resume)

if __name__ == "__main__":
    main() 
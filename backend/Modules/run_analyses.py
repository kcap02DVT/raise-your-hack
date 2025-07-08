import sys
import os
from contextlib import redirect_stdout
from io import StringIO

# Importer les fonctions depuis les scripts existants
from Modules.analyse_video import main as analyse_video_main
from Modules.analyse_audio import transcrire_audio
from Modules.analyse_contextuelle import generer_rapport

def main(video_path: str = "video_escalier.mp4"):
    """
    Exécute le pipeline complet d'analyse sur une vidéo.
    
    Args:
        video_path (str): Chemin vers le fichier vidéo à analyser
        
    Returns:
        str: Le rapport d'analyse complet
    """
    # Créer le dossier data s'il n'existe pas
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(data_dir, exist_ok=True)
    
    # Changer le répertoire de travail vers data
    original_cwd = os.getcwd()
    os.chdir(data_dir)
    
    # Capturer la sortie dans une string
    output_buffer = StringIO()
    
    with redirect_stdout(output_buffer):
        print("=== ÉTAPE 1 : ANALYSE VIDÉO ===\n")
        # Modifier temporairement le chemin vidéo dans analyse_video
        import Modules.analyse_video as analyse_video
        original_video_path = analyse_video.VIDEO_PATH
        analyse_video.VIDEO_PATH = os.path.join(original_cwd, video_path)
        analyse_video_main()
        analyse_video.VIDEO_PATH = original_video_path  # Restaurer
        print("analyse_video module:", analyse_video)
        print("analyse_video path:", analyse_video.__file__)

        #print("\n=== ÉTAPE 2 : TRANSCRIPTION AUDIO ===\n")
        # Modifier temporairement le chemin vidéo dans analyse_audio
        #import Modules.analyse_audio as analyse_audio
        #original_audio_video = os.path.join(os.getcwd(), "video_escalier.mp4")
        #analyse_audio.video_file = os.path.join(original_cwd, video_path)
        #transcription = transcrire_audio()
        #analyse_audio.video_file = original_audio_video  # Restaurer

        print("\n=== ÉTAPE 2 : (audio désactivé) ===\n")
        transcription = ""

        print("\n=== ÉTAPE 3 : ANALYSE CONTEXTUELLE ===\n")
        generer_rapport(transcription)
    
    # Récupérer le contenu complet
    resultat_complet = output_buffer.getvalue()
    
    # Sauvegarder dans le dossier data
    with open("analyses.txt", "w", encoding="utf-8") as f:
        f.write(resultat_complet)
    
    # Restaurer le répertoire de travail original
    os.chdir(original_cwd)
    
    return resultat_complet

if __name__ == "__main__":
    # Utilisation en ligne de commande
    video_path = sys.argv[1] if len(sys.argv) > 1 else "video_escalier.mp4"
    resultat = main(video_path)
    print(resultat)

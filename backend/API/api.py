from fastapi import APIRouter, UploadFile, File, HTTPException, FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import shutil
import sys
from typing import Optional
from dotenv import load_dotenv
load_dotenv()

# Ajouter le répertoire parent au PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importer les fonctions depuis les modules existants
from Modules.run_analyses import main as run_analyses_main
from test_agent import lire_resume_video
from Modules.agent_decisionel import run_agent

router = APIRouter()

@router.post("/envoyer-flux")
async def envoyer_flux(video: UploadFile = File(...)):
    """
    Route pour envoyer une vidéo et lancer l'analyse complète.
    """
    try:
        # Vérifier que c'est bien un fichier vidéo
        if not video.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="Le fichier doit être une vidéo")
        
        # Créer un fichier temporaire pour la vidéo
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            shutil.copyfileobj(video.file, temp_file)
            temp_path = temp_file.name
        
        # Lancer l'analyse complète
        resultat = run_analyses_main(temp_path)
        
        # Nettoyer le fichier temporaire
        os.unlink(temp_path)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Analyse vidéo terminée avec succès",
                "fichiers_generes": [
                    "data/descriptions_par_image.txt",
                    "data/resume_video.txt", 
                    "data/transcription_audio.txt",
                    "data/analyse_contextuelle.txt",
                    "data/metadata.json"
                ],
                "taille_analyse": len(resultat)
            }
        )
        
    except Exception as e:
        # Nettoyer en cas d'erreur
        if 'temp_path' in locals():
            try:
                os.unlink(temp_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")

@router.post("/gerer-alerte")
async def gerer_alerte():
    """
    Route pour lancer l'agent décisionnel à partir du résumé vidéo.
    """
    try:
        # Lire le résumé vidéo
        resume = lire_resume_video()
        
        if not resume:
            raise HTTPException(
                status_code=404, 
                detail="Aucun résumé vidéo trouvé. Lancez d'abord /envoyer-flux"
            )
        
        # Capturer la sortie de l'agent pour la retourner
        import io
        import sys
        from contextlib import redirect_stdout
        
        # Capturer la sortie de l'agent
        output_buffer = io.StringIO()
        with redirect_stdout(output_buffer):
            run_agent(resume)
        
        agent_output = output_buffer.getvalue()
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Agent décisionnel exécuté",
                "taille_resume": len(resume),
                "sortie_agent": agent_output
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'exécution de l'agent: {str(e)}")

# Routes existantes (gardées pour compatibilité)
@router.post("/extraire-audio")
def extraire_audio():
    pass

@router.post("/traiter-audio-stt")
def traiter_audio_stt():
    pass

@router.post("/traiter-flux-video")
def traiter_flux_video():
    pass

@router.get("/retourner-detection")
def retourner_detection():
    pass

# Créer l'application FastAPI
app = FastAPI(title="Panamia API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
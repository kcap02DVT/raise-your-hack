from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.tools import tool
import os
from typing import TypedDict, List, Optional
from .alert import send_alert_via_twilio
from dotenv import load_dotenv
from typing import TypedDict, List, Optional


load_dotenv()
class AgentState(TypedDict):
    input: str
    services: Optional[List[str]]
    generated_message: Optional[str]
    logs: Optional[List[str]]
    output: Optional[str]
    error: Optional[str]
# --- OUTILS ---

@tool
def contacter_gendarmerie(message_a_transmettre: str) -> str:
    """
    À utiliser pour contacter la Gendarmerie en cas de vol, agression, cambriolage,
    disparition, menace, ou tout autre trouble à l'ordre public nécessitant une intervention des forces de l'ordre.
    """
    print("[Outil] Décision de contacter la GENDARMERIE.")

    recipient_number = os.getenv("GENDARMERIE_PHONE_NUMBER")
    message_sms = f" ALERTE GENDARMERIE ‼\n\n{message_a_transmettre}"
    return send_alert_via_twilio(message_sms, recipient_number)
    

@tool
def contacter_secours(message_a_transmettre: str) -> str:
    """
    À utiliser pour contacter les Secours (SAMU) en cas d'accident de la route,
    incendie, urgence médicale (blessure grave, malaise), ou toute situation de péril imminent pour une personne.
    """
    print("[Outil] Décision de contacter le  SAMU.")
    
    recipient_number = os.getenv("SAMU_PHONE_NUMBER")
    message_sms = f"Allerte SAMU\n\n{message_a_transmettre}"
    return send_alert_via_twilio(message_sms, recipient_number)

@tool
def contacter_pompiers(message_a_transmettre: str) -> str:
    """
    À utiliser pour contacter les Pompiers en cas d'incendie, fuite de gaz, inondation,
    ou tout autre incident nécessitant une intervention des services de secours.
    """
    print("[Outil] Décision de contacter les POMPIERS.")
    
    recipient_number = os.getenv("POMPIERS_PHONE_NUMBER")
    message_sms = f"Alerte Pompiers\n\n{message_a_transmettre}"
    return send_alert_via_twilio(message_sms, recipient_number)

@tool
def contacter_police(message_a_transmettre: str) -> str:
    """
    À utiliser pour contacter la Police en cas de trouble à l'ordre public, manifestation,
    ou tout autre incident nécessitant une intervention policière.
    """
    print("[Outil] Décision de contacter la POLICE.")
    
    recipient_number = os.getenv("POLICE_PHONE_NUMBER")
    message_sms = f"Alerte police\n\n{message_a_transmettre}"
    return send_alert_via_twilio(message_sms, recipient_number)

TOOLS = {
    "Gendarmerie": contacter_gendarmerie,
    "Secours": contacter_secours,
    "Pompiers": contacter_pompiers,
    "Police": contacter_police,
    
}

def analyse_message(state: AgentState) -> AgentState:
    """Analyse le message initial pour décider quels services appeler."""
    message = state["input"]
    print(f" Analyse du message : '{message}'")
    
    # ✅ FIX: Utilisation de os.getenv pour la clé API
    llm = ChatGroq(
        temperature=0,
        model_name="llama3-70b-8192",
        groq_api_key=""
    )

    system_prompt = """
Tu es un agent répartiteur d'urgence. Analyse le message utilisateur et renvoie une liste Python des services à contacter.
Les services possibles sont : ["Gendarmerie", "Secours", "Pompiers", "Police"].

Ta réponse DOIT être uniquement une liste Python valide. Si aucun service ne correspond, renvoie une liste vide [].

Exemples de réponses valides :
["Pompiers"]
["Gendarmerie", "Police"]
["Secours"]
[]
    """
    
    prompt = f"{system_prompt}\n\nMessage utilisateur : {message}"
    
    try:
        result = llm.invoke(prompt)
        raw_output = result.content
        #print(f"   Réponse brute du LLM : {raw_output}")
        
        services = eval(raw_output)
        if not isinstance(services, list):
            raise ValueError("La sortie du LLM n'est pas une liste.")
        
        
        

    except Exception as e:
        print(f"    Erreur lors de l'analyse LLM : {e}")
    
        return {"error": "Impossible d'interpréter la réponse du modèle de langage."}
    
    message_generation_prompt = """
    **Rôle** : Rédacteur d'alertes d'urgence.
**Objectif** : Rédiger un message SMS concis et factuel à partir de la description d'un incident fournie.
**Instructions** :
1.  Extraire uniquement les faits essentiels : nature de l'incident, lieu si mentionné, et toute information critique.
2.  Le message doit être direct, sans introduction, salutation ou conclusion.
3.  Le ton doit être neutre et informatif
    """
    try:
        prompt_generation = f"{message_generation_prompt}\n\nMessage utilisateur : \"{message}\"\n\nMessage SMS à générer :"
        result_generation = llm.invoke(prompt_generation)
        generated_message = result_generation.content.strip()
        print(f"   Message généré : {generated_message}")
        return {"services": services, "generated_message": generated_message}

    except Exception as e:
        return {"error": f"Impossible de générer le message d'alerte: {e}"}


def appel_services(state: AgentState) -> AgentState:
    """Appelle les outils correspondants aux services identifiés."""
    services = state.get("services", [])
    message_to_send = state.get("generated_message")
    logs = []
    
    if not services:
        logs.append("Aucun service d'urgence à contacter dans ce cas.")
        return {"logs": logs}


    if not message_to_send:
        return {"error": "Le message à envoyer n'a pas été généré."}

    print(f" Appel des services : {services}")
    for service in services:
        outil = TOOLS.get(service)
        if outil:
            try:
              
                response = outil.invoke({"message_a_transmettre":message_to_send})
                logs.append(f"[{service}]  {response}")
            except Exception as e:
                logs.append(f"[{service}]  Erreur lors de l'appel de l'outil : {str(e)}")
        else:
            logs.append(f"[{service}]  Outil inconnu.")
            
    return {"logs": logs}

def handle_error(state: AgentState) -> AgentState:
    """Gère les cas d'erreur et termine le graphe."""
    error = state.get("error", "Erreur inconnue.")
    print(f"\n ERREUR DANS LE PROCESSUS : {error}")
    return {"output": f"Échec du traitement : {error}"}



workflow = StateGraph(AgentState)

# Ajout des nœuds
workflow.add_node("Analyse", analyse_message)
workflow.add_node("Appel", appel_services)
workflow.add_node("Erreur", handle_error)

# Définition de la logique de routage
def decider_prochaine_etape(state: AgentState):
    """Route le flux vers l'erreur ou vers l'appel des services."""
    if "error" in state and state["error"]:
        return "Erreur"
    return "Appel"

# Définition du flux de travail
workflow.set_entry_point("Analyse")
workflow.add_conditional_edges(
    "Analyse",
    decider_prochaine_etape,
    {"Appel": "Appel", "Erreur": "Erreur"}
)
workflow.add_edge("Appel", END)
workflow.add_edge("Erreur", END)

# Compilation du graphe
app_graph = workflow.compile()


def run_agent(message: str):
    """Fonction pour lancer un test avec un message donné."""
    print("\n" + "="*60)
    print(f"Message utilisateur : {message}")
    print("="*60)
    
    final_state = app_graph.invoke({"input": message})
    
    print("-" * 60)
    print(f"Agent : {final_state.get('output', 'Aucune sortie finale.')}")
    print("="*60)

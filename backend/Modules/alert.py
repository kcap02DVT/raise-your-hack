import os
from twilio.rest import Client
def send_alert_via_twilio(message_body: str, recipient_number: str) -> str:
    """
    Fonction centralisée pour envoyer un SMS via l'API Twilio.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not all([account_sid, auth_token, twilio_number, recipient_number]):
        return "Erreur de configuration Twilio ou numéro destinataire manquant."

    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=message_body,
            from_=twilio_number,
            to=recipient_number
        )
        return f"SMS envoyé avec succès à {recipient_number} (SID: {message.sid})."
    except Exception as e:
        return f"Erreur lors de l'envoi du SMS à {recipient_number}: {e}"
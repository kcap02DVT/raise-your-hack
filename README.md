# 🚀 Front-End Project

A modern front-end setup using **React**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## ✅ Requirements

Before you begin, ensure you have the following installed:

[Node.js](https://nodejs.org/) (v16+ recommended)  
  Check with: node -v
[npm](https://www.npmjs.com/) (v8+ recommended)  
  Check with: npm -v

---

## 📦 Installation

Clone the repository and install dependencies:

bash
git clone https://github.com/your-username/your-repo.git
cd frontend
npm install


⸻

▶️ Start the App

Run the development server with:

npm start


# Backend
# Panamia API

**A FastAPI-based API for automated surveillance video analysis, summary generation, and smart alert management.**

---

## 🚀 Main Features

- **Upload and full analysis of videos** (frame extraction, summary, contextual analysis…)
- **Trigger a decision agent** to automatically contact the appropriate emergency services (Gendarmerie, SAMU, Firefighters, Police) via SMS (Twilio)
- **Modular architecture** (video, audio, contextual analysis, decision agent)
- **Easy deployment with Docker & Docker Compose**
- **Security: API keys managed via environment variables**

---

## 📁 Project Structure

```
.
├── API/
│   └── api.py                # FastAPI entry point (main routes)
├── Modules/
│   ├── analyse_video.py      # Video frame analysis
│   ├── analyse_audio.py      # (Optional) Audio transcription
│   ├── analyse_contextuelle.py # Contextual report generation
│   ├── agent_decisionel.py   # Decision agent (alerts, LLM, Twilio)
│   ├── run_analyses.py       # Orchestrates the analysis pipeline
│   └── alert.py              # SMS alert sending via Twilio
├── data/                     # Output folder for analysis results
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── deploy.sh                 # Automated install & deployment script
├── test_agent.py             # Test script for the decision agent
└── .gitignore
```

---

## 🛠️ Installation & Launch

### 1. **Clone the repository**

```bash
git clone <repo_url>
cd <repo_name>
```

### 2. **Configure your environment variables**

- Create a `.env` file at the root of the project and fill it with your API keys and phone numbers (see `env_example.txt` for reference).

### 3. **Start with Docker Compose**

```bash
sudo docker-compose up --build -d
```

The API will be available at:  
`http://<SERVER_IP>:8000`

---

## 🧩 API Usage

### **1. POST `/api/v1/envoyer-flux`**

- **Description**: Upload a video, run the full analysis pipeline, and generate analysis files.
- **Body**: `multipart/form-data` with a `video` field (video file)
- **Response**:
  ```json
  {
    "message": "Analyse vidéo terminée avec succès",
    "fichiers_generes": [
      "data/descriptions_par_image.txt",
      "data/resume_video.txt",
      "data/transcription_audio.txt",
      "data/analyse_contextuelle.txt",
      "data/metadata.json"
    ],
    "taille_analyse": 1234
  }
  ```

### **2. POST `/api/v1/gerer-alerte`**

- **Description**: Triggers the decision agent based on the video summary.  
  The agent analyzes the summary, decides which services to contact, and sends alerts via SMS.
- **Response**:
  ```json
  {
    "message": "Agent décisionnel exécuté",
    "taille_resume": 456,
    "sortie_agent": "Appel des services : ['Pompiers']\n[Pompiers]  Message envoyé avec succès."
  }
  ```

### **Interactive documentation**  
Access the interactive docs at:  
`http://<SERVER_IP>:8000/docs`

---

## ⚙️ Main Dependencies

- Python 3.9
- FastAPI, Uvicorn
- OpenCV, numpy
- Langchain, Groq, LangGraph
- Twilio (SMS sending)
- python-dotenv

See `requirements.txt` for the full list.

---

## 🔒 Security & Best Practices

- **Never commit your `.env` file** (already in `.gitignore`)
- **Clean your Git history** if secrets were ever committed by mistake
- **Restrict access to port 8000** (firewall already configured)

---

## 👨‍💻 Development & Testing

- To run locally without Docker:
  ```bash
  pip install -r requirements.txt
  uvicorn API.api:app --reload
  ```
- To test modules individually, see scripts in `Modules/` and `test_agent.py`.

---

## 🆘 Support

For questions or bug reports, open an issue on GitHub or contact the author.

---

**Project developed by Yassine Seidou.**  
**License: MIT (or adapt as needed).**
```

Let me know if you want to add or change any section!

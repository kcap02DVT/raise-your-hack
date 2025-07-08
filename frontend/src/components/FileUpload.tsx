import React, { useCallback, useState } from 'react';
import { Upload, X, Play } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onVideoSelect: (url: string) => void;
  setDescription: (desc: string) => void;
  setDecision: (decision: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onVideoSelect, setDescription, setDecision }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);


  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      setSelectedFile(videoFile);
      onFileSelect(videoFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handlePlayFile = () => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      onVideoSelect(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  function parseSortieAgent(sortie_agent: string) {
    const analyseMatch = sortie_agent.match(/Analyse du message\s*:\s*['"]?([\s\S]*?)['"]?\n\s*Message généré\s*:/);
    const analyse = analyseMatch ? analyseMatch[1].trim() : '';

    const appelMatch = sortie_agent.match(/Appel des services\s*:\s*([^\n]+)/);
    const appel = appelMatch ? appelMatch[1].trim() : '';

    return { analyse, appel };
  }

  const handleSendFile = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('video', selectedFile); // <-- 'video' doit correspondre au paramètre de la route FastAPI

    try {
      // 1. Envoi du fichier
      const response = await fetch('http://140.82.55.33:8000/api/v1/envoyer-flux', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du fichier');
      }

      // 2. Appel à gerer-alerte après succès
      const alertResponse = await fetch('http://140.82.55.33:8000/api/v1/gerer-alerte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Tu peux adapter le body selon ce que l'API attend
        body: JSON.stringify({ message: 'Alerte déclenchée après upload vidéo' }),
      });
      const data = await alertResponse.json();
      console.log('Réponse gerer-alerte:', data);

      if (data.sortie_agent) {
        const { analyse, appel } = parseSortieAgent(data.sortie_agent);
        console.log('Analyse:', analyse);
        console.log('Appel:', appel);
        setDescription(analyse);
        setDecision(appel);
      }

      setUploadSuccess(true);
    } catch (err: any) {
      setUploadError(err.message || 'Erreur inconnue');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-blue-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700 mb-2">
          Drag and drop your video here
          </p>
          <p className="text-slate-500 mb-4">or</p>
          <label className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Choose a file
            <input
              type="file"
              accept="video/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-400 mt-2">
          Supported formats: MP4, MOV, AVI, WebM
          </p>
        </div>
      ) : (
        <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-800">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePlayFile}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
            >
              Play a video
            </button>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={handleSendFile}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
      {/* Affichage du succès ou de l'erreur */}
      {uploadError && (
        <div className="text-red-500 text-sm mt-2">{uploadError}</div>
      )}
      {uploadSuccess && (
        <div className="text-green-600 text-sm mt-2">Upload successful!</div>
      )}
    </div>
  );
};

export default FileUpload;
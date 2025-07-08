import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings, Camera, CameraOff } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  isCamera?: boolean;
  onCameraToggle?: (enabled: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, isCamera = false, onCameraToggle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  // Gérer l'accès à la caméra
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      if (!isCamera || !cameraEnabled || stream) return;

      setIsLoadingCamera(true);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.muted = true; // Éviter le feedback audio
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Erreur d\'accès à la caméra:', error);
      } finally {
        setIsLoadingCamera(false);
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };

    if (isCamera && cameraEnabled) {
      startCamera();
    } else if (isCamera && !cameraEnabled) {
      stopCamera();
    }

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCamera, cameraEnabled]);

  // Gérer la vidéo uploadée
  useEffect(() => {
    if (!isCamera && src && videoRef.current) {
      videoRef.current.src = src;
    }
  }, [src, isCamera]);

  const togglePlay = () => {
    if (videoRef.current && !isCamera) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    const newState = !cameraEnabled;
    setCameraEnabled(newState);
    onCameraToggle?.(newState);
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      {/* Placeholder quand la caméra est désactivée */}
      {isCamera && !cameraEnabled && (
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
          <div className="text-center">
            <CameraOff className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-300 text-lg">Camera disabled</p>
            <p className="text-slate-500 text-sm">Click the camera button to turn it on</p>
          </div>
        </div>
      )}

      {/* Loading state pour la caméra */}
      {isCamera && cameraEnabled && isLoadingCamera && (
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300">Activation de la caméra...</p>
          </div>
        </div>
      )}

      {/* Vidéo */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${
          (isCamera && (!cameraEnabled || isLoadingCamera)) ? 'hidden' : 'block'
        }`}
        autoPlay={isCamera}
        muted={isCamera}
        playsInline
        onLoadedMetadata={() => {
          if (isCamera && videoRef.current) {
            videoRef.current.play();
          }
        }}
      />
      
      {/* Overlay Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/70 px-6 py-3 rounded-full backdrop-blur-sm">
        {!isCamera && (
          <button
            onClick={togglePlay}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>
        )}
        


        {isCamera && (
          <button
            onClick={toggleCamera}
            disabled={isLoadingCamera}
            className={`p-2 hover:bg-white/20 rounded-full transition-colors ${
              cameraEnabled ? 'bg-green-500/30' : 'bg-red-500/30'
            } ${isLoadingCamera ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {cameraEnabled ? (
              <Camera className="w-5 h-5 text-white" />
            ) : (
              <CameraOff className="w-5 h-5 text-white" />
            )}
          </button>
        )}

    
      </div>

      {/* Recording Indicator */}
      {isCamera && cameraEnabled && stream && !isLoadingCamera && (
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium">REC</span>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
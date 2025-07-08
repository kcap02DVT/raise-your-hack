import React, { useState, useCallback } from 'react';
import { Camera, Upload, MessageSquare, Users, Settings, PhoneOff, Activity } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import FileUpload from './components/FileUpload';
import ChatPanel from './components/ChatPanel';
import MonitoringDashboard from './components/MonitoringDashboard';
interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  avatar: string;
  isOwn?: boolean;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  cameraEnabled: boolean;
  isPresenting?: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'monitoring'>('camera');
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [rightPanel, setRightPanel] = useState<'chat' | 'participants'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: 'Cosy',
      text: 'Hello Guys! What\'s your opinion?',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      id: '2',
      user: 'John',
      text: 'Images are better.',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    },
    {
      id: '3',
      user: 'You',
      text: 'Yes, it will decrease the loading 🔥',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      isOwn: true
    },
    {
      id: '4',
      user: 'Jack',
      text: 'Anyone is up for illustrations. I think there are less relatable images according to our brand.',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
    }
  ]);

  const [participants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Cosy',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      isMuted: false,
      cameraEnabled: true,
      isPresenting: true
    },
    {
      id: '2',
      name: 'John',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      isMuted: true,
      cameraEnabled: true
    },
    {
      id: '3',
      name: 'Sarah',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      isMuted: false,
      cameraEnabled: false
    },
    {
      id: '4',
      name: 'Jack',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      isMuted: false,
      cameraEnabled: true
    }
  ]);

  const handleFileSelect = useCallback((file: File) => {
    console.log('File selected:', file.name);
  }, []);

  const handleVideoSelect = useCallback((url: string) => {
    setVideoSrc(url);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      user: 'You',
      text: message,
      timestamp: new Date().toISOString(),
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      isOwn: true
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Sentinel.ai</h1>
          </div>

        </div>
      </header>

      <div className="flex flex-1 h-[calc(100vh-80px)]">
        {/* Left Panel - Video */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'camera' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Camera</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'upload' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
              <button
                onClick={() => setActiveTab('monitoring')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'monitoring' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Monitoring</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              {activeTab === 'camera' ? (
                <VideoPlayer 
                  isCamera={true}
                  onCameraToggle={(enabled) => console.log('Camera toggled:', enabled)}
                />
              ) : activeTab === 'upload' ? (
                <div className="h-full flex flex-col">
                  <div className="mb-6">
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      onVideoSelect={handleVideoSelect}
                    />
                  </div>
                  {videoSrc && (
                    <div className="flex-1">
                      <VideoPlayer src={videoSrc} />
                    </div>
                  )}
                </div>
              ) : activeTab === 'monitoring' ? (
                <MonitoringDashboard />
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">


          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {rightPanel === 'chat' ? (
              <ChatPanel 
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="p-4 h-full overflow-y-auto">
                <ParticipantsList participants={participants} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
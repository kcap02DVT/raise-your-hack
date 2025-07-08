import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Users } from 'lucide-react';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  avatar: string;
  isOwn?: boolean;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  description?: string;
  decision?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, description, decision }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full h-full bg-slate-800 rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-medium">Messages</h3>

        </div>

      </div>

      {/* Cards */}
      <div className="flex-1 p-4 flex flex-col gap-4 min-h-0">
        {/* Description Card */}
        <div className="bg-slate-700 rounded-lg p-4 flex-1 min-h-0 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Description</h3>
          <div
            className="overflow-y-auto pr-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}
          >
            <div className="space-y-3">
              {description ? (
                <p className="text-slate-200 whitespace-pre-line">{description}</p>
              ) : (
                <p className="text-slate-400 italic">Aucune description disponible.</p>
              )}
            </div>
          </div>
        </div>

        {/* Décision Card */}
        <div className="bg-slate-700 rounded-lg p-4 flex-1 min-h-0 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Decision</h3>
          <div
            className="overflow-y-auto pr-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}
          >
            <div className="space-y-3">
              {decision ? (
                <p className="text-slate-200 whitespace-pre-line">{decision}</p>
              ) : (
                <p className="text-slate-400 italic">Aucune décision disponible.</p>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ChatPanel;
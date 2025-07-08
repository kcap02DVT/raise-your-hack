import React from 'react';
import { Activity, Users, Clock, TrendingUp, Eye, MessageCircle, Wifi, HardDrive } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend }) => {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';
  
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className="text-slate-400">{icon}</div>
        <span className={`text-sm ${trendColor}`}>{change}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );
};

const MonitoringDashboard: React.FC = () => {
  const metrics = [
    {
      title: 'Participants actifs',
      value: 4,
      change: '+2',
      icon: <Users className="w-5 h-5" />,
      trend: 'up' as const
    },
    {
      title: 'Durée de session',
      value: '12:36',
      change: '+5 min',
      icon: <Clock className="w-5 h-5" />,
      trend: 'up' as const
    },
    {
      title: 'Messages envoyés',
      value: 24,
      change: '+8',
      icon: <MessageCircle className="w-5 h-5" />,
      trend: 'up' as const
    },
    {
      title: 'Qualité réseau',
      value: '98%',
      change: '-1%',
      icon: <Wifi className="w-5 h-5" />,
      trend: 'down' as const
    }
  ];

  const participantData = [
    {
      name: 'Cosy',
      joinTime: '09:15',
      duration: '12:36',
      messages: 8,
      status: 'Présentateur',
      quality: 'Excellente'
    },
    {
      name: 'John',
      joinTime: '09:18',
      duration: '12:33',
      messages: 3,
      status: 'Participant',
      quality: 'Bonne'
    },
    {
      name: 'Sarah',
      joinTime: '09:22',
      duration: '12:29',
      messages: 7,
      status: 'Participant',
      quality: 'Moyenne'
    },
    {
      name: 'Jack',
      joinTime: '09:25',
      duration: '12:26',
      messages: 6,
      status: 'Participant',
      quality: 'Excellente'
    }
  ];

  const workflowData = [
    {
      audioDescription: ' Soft tapping of footsteps on the stairway, occasional phone notification sounds, a gasp of surprise, followed by the sound of stumbling and a small thud as the employee regains balance.',
      videoDescription: ' An employee is descending a flight of stairs inside the office building while looking down at their phone. The camera captures several close-ups of the employee’s face focused on the screen rather than the steps. Suddenly, the employee misses a step and stumbles.',
      time: '12:58 AM',
      alerts: 'Employee fell on stairs in Building A. Potential injury.',
      decision: 'SAMU (emergency medical services)'
    },
    {
      audioDescription: 'Rustling noises of bushes, faint footsteps on gravel, occasional whispers or muffled voices. In the background, a security alarm chimes intermittently.',
      videoDescription: 'Night vision footage shows a person climbing over a perimeter fence and entering a restricted area of the company grounds. The intruder moves cautiously near parked vehicles and storage containers.',
      time: '02:14 AM',
      alerts: 'Security breach detected – Unauthorized person trespassing in Restricted Zone C. Incident severity: HIGH. Immediate security response required.',
      decision: 'Police '
    },
    {
      audioDescription: 'Crackling and popping sounds from electrical arcing, the piercing tone of a fire alarm, and a robotic voice instructing evacuation.',
      videoDescription: 'Static footage shows smoke billowing from an electrical panel. Sparks and small flames appear, while a smoke detector light starts blinking red rapidly.',
      time: '03:27 PM',
      alerts: ' Smoke and heat signature detected in Technical Room – Basement B. Fire risk level: EXTREME. Automated suppression system pending activation. Recommend immediate intervention.',
      decision: 'Pompiers'
    }
  ];

  const systemMetrics = [
    { label: 'CPU Usage', value: '45%', status: 'normal' },
    { label: 'Memory Usage', value: '62%', status: 'normal' },
    { label: 'Bandwidth', value: '1.2 Mbps', status: 'good' },
    { label: 'Latency', value: '23ms', status: 'excellent' },
    { label: 'Packet Loss', value: '0.1%', status: 'excellent' },
    { label: 'Frame Rate', value: '30 fps', status: 'good' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'normal': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellente': return 'text-green-400 bg-green-400/20';
      case 'Bonne': return 'text-blue-400 bg-blue-400/20';
      case 'Moyenne': return 'text-yellow-400 bg-yellow-400/20';
      case 'Faible': return 'text-red-400 bg-red-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'Approuvé': return 'bg-green-500/20 text-green-400';
      case 'En attente': return 'bg-yellow-500/20 text-yellow-400';
      case 'Rejeté': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-600 text-slate-300';
    }
  };

  const getAlertColor = (alert: string) => {
    switch (alert) {
      case 'Aucune': return 'text-green-400';
      case 'Latence élevée': return 'text-yellow-400';
      case 'Contraste insuffisant': return 'text-red-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Real-time monitoring</h2>
      </div>

      {/* Workflow Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Workflow Details
          </h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-3 text-slate-300 font-medium">Audio description</th>
                <th className="text-left p-3 text-slate-300 font-medium">Video description</th>
                <th className="text-left p-3 text-slate-300 font-medium">Hour</th>
                <th className="text-left p-3 text-slate-300 font-medium">Alert(s)</th>
                <th className="text-left p-3 text-slate-300 font-medium">Decision</th>
              </tr>
            </thead>
            <tbody>
              {workflowData.map((item, index) => (
                <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="p-3 text-white align-top break-words whitespace-pre-line">
                    {item.audioDescription}
                  </td>
                  <td className="p-3 text-slate-300 align-top break-words whitespace-pre-line">
                    {item.videoDescription}
                  </td>
                  <td className="p-3 text-slate-300 align-top">{item.time}</td>
                  <td className="p-3 align-top break-words whitespace-pre-line">
                    <span className={`text-sm ${getAlertColor(item.alerts)}`}>{item.alerts}</span>
                  </td>
                  <td className="p-3 align-top">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDecisionColor(item.decision)}`}>{item.decision}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
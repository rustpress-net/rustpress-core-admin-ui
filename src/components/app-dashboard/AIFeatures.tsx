/**
 * AI/ML Feature Components
 * Part of the 30 Enterprise Dashboard Enhancements
 *
 * Features:
 * 1. AI Chatbot Assistant
 * 2. Smart Recommendations
 * 3. Predictive Maintenance
 * 4. Auto-scaling Advisor
 * 5. Log Analysis AI
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Server,
  Cpu,
  HardDrive,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  Zap,
  Brain,
  FileText,
  Search,
  Filter,
  AlertCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Target,
  Settings,
  Play,
} from 'lucide-react';

// ============================================
// 1. AI Chatbot Assistant
// ============================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const suggestedQuestions = [
  'How do I improve API performance?',
  'Show me error trends this week',
  'What resources need scaling?',
  'Explain the recent traffic spike',
];

export function AIChatbotAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you analyze metrics, troubleshoot issues, and optimize your applications. What would you like to know?",
      timestamp: new Date(),
      suggestions: suggestedQuestions,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const responses: Record<string, string> = {
      'How do I improve API performance?': "Based on my analysis, here are the top recommendations:\n\n1. **Enable caching** - Your API responses have a 78% cache hit potential\n2. **Optimize database queries** - I detected 3 N+1 query patterns\n3. **Add compression** - Could reduce payload size by ~40%\n4. **Consider rate limiting** - Some endpoints receive burst traffic\n\nWould you like me to elaborate on any of these?",
      'Show me error trends this week': "Here's the error analysis for this week:\n\n📈 **Error Rate**: 0.42% (↓ from 0.58% last week)\n\n**Top Errors:**\n1. 500 Internal Server Error - 156 occurrences (auth-service)\n2. 429 Too Many Requests - 89 occurrences (api-gateway)\n3. 503 Service Unavailable - 23 occurrences (cache-service)\n\nThe auth-service errors correlate with deployment at 14:32 UTC on Monday.",
      'What resources need scaling?': "🔍 **Scaling Recommendations:**\n\n**Immediate Action Required:**\n- `worker-pool-1`: CPU at 87% average (recommend +2 instances)\n- `redis-cache`: Memory at 92% (recommend upgrade to 8GB)\n\n**Watch List:**\n- `api-gateway`: Traffic trending +15%/week\n- `postgres-primary`: Connections nearing limit\n\nShall I create scaling policies for these?",
      'Explain the recent traffic spike': "📊 **Traffic Spike Analysis (2 hours ago):**\n\n**Cause identified:** Product launch announcement on social media\n\n**Impact:**\n- Requests/sec: 450 → 2,340 (5.2x increase)\n- Response time: 45ms → 180ms\n- Error rate: 0.1% → 0.8%\n\n**Auto-mitigation triggered:**\n- Scaled API instances from 4 to 8\n- Enabled rate limiting\n- CDN cache warming\n\nTraffic normalized within 45 minutes.",
    };

    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: responses[text] || "I've analyzed your question. Based on the current system metrics and historical data, I can provide insights on performance optimization, error patterns, and scaling recommendations. Could you be more specific about what you'd like to know?",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">AI Assistant</h3>
          <p className="text-xs text-neutral-500">Powered by machine learning</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : ''}`}>
              <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-1.5 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
              {message.suggestions && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(suggestion)}
                      className="px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex gap-1 p-3 bg-neutral-100 dark:bg-neutral-700 rounded-xl">
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// 2. Smart Recommendations
// ============================================

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'performance' | 'cost' | 'security' | 'reliability';
  savings?: string;
  effort: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Enable Redis Cluster Mode',
    description: 'Your cache hit rate is 67%. Enabling cluster mode could improve it to 85%+ and reduce latency.',
    impact: 'high',
    category: 'performance',
    savings: '23% faster response',
    effort: 'medium',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Right-size API instances',
    description: 'Your API servers are overprovisioned. Downsizing from m5.xlarge to m5.large could save costs.',
    impact: 'high',
    category: 'cost',
    savings: '$340/month',
    effort: 'easy',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Enable WAF rules',
    description: 'Detected suspicious traffic patterns. Enabling WAF could block potential attacks.',
    impact: 'high',
    category: 'security',
    effort: 'easy',
    status: 'in_progress',
  },
  {
    id: '4',
    title: 'Add database replicas',
    description: 'Read traffic is 80% of total. Adding read replicas could improve availability.',
    impact: 'medium',
    category: 'reliability',
    effort: 'hard',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Optimize image assets',
    description: 'Detected 45 unoptimized images. Converting to WebP could reduce bandwidth by 40%.',
    impact: 'medium',
    category: 'performance',
    savings: '40% bandwidth',
    effort: 'easy',
    status: 'completed',
  },
];

export function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [filter, setFilter] = useState<'all' | 'performance' | 'cost' | 'security' | 'reliability'>('all');

  const filteredRecs = filter === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === filter);

  const updateStatus = (id: string, status: Recommendation['status']) => {
    setRecommendations(recommendations.map(r =>
      r.id === id ? { ...r, status } : r
    ));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-600 dark:bg-red-900/30';
      case 'medium': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30';
      case 'low': return 'bg-green-100 text-green-600 dark:bg-green-900/30';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'cost': return <TrendingUp className="w-4 h-4" />;
      case 'security': return <AlertTriangle className="w-4 h-4" />;
      case 'reliability': return <Activity className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Smart Recommendations</h3>
            <p className="text-sm text-neutral-500">AI-powered optimization suggestions</p>
          </div>
        </div>
        <span className="text-sm text-neutral-500">
          {recommendations.filter(r => r.status === 'pending').length} pending
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'performance', 'cost', 'security', 'reliability'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
              filter === cat
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredRecs.map((rec) => (
          <motion.div
            key={rec.id}
            layout
            className={`p-4 rounded-xl border transition-all ${
              rec.status === 'completed'
                ? 'border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 opacity-60'
                : rec.status === 'dismissed'
                ? 'opacity-40'
                : 'border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`p-1 rounded ${getImpactColor(rec.impact)}`}>
                    {getCategoryIcon(rec.category)}
                  </span>
                  <h4 className="font-medium text-neutral-900 dark:text-white">{rec.title}</h4>
                </div>
                <p className="text-sm text-neutral-500 mb-2">{rec.description}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded ${getImpactColor(rec.impact)}`}>
                    {rec.impact} impact
                  </span>
                  <span className="text-neutral-400">
                    {rec.effort === 'easy' ? '~1 hour' : rec.effort === 'medium' ? '~4 hours' : '~1 day'}
                  </span>
                  {rec.savings && (
                    <span className="text-green-600 font-medium">
                      {rec.savings}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {rec.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(rec.id, 'in_progress')}
                      className="px-3 py-1 bg-primary-500 text-white rounded text-xs hover:bg-primary-600"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => updateStatus(rec.id, 'dismissed')}
                      className="px-3 py-1 text-neutral-500 hover:text-neutral-700 text-xs"
                    >
                      Dismiss
                    </button>
                  </>
                )}
                {rec.status === 'in_progress' && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Applying...
                  </span>
                )}
                {rec.status === 'completed' && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Applied
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// 3. Predictive Maintenance
// ============================================

interface MaintenancePrediction {
  id: string;
  resource: string;
  type: 'disk' | 'memory' | 'cpu' | 'network' | 'certificate';
  currentValue: number;
  threshold: number;
  predictedIssue: string;
  predictedDate: Date;
  confidence: number;
  severity: 'critical' | 'warning' | 'info';
  recommendation: string;
}

const mockPredictions: MaintenancePrediction[] = [
  {
    id: '1',
    resource: 'db-primary-01',
    type: 'disk',
    currentValue: 78,
    threshold: 90,
    predictedIssue: 'Disk space exhaustion',
    predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    confidence: 94,
    severity: 'critical',
    recommendation: 'Increase disk size or implement data archival',
  },
  {
    id: '2',
    resource: 'api-gateway',
    type: 'memory',
    currentValue: 72,
    threshold: 85,
    predictedIssue: 'Memory pressure',
    predictedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    confidence: 87,
    severity: 'warning',
    recommendation: 'Investigate memory leaks or scale horizontally',
  },
  {
    id: '3',
    resource: 'SSL Certificate',
    type: 'certificate',
    currentValue: 45,
    threshold: 30,
    predictedIssue: 'Certificate expiration',
    predictedDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    confidence: 100,
    severity: 'warning',
    recommendation: 'Renew SSL certificate before expiration',
  },
  {
    id: '4',
    resource: 'worker-pool-2',
    type: 'cpu',
    currentValue: 65,
    threshold: 80,
    predictedIssue: 'CPU saturation during peak',
    predictedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    confidence: 78,
    severity: 'info',
    recommendation: 'Consider auto-scaling policy adjustment',
  },
];

export function PredictiveMaintenance() {
  const [predictions] = useState<MaintenancePrediction[]>(mockPredictions);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'disk': return <HardDrive className="w-4 h-4" />;
      case 'memory': return <Server className="w-4 h-4" />;
      case 'cpu': return <Cpu className="w-4 h-4" />;
      case 'certificate': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'info': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-neutral-200';
    }
  };

  const getDaysUntil = (date: Date) => {
    const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">Predictive Maintenance</h3>
          <p className="text-sm text-neutral-500">AI-powered failure prediction</p>
        </div>
      </div>

      {/* Predictions Timeline */}
      <div className="space-y-3">
        {predictions.map((prediction) => (
          <motion.div
            key={prediction.id}
            layout
            onClick={() => setSelectedPrediction(selectedPrediction === prediction.id ? null : prediction.id)}
            className={`p-4 rounded-xl border-l-4 cursor-pointer transition-all ${getSeverityColor(prediction.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  prediction.severity === 'critical' ? 'bg-red-100 text-red-600' :
                  prediction.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {getTypeIcon(prediction.type)}
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-white">{prediction.predictedIssue}</h4>
                  <p className="text-sm text-neutral-500">{prediction.resource}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  getDaysUntil(prediction.predictedDate) <= 7 ? 'text-red-600' :
                  getDaysUntil(prediction.predictedDate) <= 14 ? 'text-amber-600' :
                  'text-neutral-600'
                }`}>
                  {getDaysUntil(prediction.predictedDate)} days
                </p>
                <p className="text-xs text-neutral-500">
                  {prediction.confidence}% confidence
                </p>
              </div>
            </div>

            {/* Progress to threshold */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>Current: {prediction.currentValue}%</span>
                <span>Threshold: {prediction.threshold}%</span>
              </div>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    prediction.severity === 'critical' ? 'bg-red-500' :
                    prediction.severity === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${(prediction.currentValue / prediction.threshold) * 100}%` }}
                />
              </div>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {selectedPrediction === prediction.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-start gap-2 p-3 bg-white dark:bg-neutral-700 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Recommendation</p>
                      <p className="text-sm text-neutral-500">{prediction.recommendation}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600">
                      Schedule Maintenance
                    </button>
                    <button className="px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm">
                      Snooze
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// 4. Auto-scaling Advisor
// ============================================

interface ScalingAdvice {
  id: string;
  resource: string;
  currentInstances: number;
  recommendedInstances: number;
  reason: string;
  predictedLoad: number[];
  costImpact: string;
  action: 'scale_up' | 'scale_down' | 'optimal';
  confidence: number;
}

const mockScalingAdvice: ScalingAdvice[] = [
  {
    id: '1',
    resource: 'API Servers',
    currentInstances: 4,
    recommendedInstances: 6,
    reason: 'Traffic spike predicted in 2 hours based on historical patterns',
    predictedLoad: [45, 52, 68, 85, 92, 78, 65, 50],
    costImpact: '+$24/day',
    action: 'scale_up',
    confidence: 89,
  },
  {
    id: '2',
    resource: 'Worker Nodes',
    currentInstances: 8,
    recommendedInstances: 5,
    reason: 'Low utilization detected over the past 48 hours',
    predictedLoad: [30, 28, 35, 42, 38, 32, 29, 31],
    costImpact: '-$45/day',
    action: 'scale_down',
    confidence: 92,
  },
  {
    id: '3',
    resource: 'Cache Cluster',
    currentInstances: 3,
    recommendedInstances: 3,
    reason: 'Current capacity is optimal for the workload',
    predictedLoad: [65, 68, 70, 72, 68, 65, 63, 66],
    costImpact: '$0',
    action: 'optimal',
    confidence: 95,
  },
];

export function AutoScalingAdvisor() {
  const [advice] = useState<ScalingAdvice[]>(mockScalingAdvice);
  const [autoApply, setAutoApply] = useState(false);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'scale_up': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'scale_down': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'optimal': return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-700';
      default: return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Auto-scaling Advisor</h3>
            <p className="text-sm text-neutral-500">Intelligent capacity planning</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Auto-apply</span>
          <button
            onClick={() => setAutoApply(!autoApply)}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              autoApply ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'
            }`}
          >
            <motion.div
              animate={{ x: autoApply ? 18 : 2 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
            />
          </button>
        </div>
      </div>

      {/* Scaling Recommendations */}
      <div className="space-y-4">
        {advice.map((item) => (
          <motion.div
            key={item.id}
            layout
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-neutral-900 dark:text-white">{item.resource}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs capitalize ${getActionColor(item.action)}`}>
                    {item.action.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-1">{item.reason}</p>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  item.costImpact.startsWith('+') ? 'text-red-600' :
                  item.costImpact.startsWith('-') ? 'text-green-600' :
                  'text-neutral-600'
                }`}>
                  {item.costImpact}
                </p>
                <p className="text-xs text-neutral-500">{item.confidence}% confidence</p>
              </div>
            </div>

            {/* Instance count visualization */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-neutral-400" />
                <span className="text-sm">
                  <span className="font-medium">{item.currentInstances}</span>
                  <span className="text-neutral-400"> → </span>
                  <span className={`font-medium ${
                    item.recommendedInstances > item.currentInstances ? 'text-green-600' :
                    item.recommendedInstances < item.currentInstances ? 'text-blue-600' :
                    ''
                  }`}>
                    {item.recommendedInstances}
                  </span>
                  <span className="text-neutral-500"> instances</span>
                </span>
              </div>
              {item.action !== 'optimal' && (
                <span className="flex items-center gap-1 text-sm">
                  {item.action === 'scale_up' ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-blue-500" />
                  )}
                  {Math.abs(item.recommendedInstances - item.currentInstances)}
                </span>
              )}
            </div>

            {/* Mini load chart */}
            <div className="h-12 flex items-end gap-1">
              {item.predictedLoad.map((load, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t"
                  style={{ height: `${load}%` }}
                  title={`${load}% load`}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-1 text-center">Predicted load (next 8 hours)</p>

            {/* Action buttons */}
            {item.action !== 'optimal' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <button className="flex-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 flex items-center justify-center gap-1">
                  <Play className="w-4 h-4" />
                  Apply Now
                </button>
                <button className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  Schedule
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// 5. Log Analysis AI
// ============================================

interface LogAnalysis {
  id: string;
  pattern: string;
  count: number;
  severity: 'error' | 'warning' | 'info';
  firstSeen: Date;
  lastSeen: Date;
  affectedServices: string[];
  suggestion: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

const mockLogAnalysis: LogAnalysis[] = [
  {
    id: '1',
    pattern: 'Connection timeout to database',
    count: 156,
    severity: 'error',
    firstSeen: new Date(Date.now() - 3600000),
    lastSeen: new Date(Date.now() - 120000),
    affectedServices: ['api-service', 'user-service'],
    suggestion: 'Check database connection pool settings and network latency',
    trend: 'increasing',
  },
  {
    id: '2',
    pattern: 'Rate limit exceeded for API key',
    count: 89,
    severity: 'warning',
    firstSeen: new Date(Date.now() - 7200000),
    lastSeen: new Date(Date.now() - 300000),
    affectedServices: ['api-gateway'],
    suggestion: 'Consider increasing rate limits or implementing client-side throttling',
    trend: 'stable',
  },
  {
    id: '3',
    pattern: 'Cache miss for user session',
    count: 423,
    severity: 'info',
    firstSeen: new Date(Date.now() - 86400000),
    lastSeen: new Date(),
    affectedServices: ['auth-service', 'cache-service'],
    suggestion: 'Adjust cache TTL or implement cache warming strategy',
    trend: 'decreasing',
  },
  {
    id: '4',
    pattern: 'Slow query detected (> 1000ms)',
    count: 34,
    severity: 'warning',
    firstSeen: new Date(Date.now() - 14400000),
    lastSeen: new Date(Date.now() - 600000),
    affectedServices: ['analytics-service', 'reporting-service'],
    suggestion: 'Add database indexes or optimize query structure',
    trend: 'increasing',
  },
];

export function LogAnalysisAI() {
  const [analyses] = useState<LogAnalysis[]>(mockLogAnalysis);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  const filteredAnalyses = analyses.filter(a => {
    const matchesSearch = a.pattern.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="w-3 h-3 text-red-500" />;
      case 'decreasing': return <ArrowDown className="w-3 h-3 text-green-500" />;
      case 'stable': return <Activity className="w-3 h-3 text-neutral-400" />;
      default: return null;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">Log Analysis AI</h3>
          <p className="text-sm text-neutral-500">Intelligent pattern detection</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search log patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-transparent text-sm"
          />
        </div>
        <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          {['all', 'error', 'warning', 'info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev as any)}
              className={`px-3 py-1 rounded-md text-sm capitalize transition-all ${
                severityFilter === sev
                  ? 'bg-white dark:bg-neutral-700 shadow'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredAnalyses.map((analysis) => (
          <motion.div
            key={analysis.id}
            layout
            className={`p-4 rounded-xl border-l-4 ${
              analysis.severity === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
              analysis.severity === 'warning' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' :
              'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getSeverityIcon(analysis.severity)}
                <h4 className="font-medium text-neutral-900 dark:text-white">{analysis.pattern}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  {analysis.count.toLocaleString()}
                </span>
                {getTrendIcon(analysis.trend)}
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {analysis.affectedServices.map((service) => (
                <span
                  key={service}
                  className="px-2 py-0.5 bg-white dark:bg-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400"
                >
                  {service}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
              <span>First seen: {formatTimeAgo(analysis.firstSeen)}</span>
              <span>Last seen: {formatTimeAgo(analysis.lastSeen)}</span>
            </div>

            <div className="flex items-start gap-2 p-2 bg-white dark:bg-neutral-700 rounded-lg">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{analysis.suggestion}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            Analyzed <span className="font-medium text-neutral-900 dark:text-white">2.4M</span> log entries
          </span>
          <button className="text-primary-500 hover:text-primary-600 flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>
    </motion.div>
  );
}

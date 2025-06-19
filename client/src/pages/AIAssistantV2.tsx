import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Calculator, 
  Target,
  FileText,
  BarChart3,
  Zap,
  Brain,
  MessageSquare,
  Settings,
  Download,
  RefreshCw,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AIAssistant {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  model: string;
  specialization: string[];
  context: Record<string, any>;
}

interface MCPMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
  analysis?: {
    type: string;
    confidence: number;
    insights: Array<{
      category: string;
      finding: string;
      impact: 'low' | 'medium' | 'high';
      recommendation: string;
      actionable: boolean;
    }>;
  };
}

interface Conversation {
  id: string;
  assistantId: string;
  title: string;
  messages: MCPMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export default function AIAssistantV2() {
  const [selectedAssistant, setSelectedAssistant] = useState<string>('chittybookkeeper');
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: assistants } = useQuery<AIAssistant[]>({
    queryKey: ['/api/v2/mcp/assistants'],
  });

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['/api/v2/mcp/conversations', selectedAssistant],
  });

  const { data: currentChat } = useQuery<Conversation>({
    queryKey: ['/api/v2/mcp/conversation', currentConversation],
    enabled: !!currentConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ assistantId, message, conversationId }: {
      assistantId: string;
      message: string;
      conversationId?: string;
    }) => {
      const response = await fetch('/api/v2/mcp/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId, message, conversationId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v2/mcp/conversation', currentConversation] });
      queryClient.invalidateQueries({ queryKey: ['/api/v2/mcp/conversations', selectedAssistant] });
      setMessage('');
    }
  });

  const analyzeDataMutation = useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any }) => {
      const response = await fetch('/api/v2/mcp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId: selectedAssistant, type, data })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsAnalyzing(false);
      // Add analysis results as a message
      const analysisMessage = {
        role: 'assistant' as const,
        content: `I've completed the ${data.type} analysis. Here are my findings:`,
        analysis: data.analysis
      };
      // Would add this to the conversation
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      assistantId: selectedAssistant,
      message,
      conversationId: currentConversation || undefined
    });
  };

  const handleQuickAnalysis = (analysisType: string) => {
    setIsAnalyzing(true);
    analyzeDataMutation.mutate({
      type: analysisType,
      data: {} // Would pass relevant data based on analysis type
    });
  };

  const getAssistantIcon = (assistantId: string) => {
    const icons = {
      chittybookkeeper: Calculator,
      chittytrader: TrendingUp,
      chittyauditor: Shield,
      chittytax: FileText,
      chittyplanner: Target
    };
    return icons[assistantId as keyof typeof icons] || Bot;
  };

  const getAssistantColor = (assistantId: string) => {
    const colors = {
      chittybookkeeper: 'from-blue-500 to-cyan-500',
      chittytrader: 'from-green-500 to-emerald-500',
      chittyauditor: 'from-red-500 to-orange-500',
      chittytax: 'from-purple-500 to-violet-500',
      chittyplanner: 'from-indigo-500 to-blue-500'
    };
    return colors[assistantId as keyof typeof colors] || 'from-gray-500 to-slate-500';
  };

  const selectedAssistantData = assistants?.find(a => a.id === selectedAssistant);
  const AssistantIcon = getAssistantIcon(selectedAssistant);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              AI Financial Assistant
            </h1>
            <p className="text-slate-400">
              Powered by ChittyMCP - Advanced AI for Financial Intelligence
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              <Brain className="h-3 w-3 mr-1" />
              AI Active
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Assistant Selection Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  AI Specialists
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assistants?.map((assistant) => {
                  const Icon = getAssistantIcon(assistant.id);
                  const isSelected = selectedAssistant === assistant.id;
                  
                  return (
                    <div
                      key={assistant.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-r ' + getAssistantColor(assistant.id) + ' text-white' 
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                      }`}
                      onClick={() => setSelectedAssistant(assistant.id)}
                    >
                      <div className="flex items-center mb-2">
                        <Icon className="h-4 w-4 mr-2" />
                        <span className="font-medium">{assistant.name}</span>
                      </div>
                      <p className="text-xs opacity-80">{assistant.role}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {assistant.specialization.slice(0, 2).map(spec => (
                          <Badge 
                            key={spec} 
                            variant="secondary" 
                            className={`text-xs ${isSelected ? 'bg-white/20' : 'bg-slate-700'}`}
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-slate-700 text-slate-300"
                  onClick={() => handleQuickAnalysis('transactions')}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? <Clock className="h-4 w-4 mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                  Analyze Transactions
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-slate-700 text-slate-300"
                  onClick={() => handleQuickAnalysis('portfolio')}
                  disabled={isAnalyzing}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Portfolio Review
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-slate-700 text-slate-300"
                  onClick={() => handleQuickAnalysis('tax')}
                  disabled={isAnalyzing}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Tax Analysis
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-slate-700 text-slate-300"
                  onClick={() => handleQuickAnalysis('compliance')}
                  disabled={isAnalyzing}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Compliance Check
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur h-[700px] flex flex-col">
              <CardHeader className="border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getAssistantColor(selectedAssistant)} flex items-center justify-center mr-3`}>
                      <AssistantIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{selectedAssistantData?.name}</h3>
                      <p className="text-slate-400 text-sm">{selectedAssistantData?.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentChat?.messages.length === 0 && (
                    <div className="text-center py-12">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getAssistantColor(selectedAssistant)} flex items-center justify-center mx-auto mb-4`}>
                        <AssistantIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-white font-medium mb-2">Start a conversation with {selectedAssistantData?.name}</h3>
                      <p className="text-slate-400 text-sm mb-4">{selectedAssistantData?.description}</p>
                      
                      <div className="flex flex-wrap gap-2 justify-center">
                        {selectedAssistantData?.capabilities.slice(0, 4).map(capability => (
                          <Badge key={capability} variant="secondary" className="bg-slate-800 text-slate-300">
                            {capability.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentChat?.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-800 text-slate-200'
                      }`}>
                        <div className="prose prose-sm max-w-none">
                          {msg.content}
                        </div>
                        
                        {msg.analysis && (
                          <div className="mt-4 space-y-3">
                            <div className="text-sm font-medium flex items-center">
                              <Brain className="h-4 w-4 mr-2" />
                              Analysis Results (Confidence: {(msg.analysis.confidence * 100).toFixed(0)}%)
                            </div>
                            
                            {msg.analysis.insights.map((insight, index) => (
                              <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-sm font-medium text-slate-300">{insight.category}</span>
                                  <Badge 
                                    variant="secondary" 
                                    className={
                                      insight.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                                      insight.impact === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                                      'bg-blue-500/20 text-blue-400'
                                    }
                                  >
                                    {insight.impact} impact
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-400 mb-2">{insight.finding}</p>
                                <p className="text-sm text-slate-300">{insight.recommendation}</p>
                                
                                {insight.actionable && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="mt-2 border-slate-600 text-slate-300"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Take Action
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs text-slate-400 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {sendMessageMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 text-slate-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                          {selectedAssistantData?.name} is thinking...
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-slate-800 p-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`Ask ${selectedAssistantData?.name} anything about your finances...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-slate-800 border-slate-700 text-white"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" size="sm" className="text-slate-400 text-xs">
                    "Analyze my spending patterns"
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-400 text-xs">
                    "Show me tax optimization opportunities"
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-400 text-xs">
                    "Create a financial report"
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
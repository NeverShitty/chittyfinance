import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, Sparkles, TrendingUp, BarChart2, AlertCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AICFOAssistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  
  // Fetch latest AI message
  const { data: latestMessage, isLoading } = useQuery({
    queryKey: ["/api/ai-assistant/latest"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Generate plan mutation
  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai-assistant/generate-plan");
      if (!response.ok) {
        throw new Error("Failed to generate cost reduction plan");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-assistant/latest"] });
      toast({
        title: "Plan Generated",
        description: "AI CFO has generated a new cost reduction plan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send query mutation
  const sendQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/ai-assistant/query", { query });
      if (!response.ok) {
        throw new Error("Failed to get response from AI assistant");
      }
      return response.json();
    },
    onSuccess: () => {
      setQuery("");
      queryClient.invalidateQueries({ queryKey: ["/api/ai-assistant/latest"] });
    },
    onError: (error) => {
      toast({
        title: "Query Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      sendQueryMutation.mutate(query);
    }
  };

  // Format message with special styling for insights and numbers
  const formatMessage = (content: string) => {
    if (!content) return null;
    
    // Split by paragraphs
    const paragraphs = content.split('\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Highlight financial figures with lime color and bold
      const formattedText = paragraph.replace(
        /(\$[\d,]+\.?\d*|\d+%|\d+\.\d+|\$\d+[KMB])/g, 
        '<span class="text-lime-400 font-semibold">$1</span>'
      );
      
      // Style bullet points
      const withBullets = formattedText.replace(
        /^(\s*[-•*]\s+)/,
        '<span class="text-lime-500 mr-2">•</span> '
      );
      
      // Check if this is a header (starts with # or ##)
      if (paragraph.trim().startsWith('# ')) {
        return (
          <h3 
            key={index} 
            className="text-xl font-bold mt-3 mb-2 gradient-text"
            dangerouslySetInnerHTML={{ __html: withBullets.replace(/^# /, '') }}
          />
        );
      } else if (paragraph.trim().startsWith('## ')) {
        return (
          <h4 
            key={index} 
            className="text-lg font-semibold mt-2 mb-1 text-zinc-200"
            dangerouslySetInnerHTML={{ __html: withBullets.replace(/^## /, '') }}
          />
        );
      }
      
      // For highlighted insights
      if (paragraph.includes('INSIGHT:') || paragraph.includes('TIP:')) {
        return (
          <div key={index} className="p-3 my-2 bg-zinc-800/50 border border-lime-500/30 rounded-md flex items-start">
            <Sparkles className="text-lime-400 mr-2 mt-0.5 w-5 h-5" />
            <div 
              className="text-zinc-200" 
              dangerouslySetInnerHTML={{ 
                __html: withBullets
                  .replace('INSIGHT:', '<span class="text-lime-400 font-semibold">INSIGHT:</span>')
                  .replace('TIP:', '<span class="text-lime-400 font-semibold">TIP:</span>') 
              }} 
            />
          </div>
        );
      }

      // For warnings
      if (paragraph.includes('WARNING:') || paragraph.includes('ALERT:')) {
        return (
          <div key={index} className="p-3 my-2 bg-zinc-800/50 border border-orange-500/30 rounded-md flex items-start">
            <AlertCircle className="text-orange-400 mr-2 mt-0.5 w-5 h-5" />
            <div 
              className="text-zinc-200" 
              dangerouslySetInnerHTML={{ 
                __html: withBullets
                  .replace('WARNING:', '<span class="text-orange-400 font-semibold">WARNING:</span>')
                  .replace('ALERT:', '<span class="text-orange-400 font-semibold">ALERT:</span>') 
              }} 
            />
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="mb-3 text-zinc-300" dangerouslySetInnerHTML={{ __html: withBullets }} />
      );
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="col-span-12 xl:col-span-8 border-zinc-800 bg-zinc-900 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse mr-2"></div>
              <div className="h-6 w-40 bg-zinc-800 animate-pulse rounded"></div>
            </div>
            <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-zinc-800 animate-pulse rounded"></div>
            <div className="h-4 bg-zinc-800 animate-pulse rounded w-5/6"></div>
            <div className="h-4 bg-zinc-800 animate-pulse rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-12 xl:col-span-8 border-zinc-800 bg-zinc-900/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-lime-500/50">
              <AvatarImage src="/assets/SERVICES.png" />
              <AvatarFallback className="bg-zinc-800 text-lime-500">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-zinc-100">AI CFO Assistant</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Powered by OpenAI GPT-4
              </CardDescription>
            </div>
            <Badge className="ml-2 bg-lime-500/20 text-lime-400 hover:bg-lime-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-auto"
          >
            <TabsList className="bg-zinc-800 border border-zinc-700">
              <TabsTrigger 
                value="assistant" 
                className={cn(
                  "text-xs",
                  activeTab === "assistant" ? "bg-lime-500 text-black" : "text-zinc-400"
                )}
              >
                Assistant
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className={cn(
                  "text-xs",
                  activeTab === "insights" ? "bg-lime-500 text-black" : "text-zinc-400"
                )}
              >
                Insights
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <TabsContent value="assistant" className="m-0 pt-2">
          <div className="relative min-h-[180px] max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            <div className="space-y-4 mb-4">
              <div className="flex items-start">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src="/assets/SERVICES.png" />
                  <AvatarFallback className="bg-zinc-800 text-lime-500"><Bot /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {formatMessage(latestMessage?.content || "I'm your AI CFO assistant. How can I help you today?")}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="m-0 pt-2">
          <div className="min-h-[180px] max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            <div className="space-y-4">
              <div className="p-3 bg-zinc-800/40 rounded-md border border-lime-500/20">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 mr-2 text-lime-500" />
                  <h4 className="font-medium text-zinc-200">Cash Flow Forecast</h4>
                </div>
                <p className="text-sm text-zinc-300">Based on current trends, your cash flow will remain <span className="text-lime-400 font-medium">positive</span> for the next <span className="text-lime-400 font-medium">5 months</span>. Consider setting aside <span className="text-lime-400 font-medium">$45,000</span> for upcoming tax obligations.</p>
              </div>
              
              <div className="p-3 bg-zinc-800/40 rounded-md border border-orange-500/20">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                  <h4 className="font-medium text-zinc-200">Expense Alert</h4>
                </div>
                <p className="text-sm text-zinc-300">Your software subscription expenses increased by <span className="text-orange-400 font-medium">23%</span> this quarter. Review the optimization recommendations in the Charge Automation section.</p>
              </div>
              
              <div className="p-3 bg-zinc-800/40 rounded-md border border-lime-500/20">
                <div className="flex items-center mb-2">
                  <BarChart2 className="h-5 w-5 mr-2 text-lime-500" />
                  <h4 className="font-medium text-zinc-200">Revenue Growth</h4>
                </div>
                <p className="text-sm text-zinc-300">Your Q2 revenue is <span className="text-lime-400 font-medium">12.5%</span> higher than Q1. Top performing service: <span className="text-lime-400 font-medium">SaaS Consulting</span> with <span className="text-lime-400 font-medium">31%</span> growth.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </CardContent>
      
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-400 hover:text-lime-400 hover:border-lime-500/50 hover:bg-transparent"
              onClick={() => generatePlanMutation.mutate()}
              disabled={generatePlanMutation.isPending}
            >
              {generatePlanMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-zinc-500 rounded-full" />
                  Generating
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Generate Cost Reduction Plan
                </div>
              )}
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about your finances..."
              className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-lime-500/50"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-lime-500 hover:bg-lime-600 text-black"
              disabled={sendQueryMutation.isPending || !query.trim()}
            >
              {sendQueryMutation.isPending ? (
                <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-zinc-900 rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
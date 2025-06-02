import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, Sparkles, TrendingUp, BarChart2, AlertCircle, Lightbulb, DollarSign, Check, Clock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CostReductionStep {
  id: number;
  title: string;
  action: string;
  timeline: string;
  goal: string;
  savingsPercent: number;
  icon: React.ReactNode;
  status: 'pending' | 'in-progress' | 'completed';
}

export default function AICFOAssistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  
  // Fetch latest AI message
  const { data: latestMessage, isLoading } = useQuery({
    queryKey: ["/api/ai-assistant/latest"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Portfolio entities for multi-business management
  const portfolioEntities = [
    { id: "all", name: "All Entities (Consolidated)", businesses: 4 },
    { id: "chitty-main", name: "Chitty Services Main", businesses: 1 },
    { id: "chitty-west", name: "Chitty West Coast", businesses: 1 },
    { id: "chitty-east", name: "Chitty East Coast", businesses: 1 },
    { id: "chitty-consulting", name: "Chitty Consulting", businesses: 1 }
  ];

  // Visual cost reduction plan steps
  const costReductionSteps: CostReductionStep[] = [
    { 
      id: 1, 
      title: "Expense Audit", 
      action: "Review all categories for redundant spending",
      timeline: "1-2 weeks", 
      goal: "5% expense reduction",
      savingsPercent: 5,
      status: 'completed',
      icon: <DollarSign className="h-4 w-4 text-lime-500" />
    },
    { 
      id: 2, 
      title: "Supplier Contracts", 
      action: "Negotiate better vendor terms",
      timeline: "2-4 weeks", 
      goal: "10% cost reduction",
      savingsPercent: 10,
      status: 'in-progress',
      icon: <Check className="h-4 w-4 text-orange-500" />
    },
    { 
      id: 3, 
      title: "Utilities", 
      action: "Energy-saving & rent optimization",
      timeline: "1-2 weeks", 
      goal: "10% utility savings",
      savingsPercent: 10,
      status: 'pending',
      icon: <Sparkles className="h-4 w-4 text-zinc-500" />
    },
    { 
      id: 4, 
      title: "Technology", 
      action: "Automation & efficiency tools",
      timeline: "2-3 weeks", 
      goal: "5% labor cost reduction",
      savingsPercent: 5,
      status: 'pending',
      icon: <BarChart2 className="h-4 w-4 text-zinc-500" />
    },
    { 
      id: 5, 
      title: "Marketing", 
      action: "Digital strategy optimization",
      timeline: "2-3 weeks", 
      goal: "10% marketing savings",
      savingsPercent: 10,
      status: 'pending',
      icon: <TrendingUp className="h-4 w-4 text-zinc-500" />
    }
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-lime-500/50 bg-lime-500/10';
      case 'in-progress': return 'border-orange-500/50 bg-orange-500/10';
      default: return 'border-zinc-700 bg-zinc-900/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-3 w-3 text-lime-500" />;
      case 'in-progress': return <Clock className="h-3 w-3 text-orange-500 animate-pulse" />;
      default: return <Clock className="h-3 w-3 text-zinc-500" />;
    }
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

  const selectedEntityData = portfolioEntities.find(e => e.id === selectedEntity);

  return (
    <Card className="col-span-12 xl:col-span-8 border-zinc-800 bg-zinc-900/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-lime-500/50">
              <AvatarImage src="/assets/SERVICES.png" />
              <AvatarFallback className="bg-zinc-800 text-lime-500">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg text-zinc-100">AI CFO Assistant</CardTitle>
                <Badge className="bg-lime-500/20 text-lime-400 hover:bg-lime-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-xs text-zinc-500">Last updated: May 20, 2025</p>
            </div>
          </div>
          
          {/* Portfolio/Entities Selector */}
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-zinc-400" />
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-zinc-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {portfolioEntities.map(entity => (
                  <SelectItem key={entity.id} value={entity.id} className="text-zinc-200">
                    {entity.name}
                    {entity.id === 'all' && (
                      <span className="ml-2 text-xs text-lime-400">({entity.businesses} businesses)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Entity Info Banner */}
        <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-zinc-200">{selectedEntityData?.name}</h4>
              <p className="text-xs text-zinc-500">
                {selectedEntity === 'all' 
                  ? `Viewing consolidated data across ${selectedEntityData?.businesses} businesses`
                  : 'Individual business view'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-lime-400">15-25% Total Savings</div>
              <div className="text-xs text-zinc-500">Estimated potential</div>
            </div>
          </div>
        </div>

        {/* Visual Cost Reduction Plan */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-lime-400 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Cost Reduction Plan
          </h3>
          
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {costReductionSteps.map((step) => (
              <div 
                key={step.id}
                className={cn(
                  "border rounded-lg p-3 transition-all hover:shadow-md",
                  getStatusColor(step.status)
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {step.icon}
                    <h4 className="font-medium text-zinc-200 text-sm">{step.title}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(step.status)}
                    <span className="text-lime-400 text-xs font-semibold">{step.savingsPercent}%</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mb-2">{step.action}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> 
                    {step.timeline}
                  </span>
                  <span className="text-zinc-500">{step.goal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="bg-zinc-950/40 border border-lime-500/20 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-4 w-4 mr-2 text-lime-500" />
              <h4 className="font-medium text-zinc-200 text-sm">Cash Flow Forecast</h4>
            </div>
            <p className="text-xs text-zinc-300">
              Positive for next <span className="text-lime-400 font-medium">5 months</span>. 
              Set aside <span className="text-lime-400 font-medium">$45K</span> for taxes.
            </p>
          </div>
          
          <div className="bg-zinc-950/40 border border-orange-500/20 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
              <h4 className="font-medium text-zinc-200 text-sm">Expense Alert</h4>
            </div>
            <p className="text-xs text-zinc-300">
              Software subscriptions up <span className="text-orange-400 font-medium">23%</span> this quarter. 
              Review charge automation.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about financial projections, cost savings, or investment opportunities..."
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-lime-500/50 pr-12"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1 top-1 h-8 bg-lime-500 hover:bg-lime-600 text-black"
                disabled={sendQueryMutation.isPending || !query.trim()}
              >
                {sendQueryMutation.isPending ? (
                  <div className="animate-spin h-3 w-3 border-2 border-t-transparent border-zinc-900 rounded-full" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </Button>
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-400 hover:text-lime-400 hover:border-lime-500/50 hover:bg-transparent whitespace-nowrap"
              onClick={() => generatePlanMutation.mutate()}
              disabled={generatePlanMutation.isPending}
            >
              {generatePlanMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin h-3 w-3 mr-1 border-2 border-t-transparent border-zinc-500 rounded-full" />
                  Generating
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Generate Plan
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
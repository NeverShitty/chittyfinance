import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Shield, 
  TrendingDown, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Contradiction {
  id: string;
  type: 'financial' | 'operational' | 'compliance' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  sources: string[];
  conflictingValues: {
    source1: { value: any; label: string };
    source2: { value: any; label: string };
  };
  potentialImpact: number;
  recommendedAction: string;
  detectedAt: string;
  entityId?: string;
}

export default function ContradictionEngine() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch contradiction analysis
  const { data: analysisData, isLoading } = useQuery({
    queryKey: ["/api/contradictions/analysis"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Run contradiction analysis mutation
  const analyzeContradictionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/contradictions/analyze");
      if (!response.ok) {
        throw new Error("Failed to analyze contradictions");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contradictions/analysis"] });
      toast({
        title: "Analysis Complete",
        description: "Contradiction analysis has been updated with latest data.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default: return <Shield className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'operational': return <Target className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'data': return <FileText className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const contradictions: Contradiction[] = analysisData?.contradictions || [];
  const summary = analysisData?.summary || {
    totalContradictions: 0,
    criticalCount: 0,
    highRiskCount: 0,
    estimatedImpact: 0
  };
  const riskScore = analysisData?.riskScore || 0;

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-lime-400';
  };

  if (isLoading) {
    return (
      <Card className="col-span-12 border-zinc-800 bg-zinc-900 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-zinc-800 animate-pulse rounded"></div>
            <div className="h-6 w-40 bg-zinc-800 animate-pulse rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-zinc-800 animate-pulse rounded"></div>
            <div className="h-4 bg-zinc-800 animate-pulse rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-12 border-zinc-800 bg-zinc-900/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-lime-500" />
            <div>
              <CardTitle className="text-lg text-zinc-100">Contradiction Engine</CardTitle>
              <p className="text-xs text-zinc-500">Financial Data Integrity Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={cn("text-lg font-bold", getRiskScoreColor(riskScore))}>
                {riskScore}/100
              </div>
              <div className="text-xs text-zinc-500">Risk Score</div>
            </div>
            <Button
              size="sm"
              onClick={() => analyzeContradictionsMutation.mutate()}
              disabled={analyzeContradictionsMutation.isPending}
              className="bg-lime-500 hover:bg-lime-600 text-black"
            >
              {analyzeContradictionsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-zinc-800 border border-zinc-700">
            <TabsTrigger 
              value="overview" 
              className={cn(
                "text-xs",
                activeTab === "overview" ? "bg-lime-500 text-black" : "text-zinc-400"
              )}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="contradictions" 
              className={cn(
                "text-xs",
                activeTab === "contradictions" ? "bg-lime-500 text-black" : "text-zinc-400"
              )}
            >
              Contradictions ({contradictions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="resolution" 
              className={cn(
                "text-xs",
                activeTab === "resolution" ? "bg-lime-500 text-black" : "text-zinc-400"
              )}
            >
              Resolution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-zinc-200">
                  {summary.totalContradictions}
                </div>
                <div className="text-xs text-zinc-500">Total Issues</div>
              </div>
              <div className="bg-zinc-950/40 border border-red-500/20 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-red-400">
                  {summary.criticalCount}
                </div>
                <div className="text-xs text-zinc-500">Critical</div>
              </div>
              <div className="bg-zinc-950/40 border border-orange-500/20 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-orange-400">
                  {summary.highRiskCount}
                </div>
                <div className="text-xs text-zinc-500">High Risk</div>
              </div>
              <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-lime-400">
                  ${(summary.estimatedImpact / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-zinc-500">Est. Impact</div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-200 mb-3">Risk Assessment</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Overall Data Integrity</span>
                  <span className={cn("text-xs font-medium", getRiskScoreColor(riskScore))}>
                    {riskScore < 20 ? 'Excellent' : 
                     riskScore < 40 ? 'Good' : 
                     riskScore < 60 ? 'Fair' : 
                     riskScore < 80 ? 'Poor' : 'Critical'}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all",
                      riskScore >= 80 ? 'bg-red-500' :
                      riskScore >= 60 ? 'bg-orange-500' :
                      riskScore >= 40 ? 'bg-yellow-500' : 'bg-lime-500'
                    )}
                    style={{ width: `${riskScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Top Priority Issues */}
            {contradictions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-200">Priority Issues</h3>
                <div className="space-y-2">
                  {contradictions
                    .filter(c => c.severity === 'critical' || c.severity === 'high')
                    .slice(0, 3)
                    .map((contradiction) => (
                      <div 
                        key={contradiction.id}
                        className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            {getSeverityIcon(contradiction.severity)}
                            <div>
                              <p className="text-sm font-medium text-zinc-200">{contradiction.title}</p>
                              <p className="text-xs text-zinc-400 mt-1">{contradiction.description}</p>
                            </div>
                          </div>
                          <Badge className={cn("text-xs ml-2", getSeverityColor(contradiction.severity))}>
                            {contradiction.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contradictions" className="mt-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {contradictions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-lime-500 mx-auto mb-3" />
                  <p className="text-zinc-400">No contradictions detected</p>
                  <p className="text-xs text-zinc-500">Your financial data appears consistent</p>
                </div>
              ) : (
                contradictions.map((contradiction) => (
                  <div 
                    key={contradiction.id}
                    className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(contradiction.type)}
                        <h4 className="font-medium text-zinc-200">{contradiction.title}</h4>
                      </div>
                      <Badge className={cn("text-xs", getSeverityColor(contradiction.severity))}>
                        {contradiction.severity}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-zinc-300 mb-3">{contradiction.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="bg-zinc-800/50 rounded p-2">
                        <p className="text-xs text-zinc-400">{contradiction.conflictingValues.source1.label}</p>
                        <p className="text-sm font-medium text-zinc-200">
                          {typeof contradiction.conflictingValues.source1.value === 'number' 
                            ? `$${contradiction.conflictingValues.source1.value.toLocaleString()}`
                            : contradiction.conflictingValues.source1.value}
                        </p>
                      </div>
                      <div className="bg-zinc-800/50 rounded p-2">
                        <p className="text-xs text-zinc-400">{contradiction.conflictingValues.source2.label}</p>
                        <p className="text-sm font-medium text-zinc-200">
                          {typeof contradiction.conflictingValues.source2.value === 'number' 
                            ? `$${contradiction.conflictingValues.source2.value.toLocaleString()}`
                            : contradiction.conflictingValues.source2.value}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Impact: ${(contradiction.potentialImpact / 1000).toFixed(0)}K</span>
                      <span>Sources: {contradiction.sources.join(', ')}</span>
                    </div>
                    
                    <div className="mt-2 p-2 bg-zinc-800/30 rounded">
                      <p className="text-xs text-zinc-400">
                        <strong>Recommended Action:</strong> {contradiction.recommendedAction}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="resolution" className="mt-4">
            <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-lime-500" />
                Resolution Plan
              </h3>
              {contradictions.length === 0 ? (
                <p className="text-zinc-400 text-sm">
                  No contradictions to resolve. Your financial data integrity is excellent.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-zinc-300">
                    <p className="mb-3">
                      Based on {contradictions.length} detected contradictions, here's your prioritized action plan:
                    </p>
                    
                    <ol className="space-y-2 list-decimal list-inside">
                      <li>
                        <strong>Immediate Actions (Critical/High):</strong> Address {summary.criticalCount + summary.highRiskCount} priority contradictions
                      </li>
                      <li>
                        <strong>Data Reconciliation:</strong> Verify source data accuracy across all connected platforms
                      </li>
                      <li>
                        <strong>Process Review:</strong> Implement automated checks to prevent future contradictions
                      </li>
                      <li>
                        <strong>Monitoring:</strong> Set up regular contradiction analysis (recommended: weekly)
                      </li>
                    </ol>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-zinc-700 text-zinc-400 hover:text-lime-400"
                  >
                    Generate Detailed Resolution Plan
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
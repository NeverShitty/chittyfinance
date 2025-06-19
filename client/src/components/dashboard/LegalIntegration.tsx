import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Upload,
  Eye,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LegalDocument {
  id: string;
  name: string;
  type: 'contract' | 'agreement' | 'compliance' | 'invoice' | 'tax';
  status: 'pending' | 'reviewed' | 'approved' | 'flagged';
  riskLevel: 'low' | 'medium' | 'high';
  financialImpact: number;
  dueDate?: Date;
  lastReviewed?: Date;
}

export default function LegalIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock legal documents data
  const legalDocuments: LegalDocument[] = [
    {
      id: "1",
      name: "Mercury Bank Service Agreement",
      type: "contract",
      status: "approved",
      riskLevel: "low",
      financialImpact: 2400,
      lastReviewed: new Date(2024, 4, 15)
    },
    {
      id: "2", 
      name: "DoorLoop Property Management Contract",
      type: "agreement",
      status: "pending",
      riskLevel: "medium",
      financialImpact: 15000,
      dueDate: new Date(2024, 5, 30)
    },
    {
      id: "3",
      name: "Q2 Tax Compliance Review",
      type: "compliance",
      status: "flagged",
      riskLevel: "high",
      financialImpact: 45000,
      dueDate: new Date(2024, 5, 15)
    },
    {
      id: "4",
      name: "Stripe Payment Processing Terms",
      type: "contract",
      status: "reviewed",
      riskLevel: "low",
      financialImpact: 800,
      lastReviewed: new Date(2024, 4, 20)
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-lime-500/20 text-lime-400 border-lime-500/30';
      case 'reviewed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'flagged': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-lime-400';
      case 'medium': return 'text-orange-400';
      case 'high': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-lime-400" />;
      case 'reviewed': return <Eye className="h-4 w-4 text-blue-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-400" />;
      case 'flagged': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <FileText className="h-4 w-4 text-zinc-400" />;
    }
  };

  const analyzeDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { analyzed: true, documentId };
    },
    onSuccess: () => {
      toast({
        title: "Document Analyzed",
        description: "Legal AI has analyzed the document for risks and compliance.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/legal/documents"] });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const totalFinancialImpact = legalDocuments.reduce((sum, doc) => sum + doc.financialImpact, 0);
  const highRiskDocs = legalDocuments.filter(doc => doc.riskLevel === 'high').length;
  const pendingDocs = legalDocuments.filter(doc => doc.status === 'pending' || doc.status === 'flagged').length;

  return (
    <Card className="col-span-12 xl:col-span-4 border-zinc-800 bg-zinc-900/80 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-lime-500" />
          <div>
            <CardTitle className="text-lg text-zinc-100">Legal Integration</CardTitle>
            <p className="text-xs text-zinc-500">Contract & Compliance Management</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800 border border-zinc-700">
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
              value="documents" 
              className={cn(
                "text-xs",
                activeTab === "documents" ? "bg-lime-500 text-black" : "text-zinc-400"
              )}
            >
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-lime-400">
                  ${(totalFinancialImpact / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-zinc-500">Financial Impact</div>
              </div>
              <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-red-400">{highRiskDocs}</div>
                <div className="text-xs text-zinc-500">High Risk</div>
              </div>
              <div className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-orange-400">{pendingDocs}</div>
                <div className="text-xs text-zinc-500">Need Review</div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-200 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                Priority Actions
              </h4>
              <div className="space-y-2">
                <div className="bg-zinc-950/40 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Tax Compliance Review</p>
                      <p className="text-xs text-zinc-400">Due June 15, 2024</p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      High Risk
                    </Badge>
                  </div>
                </div>
                <div className="bg-zinc-950/40 border border-orange-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">DoorLoop Contract</p>
                      <p className="text-xs text-zinc-400">Pending review</p>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      Medium Risk
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-zinc-200">Legal Documents</h4>
                <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-400 hover:text-lime-400">
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {legalDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    className="bg-zinc-950/40 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(doc.status)}
                          <h5 className="text-sm font-medium text-zinc-200 truncate">{doc.name}</h5>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span className="capitalize">{doc.type}</span>
                          <span className={getRiskColor(doc.riskLevel)}>
                            {doc.riskLevel} risk
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${(doc.financialImpact / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={cn("text-xs", getStatusColor(doc.status))}>
                          {doc.status}
                        </Badge>
                        {doc.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-lime-400 hover:text-lime-300"
                            onClick={() => analyzeDocumentMutation.mutate(doc.id)}
                            disabled={analyzeDocumentMutation.isPending}
                          >
                            {analyzeDocumentMutation.isPending ? 'Analyzing...' : 'Analyze'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter>
        <div className="w-full">
          <Button className="w-full bg-lime-500 hover:bg-lime-600 text-black">
            <Scale className="h-4 w-4 mr-2" />
            Connect Legal AI Service
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
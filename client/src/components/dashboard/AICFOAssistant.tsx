import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, SendHorizontal } from "lucide-react";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AiMessage } from "@shared/schema";

export default function AICFOAssistant() {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();

  // Fetch latest AI message
  const { data: aiMessage, isLoading } = useQuery<AiMessage>({
    queryKey: ["/api/ai-assistant/latest"],
  });

  // Send query to AI assistant
  const sendQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("POST", "/api/ai-assistant/query", { query });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-assistant/latest"] });
      setQuery("");
    }
  });

  // Generate cost reduction plan
  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai-assistant/generate-plan", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-assistant/latest"] });
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      sendQueryMutation.mutate(query);
    }
  };

  const isLoading2 = sendQueryMutation.isPending || generatePlanMutation.isPending;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">AI CFO Assistant</CardTitle>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
            Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="bg-primary rounded-full h-10 w-10 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">AI CFO: </span>
                  <span>{aiMessage?.content}</span>
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  disabled={isLoading2}
                  onClick={() => generatePlanMutation.mutate()}
                >
                  Generate Plan
                </Button>
                <Button
                  variant="outline"
                  disabled={isLoading2}
                  onClick={() => setQuery("What are my options for improving cash flow?")}
                >
                  Ask Something Else
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <form onSubmit={handleSubmit}>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ask your AI CFO
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <Input
                type="text"
                name="query"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ask about financial projections, cost savings, or investment opportunities..."
                disabled={isLoading2}
              />
              <Button
                type="submit"
                className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 rounded-r-md"
                disabled={isLoading2 || !query.trim()}
              >
                <SendHorizontal className="h-5 w-5" />
                <span>Send</span>
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

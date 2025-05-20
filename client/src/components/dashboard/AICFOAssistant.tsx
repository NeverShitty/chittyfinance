import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, DollarSign } from "lucide-react";

export default function AICFOAssistant() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <Card>
      <Tabs defaultValue="chat" className="w-full" onValueChange={value => setActiveTab(value)}>
        <TabsList className="w-full border-b border-zinc-700 rounded-none p-0">
          <TabsTrigger 
            value="chat" 
            className="data-[state=active]:bg-zinc-800 rounded-none flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat with AI CFO
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            className="data-[state=active]:bg-zinc-800 rounded-none flex-1"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Financial Analysis
          </TabsTrigger>
        </TabsList>

        <CardContent>
          <TabsContent value="chat" className="mt-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Badge>AI CFO</Badge>
                  <div className="bg-zinc-800 rounded-lg p-4 flex-1">
                    <p className="text-zinc-300">
                      Hello! I'm your AI CFO assistant. How can I help you today?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="font-medium text-zinc-200 mb-2">
                  Financial Health Overview
                </h3>
                <p className="text-zinc-400">
                  Your financial metrics indicate a stable position. Would you like me to generate a detailed analysis?
                </p>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
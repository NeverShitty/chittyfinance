import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface IntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const availableIntegrations = [
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect ChittyFinance to 5000+ apps with automated workflows',
    category: 'Automation',
    features: ['Webhook triggers', 'Financial alerts', 'Data sync', 'Custom workflows'],
    icon: 'Z',
    color: 'bg-orange-600'
  },
  {
    id: 'plaid',
    name: 'Plaid',
    description: 'Securely connect bank accounts and credit cards',
    category: 'Banking',
    features: ['Account linking', 'Transaction sync', 'Balance tracking', 'Multi-bank support'],
    icon: 'P',
    color: 'bg-blue-600'
  }
];

export default function IntegrationModal({ open, onOpenChange }: IntegrationModalProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const connectZapierMutation = useMutation({
    mutationFn: async (data: { webhookUrl: string; apiKey: string }) => {
      const response = await fetch('/api/integrations/zapier/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to connect Zapier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      onOpenChange(false);
      setSelectedIntegration(null);
      setFormData({});
    }
  });

  const connectPlaidMutation = useMutation({
    mutationFn: async (data: { clientId: string; secret: string; environment: string }) => {
      const response = await fetch('/api/integrations/plaid/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to connect Plaid');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      onOpenChange(false);
      setSelectedIntegration(null);
      setFormData({});
    }
  });

  const handleConnect = async () => {
    if (selectedIntegration === 'zapier') {
      await connectZapierMutation.mutateAsync({
        webhookUrl: formData.webhookUrl,
        apiKey: formData.apiKey
      });
    } else if (selectedIntegration === 'plaid') {
      await connectPlaidMutation.mutateAsync({
        clientId: formData.clientId,
        secret: formData.secret,
        environment: formData.environment || 'sandbox'
      });
    }
  };

  const integration = availableIntegrations.find(i => i.id === selectedIntegration);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Integration</DialogTitle>
          <DialogDescription>
            Connect ChittyFinance to your favorite tools and services.
          </DialogDescription>
        </DialogHeader>

        {!selectedIntegration ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {availableIntegrations.map((integration) => (
              <Card 
                key={integration.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedIntegration(integration.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`h-12 w-12 rounded-md ${integration.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-xl">{integration.icon}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{integration.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">
                    {integration.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`h-12 w-12 rounded-md ${integration?.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">{integration?.icon}</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{integration?.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{integration?.description}</p>
              </div>
            </div>

            {selectedIntegration === 'zapier' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={formData.webhookUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  />
                  <p className="text-sm text-gray-500">
                    Create a Zapier webhook trigger and paste the URL here.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key (Optional)</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Your Zapier API key for enhanced features"
                    value={formData.apiKey || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {selectedIntegration === 'plaid' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    placeholder="Your Plaid Client ID"
                    value={formData.clientId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret Key</Label>
                  <Input
                    id="secret"
                    type="password"
                    placeholder="Your Plaid Secret Key"
                    value={formData.secret || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select value={formData.environment || 'sandbox'} onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                Back
              </Button>
              <Button 
                onClick={handleConnect}
                disabled={connectZapierMutation.isPending || connectPlaidMutation.isPending}
              >
                {(connectZapierMutation.isPending || connectPlaidMutation.isPending) ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
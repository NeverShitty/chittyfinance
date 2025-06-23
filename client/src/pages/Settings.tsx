import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Integration, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getServiceColor, getServiceIcon } from "@/lib/utils";
import IntegrationModal from "@/components/integrations/IntegrationModal";
import { useState } from "react";
import React from "react";

export default function Settings() {
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [profileData, setProfileData] = useState({ displayName: '', email: '', role: '' });
  const [preferences, setPreferences] = useState({
    financialAlerts: true,
    invoiceReminders: true,
    aiInsights: true,
    accountActivity: true
  });
  const queryClient = useQueryClient();

  // Get user data
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/session"],
  });

  // Get integrations
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
  });

  // Get user preferences
  const { data: userPreferences } = useQuery({
    queryKey: ["/api/user/preferences"],
  });

  // Update profile data when user data loads
  React.useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        role: user.role || ''
      });
    }
  }, [user]);

  // Update preferences when they load
  React.useEffect(() => {
    if (userPreferences?.data) {
      setPreferences(userPreferences.data);
    }
  }, [userPreferences]);

  // Save profile changes
  const saveProfileMutation = useMutation({
    mutationFn: async (data: { displayName: string; email: string; role: string }) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/session'] });
    }
  });

  // Save preferences
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: typeof preferences) => {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
    }
  });

  // Toggle integration connection
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ serviceType, connected }: { serviceType: string; connected: boolean }) => {
      if (!connected) {
        const response = await fetch(`/api/integrations/${serviceType}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to disconnect integration');
        return response.json();
      }
      // For connecting, we'll redirect to the integration modal
      setShowIntegrationModal(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    }
  });

  const handleSaveProfile = () => {
    saveProfileMutation.mutate(profileData);
  };

  const handleSavePreferences = () => {
    savePreferencesMutation.mutate(preferences);
  };

  const handleConfigureIntegration = (integration: Integration) => {
    // For now, just show a message. In the future, this could open a config modal
    alert(`Configure ${integration.name} - Feature coming soon!`);
  };

  return (
    <div className="py-6">
      {/* Page Header */}
      <div className="px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Settings
        </h1>
        
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Configure your account, integrations, and preferences.</span>
        </div>
      </div>

      {/* Settings Content */}
      <div className="px-4 sm:px-6 md:px-8 mt-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:flex md:space-x-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your account information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingUser ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input 
                        id="name" 
                        value={profileData.displayName} 
                        onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Your email" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input 
                        id="role" 
                        value={profileData.role}
                        onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Your role" 
                      />
                    </div>
                    <div className="pt-4">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={saveProfileMutation.isPending}
                      >
                        {saveProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Integrations</CardTitle>
                <CardDescription>
                  Manage connections to your financial services and productivity tools.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingIntegrations ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-md" />
                    <Skeleton className="h-16 w-full rounded-md" />
                    <Skeleton className="h-16 w-full rounded-md" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {integrations?.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between border p-4 rounded-md">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-md ${getServiceColor(integration.serviceType)} flex items-center justify-center mr-3`}>
                            <span className="text-white font-bold text-lg">{getServiceIcon(integration.serviceType)}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{integration.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{integration.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id={`integration-${integration.id}`} 
                              checked={integration.connected ?? false}
                              onCheckedChange={(checked) => 
                                toggleIntegrationMutation.mutate({ 
                                  serviceType: integration.serviceType, 
                                  connected: checked 
                                })
                              }
                            />
                            <Label htmlFor={`integration-${integration.id}`}>
                              {integration.connected ? "Connected" : "Disconnected"}
                            </Label>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={!integration.connected}
                            onClick={() => handleConfigureIntegration(integration)}
                          >
                            Configure
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => setShowIntegrationModal(true)}
                    >
                      Add New Integration
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control when and how you want to be notified.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Financial Alerts</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive alerts for unusual financial activity.
                      </p>
                    </div>
                    <Switch 
                      id="financial-alerts" 
                      checked={preferences.financialAlerts}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, financialAlerts: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Invoice Reminders</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified when invoices are coming due.
                      </p>
                    </div>
                    <Switch 
                      id="invoice-reminders" 
                      checked={preferences.invoiceReminders}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, invoiceReminders: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">AI CFO Insights</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Proactive financial advice from your AI assistant.
                      </p>
                    </div>
                    <Switch 
                      id="ai-insights" 
                      checked={preferences.aiInsights}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, aiInsights: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Account Activity</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Be notified about significant account activity.
                      </p>
                    </div>
                    <Switch 
                      id="account-activity" 
                      checked={preferences.accountActivity}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, accountActivity: checked }))}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleSavePreferences}
                      disabled={savePreferencesMutation.isPending}
                    >
                      {savePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <IntegrationModal 
        open={showIntegrationModal} 
        onOpenChange={setShowIntegrationModal} 
      />
    </div>
  );
}

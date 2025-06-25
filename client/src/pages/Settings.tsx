import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Integration, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getServiceColor, getServiceIcon } from "@/lib/utils";

export default function Settings() {
  // Get user data
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/session"],
  });

  // Get integrations
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
  });

  return (
    <div className="py-6">
      {/* Page Header */}
      <div className="px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold gradient-text">
          Make It Less Sh*tty
        </h1>
        
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Tweak everything until it's just right. No sh*tty defaults here!</span>
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
                <CardTitle>Your Non-Sh*tty Profile</CardTitle>
                <CardDescription>
                  Make yourself look good. We won't judge.
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
                      <Input id="name" defaultValue={user?.displayName} placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email} placeholder="Your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue={user?.role} placeholder="Your role" />
                    </div>
                    <div className="pt-4">
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">Make It Official</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Money Connections</CardTitle>
                <CardDescription>
                  Hook up all your financial sh*t in one place. We play nice with everyone.
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
                            <Switch id={`integration-${integration.id}`} checked={integration.connected ?? false} />
                            <Label htmlFor={`integration-${integration.id}`}>
                              {integration.connected ? "Connected" : "Disconnected"}
                            </Label>
                          </div>
                          <Button variant="outline" size="sm" className="hover:bg-orange-50 dark:hover:bg-orange-950/30">Tweak It</Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
                      Hook Up More Services
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Settings That Don't Suck</CardTitle>
                <CardDescription>
                  We'll only bug you when it's actually important. Promise.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Financial Alerts</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        We'll let you know when sh*t gets weird.
                      </p>
                    </div>
                    <Switch id="financial-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Invoice Reminders</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Never forget to get paid. That would be sh*tty.
                      </p>
                    </div>
                    <Switch id="invoice-reminders" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">AI CFO Insights</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your AI buddy's non-sh*tty money tips.
                      </p>
                    </div>
                    <Switch id="ai-insights" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Account Activity</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Know when big sh*t happens in your accounts.
                      </p>
                    </div>
                    <Switch id="account-activity" defaultChecked />
                  </div>
                  
                  <div className="pt-4">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">Lock It In</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

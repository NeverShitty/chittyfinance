import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useUser } from '@/contexts/UserContext';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import NavigationV2 from './NavigationV2';
import { 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  Moon, 
  Sun, 
  Search,
  Activity,
  ChevronDown,
  Zap,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface AppLayoutV2Props {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function AppLayoutV2({ children }: AppLayoutV2Props) {
  const [location, setLocation] = useLocation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Transaction Processed',
      message: 'Your DeFi yield has been claimed successfully',
      timestamp: new Date(Date.now() - 300000),
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Budget Alert',
      message: 'You\'ve reached 80% of your monthly marketing budget',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Market Update',
      message: 'CHITTY price increased by 5.2% in the last 24h',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    }
  ]);
  const { user, isLoading } = useUser();

  // Don't show layout on login page
  if (location === '/login' || location === '/register') {
    return <>{children}</>;
  }

  // Breadcrumb generation
  const getBreadcrumbs = () => {
    const pathSegments = location.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      breadcrumbs.push({
        label,
        path: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex h-screen">
        {/* Navigation Sidebar */}
        <div className={`transition-all duration-300 ${isNavCollapsed ? 'w-16' : 'w-64'}`}>
          <NavigationV2 
            isCollapsed={isNavCollapsed}
            onToggle={() => setIsNavCollapsed(!isNavCollapsed)}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <Card className="bg-slate-900/95 border-slate-800 backdrop-blur-sm rounded-none border-l-0 border-t-0 border-r-0">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-4">
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.path}>
                          <BreadcrumbItem>
                            {crumb.isLast ? (
                              <BreadcrumbPage className="text-white font-medium">
                                {crumb.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink 
                                onClick={() => setLocation(crumb.path)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                              >
                                {crumb.label}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-4">
                  {/* Quick Stats */}
                  <div className="hidden lg:flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-slate-300">$125,432</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <span className="text-slate-300">+2.5%</span>
                      </div>
                    </div>
                  </div>

                  {/* Global Search */}
                  <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search transactions, wallets..."
                      className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-64"
                    />
                  </div>

                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative text-slate-300 hover:text-white">
                        <Bell className="h-4 w-4" />
                        {unreadNotifications > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                          >
                            {unreadNotifications}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-800">
                      <div className="p-4 border-b border-slate-800">
                        <h3 className="font-medium text-white">Notifications</h3>
                        <p className="text-sm text-slate-400">{unreadNotifications} unread</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem key={notification.id} className="p-4 border-b border-slate-800 last:border-b-0">
                            <div className="w-full">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{notification.title}</p>
                                  <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                                  <p className="text-xs text-slate-500 mt-2">
                                    {notification.timestamp.toLocaleTimeString()}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                                )}
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                      <div className="p-2 border-t border-slate-800">
                        <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-white">
                          View All Notifications
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 text-slate-300 hover:text-white">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-slate-700 text-white">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block text-left">
                          <p className="text-sm font-medium">{user?.displayName || 'User'}</p>
                          <p className="text-xs text-slate-400">{user?.role || 'Member'}</p>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
                      <DropdownMenuItem onClick={() => setLocation('/settings/profile')}>
                        <User className="h-4 w-4 mr-2" />
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/settings')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Preferences
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-800" />
                      <DropdownMenuItem>
                        <Activity className="h-4 w-4 mr-2" />
                        Activity Log
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Zap className="h-4 w-4 mr-2" />
                        API Keys
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-800" />
                      <DropdownMenuItem className="text-red-400">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </Card>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="text-white">Loading...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
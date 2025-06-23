import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  CreditCard, 
  Bot, 
  Settings, 
  Coins,
  PieChart,
  FileText,
  Users,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Shield,
  Calculator,
  Target,
  Zap,
  Activity
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string | number;
  isNew?: boolean;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard-v2',
    badge: 'Live'
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: CreditCard,
    path: '/transactions-v2',
    children: [
      { id: 'all-transactions', label: 'All Transactions', icon: CreditCard, path: '/transactions-v2' },
      { id: 'recurring', label: 'Recurring Payments', icon: Activity, path: '/transactions/recurring' },
      { id: 'categories', label: 'Categories', icon: PieChart, path: '/transactions/categories' }
    ]
  },
  {
    id: 'blockchain',
    label: 'ChittyChain',
    icon: Coins,
    path: '/blockchain',
    isNew: true,
    children: [
      { id: 'portfolio', label: 'Portfolio', icon: PieChart, path: '/blockchain/portfolio' },
      { id: 'defi', label: 'DeFi Positions', icon: TrendingUp, path: '/blockchain/defi' },
      { id: 'nfts', label: 'NFT Collection', icon: Zap, path: '/blockchain/nfts' },
      { id: 'staking', label: 'Staking Rewards', icon: Shield, path: '/blockchain/staking' }
    ]
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistants',
    icon: Bot,
    path: '/ai-assistant-v2',
    isNew: true,
    children: [
      { id: 'bookkeeper', label: 'ChittyBookkeeper', icon: Calculator, path: '/ai/bookkeeper' },
      { id: 'trader', label: 'ChittyTrader', icon: TrendingUp, path: '/ai/trader' },
      { id: 'auditor', label: 'ChittyAuditor', icon: Shield, path: '/ai/auditor' },
      { id: 'planner', label: 'ChittyPlanner', icon: Target, path: '/ai/planner' }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    path: '/reports',
    children: [
      { id: 'financial', label: 'Financial Reports', icon: FileText, path: '/reports/financial' },
      { id: 'tax', label: 'Tax Reports', icon: Calculator, path: '/reports/tax' },
      { id: 'compliance', label: 'Compliance', icon: Shield, path: '/reports/compliance' }
    ]
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    path: '/team',
    children: [
      { id: 'members', label: 'Team Members', icon: Users, path: '/team/members' },
      { id: 'permissions', label: 'Permissions', icon: Shield, path: '/team/permissions' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    children: [
      { id: 'profile', label: 'Profile', icon: Users, path: '/settings/profile' },
      { id: 'integrations', label: 'Integrations', icon: Zap, path: '/settings/integrations' },
      { id: 'notifications', label: 'Notifications', icon: Bell, path: '/settings/notifications' }
    ]
  }
];

interface NavigationV2Props {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function NavigationV2({ isCollapsed = false, onToggle }: NavigationV2Props) {
  const [location, setLocation] = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['dashboard']));

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '/');
  };

  const isParentActive = (item: NavigationItem) => {
    if (isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  return (
    <Card className={`
      bg-slate-900/95 border-slate-800 backdrop-blur-sm h-full flex flex-col
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-white">Chitty CFO</h2>
              <p className="text-xs text-slate-400">V2 Platform</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-slate-400 hover:text-white"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Quick Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isParentActive(item)}
              isExpanded={expandedItems.has(item.id)}
              onToggleExpanded={() => toggleExpanded(item.id)}
              onNavigate={setLocation}
            />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        {!isCollapsed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Network Status</span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Activity className="h-2 w-2 mr-1" />
                Live
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ChittyChain</span>
              <span className="text-green-400">Connected</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

interface NavigationItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onNavigate: (path: string) => void;
  level?: number;
}

function NavigationItem({
  item,
  isCollapsed,
  isActive,
  isExpanded,
  onToggleExpanded,
  onNavigate,
  level = 0
}: NavigationItemProps) {
  const [location] = useLocation();
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren && !isCollapsed) {
      onToggleExpanded();
    } else {
      onNavigate(item.path);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={handleClick}
        className={`
          w-full justify-start text-left h-auto p-2
          ${isActive 
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }
          ${level > 0 ? 'ml-4' : ''}
        `}
      >
        <div className="flex items-center w-full">
          <Icon className="h-4 w-4 flex-shrink-0" />
          
          {!isCollapsed && (
            <>
              <span className="ml-3 flex-1 text-sm font-medium">{item.label}</span>
              
              {item.isNew && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  New
                </Badge>
              )}
              
              {item.badge && !item.isNew && (
                <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                  {item.badge}
                </Badge>
              )}
              
              {hasChildren && (
                <ChevronRight className={`h-4 w-4 ml-2 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`} />
              )}
            </>
          )}
        </div>
      </Button>

      {/* Child Items */}
      {hasChildren && !isCollapsed && isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {item.children!.map((child) => (
            <Button
              key={child.id}
              variant="ghost"
              onClick={() => onNavigate(child.path)}
              className={`
                w-full justify-start text-left h-auto p-2
                ${location === child.path
                  ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }
              `}
            >
              <child.icon className="h-3 w-3 flex-shrink-0" />
              <span className="ml-3 text-sm">{child.label}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
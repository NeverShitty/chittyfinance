import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  BarChart3, 
  Coins,
  Target,
  Bell,
  Zap,
  Shield,
  Activity,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PortfolioSummary {
  totalValueUSD: number;
  totalValueCHITTY: string;
  dayChange: number;
  dayChangePercent: number;
  breakdown: {
    wallets: number;
    defi: number;
    nfts: number;
    staking: number;
  };
  topHoldings: Array<{
    symbol: string;
    name: string;
    balance: string;
    valueUSD: number;
    percentage: number;
  }>;
}

interface DashboardMetrics {
  portfolio: PortfolioSummary;
  recentTransactions: Array<{
    hash: string;
    type: 'send' | 'receive' | 'swap' | 'stake';
    amount: string;
    token: string;
    valueUSD: number;
    timestamp: number;
    status: string;
  }>;
  defiEarnings: {
    totalEarned: number;
    dailyEarnings: number;
    topPositions: Array<{
      protocol: string;
      position: string;
      apy: number;
      valueUSD: number;
    }>;
  };
  stakingRewards: {
    totalStaked: string;
    totalRewards: string;
    pendingRewards: string;
    averageAPY: number;
  };
  alerts: Array<{
    type: 'price' | 'transaction' | 'defi' | 'staking';
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: number;
  }>;
}

export default function DashboardV2() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/v2/dashboard/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: performance } = useQuery({
    queryKey: ['/api/v2/portfolio/performance', selectedTimeframe],
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const portfolio = metrics?.portfolio;
  const isPositiveChange = (portfolio?.dayChangePercent || 0) >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Portfolio Dashboard
            </h1>
            <p className="text-slate-400">
              Track your traditional and crypto finances in one place
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-slate-700 text-slate-300"
              onClick={() => window.open('https://explorer.chittychain.io', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              ChittyChain Explorer
            </Button>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(portfolio?.totalValueUSD || 0)}
                  </p>
                  <div className="flex items-center mt-2">
                    {isPositiveChange ? (
                      <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                    )}
                    <span className={`text-sm ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
                      {Math.abs(portfolio?.dayChangePercent || 0).toFixed(2)}% (24h)
                    </span>
                  </div>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Wallet className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">DeFi Earnings</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(metrics?.defiEarnings.totalEarned || 0)}
                  </p>
                  <p className="text-sm text-green-400 mt-2">
                    +{formatCurrency(metrics?.defiEarnings.dailyEarnings || 0)}/day
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Staking Rewards</p>
                  <p className="text-2xl font-bold text-white">
                    {metrics?.stakingRewards.totalRewards || '0'} CHITTY
                  </p>
                  <p className="text-sm text-blue-400 mt-2">
                    {metrics?.stakingRewards.averageAPY || 0}% APY
                  </p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Alerts</p>
                  <p className="text-2xl font-bold text-white">
                    {metrics?.alerts.length || 0}
                  </p>
                  <p className="text-sm text-orange-400 mt-2">
                    Requires attention
                  </p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Bell className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Portfolio Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(portfolio?.breakdown || {}).map(([key, value]) => {
                    const percentage = ((value / (portfolio?.totalValueUSD || 1)) * 100);
                    const colors = {
                      wallets: 'bg-blue-500',
                      defi: 'bg-green-500',
                      nfts: 'bg-purple-500',
                      staking: 'bg-orange-500'
                    };
                    
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${colors[key as keyof typeof colors]} mr-3`} />
                          <span className="text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{formatCurrency(value)}</p>
                          <p className="text-slate-400 text-sm">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.recentTransactions.map((tx) => (
                    <div key={tx.hash} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          tx.type === 'receive' ? 'bg-green-500/20' : 
                          tx.type === 'send' ? 'bg-red-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          {tx.type === 'receive' ? (
                            <ArrowDownRight className="h-4 w-4 text-green-400" />
                          ) : tx.type === 'send' ? (
                            <ArrowUpRight className="h-4 w-4 text-red-400" />
                          ) : (
                            <Zap className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">{tx.type}</p>
                          <p className="text-slate-400 text-sm">
                            {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {tx.amount} {tx.token}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {formatCurrency(tx.valueUSD)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Holdings */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Coins className="h-5 w-5 mr-2" />
                  Top Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolio?.topHoldings.slice(0, 5).map((holding, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-bold">
                            {holding.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{holding.symbol}</p>
                          <p className="text-slate-400 text-sm">{holding.balance}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white">{formatCurrency(holding.valueUSD)}</p>
                        <p className="text-slate-400 text-sm">{holding.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* DeFi Positions */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  DeFi Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.defiEarnings.topPositions.map((position, index) => (
                    <div key={index} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-medium">{position.protocol}</p>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          {position.apy.toFixed(1)}% APY
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{position.position}</p>
                      <p className="text-white font-medium">{formatCurrency(position.valueUSD)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.alerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-start">
                        <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                          alert.severity === 'info' ? 'bg-blue-400' :
                          alert.severity === 'warning' ? 'bg-orange-400' :
                          'bg-red-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white text-sm">{alert.message}</p>
                          <p className="text-slate-400 text-xs mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-64 mb-2"></div>
          <div className="h-4 bg-slate-800 rounded w-96"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-24 mb-2"></div>
                <div className="h-6 bg-slate-800 rounded w-32 mb-2"></div>
                <div className="h-3 bg-slate-800 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Coins,
  Shield,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionV2 {
  id: string;
  hash?: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  tags: string[];
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'confirmed' | 'cancelled';
  source: string;
  date: Date;
  merchant?: string;
  location?: {
    city?: string;
    country?: string;
  };
  metadata?: {
    chittyAmount?: string;
    gasUsed?: string;
    blockNumber?: number;
  };
}

interface FilterState {
  search: string;
  type: string;
  category: string;
  source: string;
  status: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  amountRange: {
    min: string;
    max: string;
  };
}

export default function TransactionsV2() {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    category: 'all',
    source: 'all',
    status: 'all',
    dateRange: { from: undefined, to: undefined },
    amountRange: { min: '', max: '' }
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: transactions, isLoading, refetch } = useQuery<TransactionV2[]>({
    queryKey: ['/api/v2/transactions', filters, sortBy, sortOrder],
    refetchInterval: 30000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/v2/transactions/analytics', filters],
  });

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    let filtered = transactions.filter(tx => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!tx.title.toLowerCase().includes(searchLower) &&
            !tx.description?.toLowerCase().includes(searchLower) &&
            !tx.merchant?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Type filter
      if (filters.type !== 'all' && tx.type !== filters.type) return false;

      // Category filter
      if (filters.category !== 'all' && tx.category !== filters.category) return false;

      // Source filter
      if (filters.source !== 'all' && tx.source !== filters.source) return false;

      // Status filter
      if (filters.status !== 'all' && tx.status !== filters.status) return false;

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const txDate = new Date(tx.date);
        if (filters.dateRange.from && txDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && txDate > filters.dateRange.to) return false;
      }

      // Amount range filter
      if (filters.amountRange.min || filters.amountRange.max) {
        const amount = Math.abs(tx.amount);
        if (filters.amountRange.min && amount < parseFloat(filters.amountRange.min)) return false;
        if (filters.amountRange.max && amount > parseFloat(filters.amountRange.max)) return false;
      }

      return true;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [transactions, filters, sortBy, sortOrder]);

  const categories = useMemo(() => {
    if (!transactions) return [];
    return Array.from(new Set(transactions.map(tx => tx.category)));
  }, [transactions]);

  const sources = useMemo(() => {
    if (!transactions) return [];
    return Array.from(new Set(transactions.map(tx => tx.source)));
  }, [transactions]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      source: 'all',
      status: 'all',
      dateRange: { from: undefined, to: undefined },
      amountRange: { min: '', max: '' }
    });
  };

  const exportTransactions = () => {
    // Mock export functionality
    console.log('Exporting transactions...', filteredTransactions);
  };

  if (isLoading) {
    return <TransactionsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Transaction History
            </h1>
            <p className="text-slate-400">
              Track all your traditional and blockchain transactions
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="border-slate-700 text-slate-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportTransactions}
              className="border-slate-700 text-slate-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Transactions</p>
                  <p className="text-2xl font-bold text-white">
                    {filteredTransactions.length}
                  </p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Coins className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Income</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(
                      filteredTransactions
                        .filter(tx => tx.type === 'income')
                        .reduce((sum, tx) => sum + tx.amount, 0)
                    )}
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
                  <p className="text-slate-400 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(
                      Math.abs(filteredTransactions
                        .filter(tx => tx.type === 'expense')
                        .reduce((sum, tx) => sum + tx.amount, 0))
                    )}
                  </p>
                </div>
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Blockchain Txs</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {filteredTransactions.filter(tx => tx.source === 'chittychain').length}
                  </p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* Type Filter */}
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Source Filter */}
              <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-slate-800 border-slate-700 text-white justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to,
                    }}
                    onSelect={(range) => handleFilterChange('dateRange', range || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {/* Amount Range */}
              <div className="flex gap-2">
                <Input
                  placeholder="Min amount"
                  type="number"
                  value={filters.amountRange.min}
                  onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, min: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Input
                  placeholder="Max amount"
                  type="number"
                  value={filters.amountRange.max}
                  onChange={(e) => handleFilterChange('amountRange', { ...filters.amountRange, max: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* Clear Filters */}
              <Button variant="outline" onClick={clearFilters} className="border-slate-700 text-slate-300">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">
                Transactions ({filteredTransactions.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="border-slate-700 text-slate-300"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400">No transactions found matching your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: TransactionV2 }) {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'income':
        return <ArrowDownRight className="h-4 w-4 text-green-400" />;
      case 'expense':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      default:
        return <Zap className="h-4 w-4 text-blue-400" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          transaction.type === 'income' ? 'bg-green-500/20' :
          transaction.type === 'expense' ? 'bg-red-500/20' :
          'bg-blue-500/20'
        }`}>
          {getTransactionIcon()}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white font-medium truncate">{transaction.title}</p>
            {transaction.hash && (
              <ExternalLink className="h-3 w-3 text-slate-400 cursor-pointer hover:text-white" />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{transaction.category}</span>
            {transaction.merchant && (
              <>
                <span>•</span>
                <span>{transaction.merchant}</span>
              </>
            )}
            <span>•</span>
            <span>{transaction.source}</span>
          </div>
          
          {transaction.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {transaction.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-right space-y-1">
        <div className="flex items-center gap-2">
          <p className={`text-lg font-semibold ${
            transaction.type === 'income' ? 'text-green-400' :
            transaction.type === 'expense' ? 'text-red-400' :
            'text-blue-400'
          }`}>
            {transaction.type === 'expense' ? '-' : ''}
            {formatCurrency(Math.abs(transaction.amount))}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor()}>
            {transaction.status}
          </Badge>
        </div>
        
        <p className="text-xs text-slate-400">
          {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
        </p>
        
        {transaction.metadata?.chittyAmount && (
          <p className="text-xs text-purple-400">
            {parseFloat(transaction.metadata.chittyAmount).toFixed(4)} CHITTY
          </p>
        )}
      </div>
    </div>
  );
}

function TransactionsSkeleton() {
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
                <div className="h-6 bg-slate-800 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
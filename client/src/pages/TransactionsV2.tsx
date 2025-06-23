import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Transaction } from '@shared/schema';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Download, 
  Filter, 
  Search, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Extended transaction type for V2
interface TransactionV2 extends Transaction {
  status: 'completed' | 'pending' | 'failed';
  hash?: string;
  fee?: number;
  balance?: number;
}

export default function TransactionsV2() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    source: 'all',
    status: 'all',
    dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined },
    amountRange: { min: '', max: '' }
  });

  // Get transactions data
  const { data: transactions, isLoading } = useQuery<TransactionV2[]>({
    queryKey: ["/api/transactions"],
  });

  const itemsPerPage = 20;

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filters.type === 'all' || transaction.type === filters.type;
      const matchesCategory = filters.category === 'all' || transaction.category === filters.category;
      const matchesSource = filters.source === 'all' || transaction.source === filters.source;
      const matchesStatus = filters.status === 'all' || (transaction as TransactionV2).status === filters.status;
      
      const matchesDateRange = !filters.dateRange.from || !filters.dateRange.to || 
        (new Date(transaction.date) >= filters.dateRange.from && new Date(transaction.date) <= filters.dateRange.to);
      
      const amount = Math.abs(transaction.amount);
      const matchesAmountRange = (!filters.amountRange.min || amount >= parseFloat(filters.amountRange.min)) &&
                               (!filters.amountRange.max || amount <= parseFloat(filters.amountRange.max));
      
      return matchesSearch && matchesType && matchesCategory && matchesSource && matchesStatus && matchesDateRange && matchesAmountRange;
    });
  }, [transactions, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary calculations
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netFlow = totalIncome - totalExpenses;

  const resetFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      source: 'all',
      status: 'all',
      dateRange: { from: undefined, to: undefined },
      amountRange: { min: '', max: '' }
    });
  };

  const exportTransactions = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    const csvHeaders = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Source', 'Status'];
    const csvData = filteredTransactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.source,
      (transaction as TransactionV2).status
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <TransactionsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
            <p className="text-slate-400 mt-1">
              Comprehensive view of all your financial transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-slate-700 text-slate-300"
              onClick={exportTransactions}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Income</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Net Flow</p>
                  <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(netFlow)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Filters & Search</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Business Services">Business Services</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Office Expenses">Office Expenses</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="mercury">Mercury</SelectItem>
                  <SelectItem value="plaid">Plaid</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                Transactions ({filteredTransactions.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paginatedTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction as TransactionV2} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
                  {filteredTransactions.length} transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-slate-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface TransactionRowProps {
  transaction: TransactionV2;
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
      <div className="flex items-center space-x-4">
        <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`} />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white">{transaction.description}</h3>
            {transaction.hash && (
              <ExternalLink className="h-3 w-3 text-slate-400 cursor-pointer" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{formatDate(transaction.date)}</span>
            <span>•</span>
            <span>{transaction.category}</span>
            <span>•</span>
            <span>{transaction.source}</span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(transaction.status)}>
            {transaction.status}
          </Badge>
          <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(Math.abs(transaction.amount))}
          </span>
        </div>
        {transaction.fee && (
          <div className="text-xs text-slate-500">
            Fee: {formatCurrency(transaction.fee)}
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-slate-800 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="h-16 bg-slate-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
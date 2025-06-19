import { TrendingDown, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Transaction } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { ListCard } from "@/components/common/ListCard";

export default function RecentTransactions() {
  const [, setLocation] = useLocation();
  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { limit: 3 }],
  });

  const renderTransaction = (transaction: Transaction) => {
    const isIncome = transaction.amount > 0;

    return (
      <div className="flex items-center space-x-4 py-3">
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700">
            {isIncome ? (
              <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {transaction.title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {transaction.description}
          </p>
        </div>
        <div>
          <div className={`inline-flex items-center text-base font-semibold font-mono ${
            isIncome ? 'text-green-500' : 'text-red-500'
          }`}>
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ListCard
      title="Recent Transactions"
      items={transactions}
      isLoading={isLoading}
      error={error}
      renderItem={renderTransaction}
      keyExtractor={(transaction) => transaction.id}
      emptyMessage="No recent transactions"
      viewAllText="View All Transactions"
      onViewAll={() => setLocation('/transactions')}
      className="overflow-hidden"
    />
  );
}
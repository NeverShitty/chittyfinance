import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

interface ListCardProps<T> {
  title: string;
  items?: T[];
  isLoading?: boolean;
  error?: Error | null;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  viewAllText?: string;
  onViewAll?: () => void;
  skeletonCount?: number;
  className?: string;
}

export function ListCard<T>({
  title,
  items,
  isLoading = false,
  error = null,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items to display',
  viewAllText = 'View all',
  onViewAll,
  skeletonCount = 3,
  className = ''
}: ListCardProps<T>) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <ListSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>Failed to load {title.toLowerCase()}</p>
          <p className="text-sm mt-1">Please try again later</p>
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={keyExtractor(item, index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {onViewAll && items && items.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewAll}
            className="h-8 px-2 lg:px-3"
          >
            {viewAllText}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
      <Skeleton className="h-4 w-[80px]" />
    </div>
  );
}
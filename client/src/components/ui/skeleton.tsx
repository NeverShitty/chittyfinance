import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton rounded-xl", className)}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-800/40 bg-slate-900/40 backdrop-blur-sm p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  )
}

function SkeletonButton() {
  return <Skeleton className="h-11 w-24 rounded-xl" />
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i}
          className={cn(
            "h-4 rounded-lg",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonButton, SkeletonText }

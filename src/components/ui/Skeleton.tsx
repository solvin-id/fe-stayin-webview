import { cn } from '@/lib/utils';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-slate-200/80', className)} />
);

export const RoomCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
    <Skeleton className="h-44 w-full rounded-none" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>
      <div className="flex items-end justify-between pt-2">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);

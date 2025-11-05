import { ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, iconClassName, textClassName }: { className?: string; iconClassName?: string; textClassName?: string; }) {
  return (
    <div className={cn("flex items-center gap-2 font-bold", className)}>
      <ArrowRightLeft className={cn("h-6 w-6 text-primary", iconClassName)} />
      <h1 className={cn("text-xl text-primary", textClassName)}>TimeSwap</h1>
    </div>
  );
}

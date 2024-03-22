import { Skeleton } from 'antd';
import { cn } from '@/common/cn';

export default function SkeletonTW({ className }: { className?: string }) {
    return <Skeleton.Button active={true} size={'small'} className={cn('!min-w-0', className)} />;
}

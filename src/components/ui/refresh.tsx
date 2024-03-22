import { cn } from '@/common/cn';
import YukuIcon from './yuku-icon';

export default function Refresh({
    className,
    onClick,
    control,
}: {
    className?: string;
    onClick: () => void;
    control: boolean;
}) {
    return (
        <YukuIcon
            name="action-refresh"
            color="white"
            size={20}
            className={cn('w-5', className, control && 'animate-spin')}
            onClick={onClick}
        />
    );
}

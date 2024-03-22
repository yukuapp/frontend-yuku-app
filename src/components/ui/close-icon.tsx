import { MouseEventHandler } from 'react';
import { cn } from '@/common/cn';
import YukuIcon from './yuku-icon';

export default function CloseIcon({
    onClick,
    className,
}: {
    onClick?: MouseEventHandler<HTMLDivElement>;
    className?: string;
}) {
    return (
        <div onClick={onClick} className={cn('group flex cursor-pointer', className)}>
            <YukuIcon
                name="action-close"
                color="grey"
                className="m-auto block w-full group-hover:hidden"
            />
            <YukuIcon
                name="action-close"
                color="white"
                className="m-auto hidden w-full group-hover:block"
            />
        </div>
    );
}

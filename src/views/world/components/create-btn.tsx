import { cn } from '@/common/cn';

export default function CreateBtn({
    onClick,
    className,
}: {
    onClick: () => void;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'animateBtn flex h-12 w-[131px] cursor-pointer items-center justify-between rounded-[10px] px-4 font-inter-semibold text-xl',
                className,
            )}
            onClick={onClick}
        >
            <img src={'/img/world/create-icon.svg'} alt="" /> <div>Create</div>
        </div>
    );
}

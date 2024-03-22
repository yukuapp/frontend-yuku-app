import { cn } from '@/common/cn';

export default function Empty() {
    return (
        <div className={cn('mt-[20vh] flex w-full justify-center')}>
            <img className="h-10 w-10 " src="/img/home/empty-icon.svg" alt="" />
        </div>
    );
}

import { cn } from '@/common/cn';
import type { ModelAvatar } from './avatar';

const LeftAvatars = ({
    item,
    idx,
    onUseAvatar,
    avatarIdx,
}: {
    item: ModelAvatar;
    idx: number;
    onUseAvatar: () => void;
    avatarIdx: number;
}) => {
    return (
        <div className="group flex flex-col items-center justify-start">
            <div
                key={item.id}
                onClick={() => onUseAvatar()}
                className={cn(
                    'relative mt-[10px] flex h-[35p] w-[35px] cursor-pointer items-center justify-center rounded-full md:h-[100px] md:w-[100px]',
                )}
            >
                <img
                    className={cn(
                        'transition-all duration-300 group-hover:opacity-100',
                        avatarIdx !== idx ? 'opacity-0' : 'opacity-100',
                    )}
                    src="/img/world/circle-bg.svg"
                    alt=""
                />
                <img
                    src="/img/world/right-arrow.svg"
                    alt=""
                    className={cn(
                        'absolute h-[10px] w-[10px] transition-all duration-500 md:h-[18px] md:w-[18px]',
                        avatarIdx !== idx
                            ? 'left-[-28px] opacity-0 md:left-[-50px]'
                            : 'left-[-14px] opacity-100 md:left-[-25px]',
                    )}
                />
                <div
                    className={cn(
                        'absolute left-[10%] top-[10%] h-[80%] w-[80%] transition-all duration-300 group-hover:scale-105',
                    )}
                >
                    <img src={item.src} alt="" className="rounded-full bg-slate-50" />
                </div>
            </div>
            <div className="mt-1 max-w-[40px] text-center text-[10px] transition-all duration-300 group-hover:opacity-100 md:max-w-none md:text-[14px] md:opacity-0">
                {item.title}
            </div>
        </div>
    );
};

export default LeftAvatars;

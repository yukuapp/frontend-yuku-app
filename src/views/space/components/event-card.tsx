import { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import message from '@/components/message';
import AspectRatio from '@/components/ui/aspect-ratio';
import SkeletonTW from '@/components/ui/skeleton';
import { ShareEventModal } from '@/views/world/components/event-comp-modals';
import { cdn, url_cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { justPreventLink } from '@/common/react/link';
import { SpaceEvent } from '../../../apis/yuku/api';

dayjs.extend(customParseFormat);

export const EventStatus = ({
    wrapperClass,
    start,
    end,
    active,
}: {
    wrapperClass?: string;
    start?: number;
    end?: number;
    active?: boolean;
}) => {
    const now = dayjs().unix() * 1000;
    start = start ?? 0;
    end = end ?? Infinity;
    const ongoing = now >= start && now <= end;
    const not_started = now < start;
    const ended = now > end;
    return (
        <div
            className={cn(
                'mt-6 flex h-8 w-[106px] items-center justify-center gap-x-[6px] rounded-2xl border border-blue-500',
                wrapperClass,
            )}
        >
            <div
                className={cn(
                    'h-1.5 w-1.5 rounded-full bg-[#1FDB00]',
                    not_started && 'bg-[#3391FF]',
                    (ended || !active) && 'bg-white/80',
                )}
            />
            <div className="font-inter-semibold text-sm leading-[18px] text-white text-opacity-80">
                {!active
                    ? 'Inactive'
                    : ongoing
                    ? 'Ongoing'
                    : not_started
                    ? 'Upcoming'
                    : ended
                    ? 'Ended'
                    : ''}
            </div>
        </div>
    );
};
export default function EventCard({ info }: { info?: SpaceEvent }) {
    const [shareOpen, setShareOpen] = useState<boolean>(false);
    if (!info) {
        return (
            <div className="relative w-full rounded-[16px] transition-all duration-500 ease-in-out">
                <div className="rounded-[16px] bg-[#1A2039]">
                    <AspectRatio
                        ratio={407 / 256}
                        className="relative overflow-hidden rounded-t-[16px] bg-[#1A2039] bg-contain bg-center bg-no-repeat"
                    ></AspectRatio>
                    <div className="flex w-full flex-col gap-y-[8px] rounded-b-[16px] bg-[#191E2E] p-2 md:p-5 2xl:gap-y-[10px]">
                        <div className="flex items-center justify-between font-inter-semibold text-[10px] leading-none text-white md:text-[14px] 2xl:text-xl">
                            <SkeletonTW className="!h-[20px] !w-[50px] rounded-sm !bg-gray-700"></SkeletonTW>
                            <SkeletonTW className="!h-[20px] !w-[20px] !bg-gray-700"></SkeletonTW>
                        </div>
                        <div
                            className={cn(
                                'mt-6 flex h-8 w-[106px] items-center justify-center gap-x-[6px] rounded-2xl border border-blue-500',
                            )}
                        >
                            <div className={cn('h-1.5 w-1.5 rounded-full bg-[#1FDB00]')} />
                            <div className="font-inter-semibold text-sm leading-[18px] text-white text-opacity-80">
                                <SkeletonTW className="!h-[18px] !w-[40px] rounded-sm !bg-gray-700"></SkeletonTW>
                            </div>
                        </div>
                        <div className="relative flex w-full justify-between font-inter-medium text-[10px] leading-none text-white text-opacity-70 md:text-[14px] 2xl:text-sm">
                            <SkeletonTW className="!h-[20px] !w-[100px] rounded-sm !bg-gray-700"></SkeletonTW>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    const start = info.opening.start;
    const end = info.opening.end;
    return (
        <div className="group/card relative w-full transition-all duration-500 ease-in-out hover:z-[10] hover:scale-[1.2] xl:hover:scale-[1.19]">
            <ShareEventModal
                open={shareOpen}
                onClose={() => {
                    setShareOpen(false);
                }}
                url={`${info.share_url}`}
            ></ShareEventModal>
            <Link
                to={`/info/event/${info.id}`}
                onClick={(e) => {
                    if (isMobile) {
                        justPreventLink(e);
                        message.error('Please open this event on the computer');
                        return;
                    }
                }}
                className="bg-[#1A2039]"
            >
                <AspectRatio
                    ratio={407 / 256}
                    className="relative overflow-hidden rounded-t-[16px] bg-[#1A2039] bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: url_cdn(info.cover_image) }}
                ></AspectRatio>
                <div
                    className={cn(
                        'flex w-full flex-col gap-y-[8px] rounded-b-[16px] bg-[#191E2E] p-2 group-hover/card:rounded-b-none md:p-5 2xl:gap-y-[10px]',
                    )}
                >
                    <div className="flex  items-center justify-between  font-inter-semibold text-[10px] leading-none text-white md:text-[14px] 2xl:text-xl">
                        <div className="max-w-[90%] truncate">{info.title}</div>
                        <div className="group/extra relative w-6 flex-shrink-0 ">
                            <div className="absolute right-[0px] top-full hidden w-[100px] cursor-pointer rounded-sm bg-[#1A2039] p-[6px] font-inter-medium opacity-20  transition duration-1000 ease-out group-hover/extra:block group-hover/extra:opacity-100">
                                <div
                                    className="
                                flex h-5 w-full items-center justify-between px-[10px] py-[15px] text-[14px] text-[#fff]
                                after:hidden after:h-[6px] after:w-[6px] after:rounded-[50%] after:bg-white hover:rounded-[6px] hover:bg-[#272955] 
                                hover:after:block
                            "
                                    onClick={(e) => {
                                        justPreventLink(e);
                                        setShareOpen(true);
                                    }}
                                >
                                    Share
                                </div>
                            </div>
                            <img
                                className="pointer-events-auto block h-[20px] w-[20px] "
                                src={cdn('')}
                                alt=""
                            />
                        </div>
                    </div>
                    <EventStatus start={start} end={end} active={info.active}></EventStatus>
                    <div className="relative flex w-full justify-between font-inter-medium text-[10px] leading-none text-white text-opacity-70 md:text-[14px] 2xl:text-sm">
                        {dayjs.unix(start ? start / 1000 : 0).format('D MMM-h:mma')} —{' '}
                        {dayjs.unix(end ? end / 1000 : 0).format('D MMM-h:mma')}
                        <div
                            className={cn(
                                'absolute -left-2 -right-2  bottom-0 top-[26px] hidden flex-col  group-hover/card:flex md:-left-5  md:-right-5',
                                isMobile && 'top-[13px]',
                            )}
                        >
                            <div className="w-full  rounded-b-[16px] bg-[#191E2E]  px-2 pb-2 md:px-5 md:pb-5">
                                <div className="h-px w-full rounded-full bg-white" />
                                <p className="mt-[20px] break-words font-inter-semibold text-xs text-white/60 md:text-sm">
                                    {info.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import AspectRatio from '@/components/ui/aspect-ratio';
import { cdn } from '@/common/cdn';
import { DeleteEventModal, ShareEventModal } from './event-comp-modals';
// import EventModal from './event-modal';
import './index.less';

const EventCard = ({
    event,
    updateEventList,
}: {
    event: any;
    updateEventList: (s?: boolean) => void;
}) => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    // const [eventOpen, setEventOpen] = useState(false);
    const [bgUrl, setBgUrl] = useState(cdn(event.cover_image) || '/img/world/default-space.png');

    return (
        <div className="relative w-full rounded-[16px] hover:z-20">
            <DeleteEventModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                event={event}
                updateEventList={updateEventList}
            ></DeleteEventModal>

            <ShareEventModal
                open={shareOpen}
                onClose={() => {
                    setShareOpen(false);
                }}
                url={`${event.share_url}`}
            ></ShareEventModal>

            <AspectRatio ratio={345 / 264} className="overflow-hidden rounded-[16px]">
                <div className="group relative flex h-full w-full overflow-hidden">
                    <Link to={`/info/event/${event.id}`} target="_blank" className="h-full w-full">
                        <motion.img
                            whileHover={{ scale: 1.2, transition: { duration: 0.5 } }}
                            className="w-full cursor-pointer object-cover"
                            src={bgUrl}
                            onError={() => {
                                setBgUrl('/img/world/default-space.png');
                            }}
                        />
                    </Link>
                    <div className="absolute -right-[30px] -top-[30px] w-[128px]">
                        <img className="absolute w-full" src="/img/profile/published.png" alt="" />
                    </div>
                </div>
            </AspectRatio>

            <div className="absolute bottom-0 left-0 flex h-[65px] w-full items-center justify-between rounded-b-[16px] bg-[#00000080] p-3 2xl:h-[71px] 2xl:p-[13px]">
                <div className="flex h-full flex-col justify-between">
                    <div className="font-inter-semibold text-base  leading-none text-white 2xl:text-lg">
                        {event.title ?? '----'}
                    </div>
                    <div className="font-inter-medium text-sm leading-none text-white/70 2xl:text-base">
                        {dayjs(event.updated).format('YYYY-MM-DD')}
                    </div>
                </div>
                <div className="group relative w-6">
                    <div className="absolute right-[-12px] top-full hidden w-44 cursor-pointer rounded-[8px] bg-[#1D1F41] p-[6px] font-inter-medium opacity-20  transition duration-1000 ease-out group-hover:block group-hover:opacity-100">
                        <div
                            className="
                                flex h-12 w-full items-center justify-between px-[20px] py-[10px] text-[18px] text-[#fff]
                                after:hidden after:h-[6px] after:w-[6px] after:rounded-[50%] after:bg-white hover:rounded-[6px] hover:bg-[#272955] 
                                hover:after:block
                            "
                            onClick={() => setShareOpen(true)}
                        >
                            Share
                        </div>

                        <div
                            onClick={() => setDeleteOpen(true)}
                            className="
                                mt-2 flex h-12 w-full items-center justify-between px-[20px] py-[10px] text-[18px] text-[#fff]
                                after:hidden after:h-[6px] after:w-[6px] after:rounded-[50%] after:bg-white hover:rounded-[6px] hover:bg-[#272955] 
                                hover:after:block
                            "
                        >
                            Delete
                        </div>
                        {/* <div
                            onClick={() => setEventOpen(true)}
                            className="
                                mt-2 flex h-12 w-full items-center justify-between px-[20px] py-[10px] text-[18px] text-[#fff]
                                after:hidden after:h-[6px] after:w-[6px] after:rounded-[50%] after:bg-white hover:rounded-[6px] hover:bg-[#272955] 
                                hover:after:block
                            "
                        >
                            Setting
                        </div> */}
                    </div>
                    <img
                        className="block h-5 cursor-pointer group-hover:text-black"
                        src={'/img/world/menu.svg'}
                        alt=""
                    />
                </div>
            </div>
        </div>
    );
};

export default EventCard;

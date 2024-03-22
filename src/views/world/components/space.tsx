import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useParams } from 'react-router-dom';
import { Skeleton, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import _ from 'lodash';
import message from '@/components/message';
import AspectRatio from '@/components/ui/aspect-ratio';
import { querySpaceTemplates, queryUserSpaceEvent, queryUserSpaces } from '@/utils/apis/yuku/api';
import { YUKU_EVENT_PERMISSION } from '@/utils/app/storage';
import { UnityPackage, UserSpace } from '@/apis/yuku/api';
import { cdn } from '@/common/cdn';
import { useIdentityStore } from '@/stores/identity';
import { WorldTab } from '..';
import CreateBtn from './create-btn';
import EventCard from './event-card';
import EventModal from './event-modal';
import './index.less';
import { CreateSpaceModal, DeleteModal, ShareModal, TemplateModal } from './modal';
import SettingModal from './setting-modal';
import SpaceBottomGuide from './space-bottom-guide';

const SpaceCard = ({
    space,
    updateSpaceList,
    updateEventList,
}: {
    space: UserSpace;
    updateSpaceList: (s?: boolean) => void;
    updateEventList: (s?: boolean) => void;
}) => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [settingOpen, setSettingOpen] = useState(false);
    const [eventOpen, setEventOpen] = useState(false);
    const [isHaveEvent, setIsHaveEvent] = useState(false);
    const getUserPermissions = useIdentityStore((s) => s.getUserPermissions);
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = connectedIdentity && getYukuToken();
    const permissions = getUserPermissions();
    // const [views, setViews] = useState(0);
    // console.debug('🚀 ~ views:', views);
    const [bgUrl, setBgUrl] = useState(
        cdn(space.scene_thumbnail) || '/img/world/default-space.png',
    );

    useEffect(() => {
        if (!permissions) return;

        const eventPermission = _.find(permissions, (s) => s === YUKU_EVENT_PERMISSION);
        setIsHaveEvent(eventPermission ? true : false);
    }, [permissions]);
    // useEffect(() => {
    //     setViews(Math.floor(Math.random() * 256));
    // }, []);

    return (
        <div className="relative w-full rounded-[16px] hover:z-20">
            <DeleteModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                space={space}
                updateSpaceList={updateSpaceList}
            ></DeleteModal>
            <SettingModal
                open={settingOpen}
                onClose={() => setSettingOpen(false)}
                space={space}
                updateSpaceList={updateSpaceList}
            ></SettingModal>
            <ShareModal
                open={shareOpen}
                onClose={() => {
                    setShareOpen(false);
                }}
                url={`${space.share_url}`}
            ></ShareModal>

            <EventModal
                open={eventOpen}
                onClose={() => setEventOpen(false)}
                space={space}
                updateEventList={updateEventList}
            ></EventModal>

            <AspectRatio ratio={345 / 264} className="overflow-hidden rounded-[16px]">
                <div className="group relative flex h-full w-full overflow-hidden">
                    <Link
                        to={`/space/${space.id}/${token?.user_id ?? ''}`}
                        target="_blank"
                        className="absolute left-1/2 top-1/2 z-10 m-auto hidden h-[110px] w-[110px] -translate-x-1/2  -translate-y-2/3 cursor-pointer flex-col items-center justify-center  gap-y-[4px] rounded-[60px] bg-slate-700/40 opacity-80 backdrop-blur-[15px] group-hover:flex"
                    >
                        <img className="w-8" src="/img/world/space-enter.svg" alt="" />
                        <div className="text-center text-sm font-semibold leading-[14px] text-white">
                            Edit
                        </div>
                    </Link>

                    <motion.img
                        whileHover={{ scale: 1.2, transition: { duration: 0.5 } }}
                        className="w-full cursor-pointer object-cover"
                        src={bgUrl}
                        onError={() => {
                            setBgUrl('/img/world/default-space.png');
                        }}
                    />
                    {/* <div className="absolute bottom-[5rem] left-2 flex gap-x-[6px] font-inter-semibold text-xl leading-tight text-white">
                        <img src="/img/world/space-views.svg" className="w-6" alt="" />
                        {views}
                    </div> */}

                    <div className="absolute -right-[30px] -top-[30px] w-[128px]">
                        <img className="absolute w-full" src="/img/profile/published.png" alt="" />
                    </div>
                </div>
            </AspectRatio>

            <div className="absolute bottom-0 left-0 flex h-[65px] w-full items-center justify-between rounded-b-[16px] bg-[#00000080] p-3 2xl:h-[71px] 2xl:p-[13px]">
                <div className="flex h-full flex-col justify-between">
                    <div className="font-inter-semibold text-base  leading-none text-white 2xl:text-lg">
                        {space.title ?? '----'}
                    </div>
                    <div className="font-inter-medium text-sm leading-none text-white/70 2xl:text-base">
                        {dayjs(space.updated).format('YYYY-MM-DD')}
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
                            onClick={() => setSettingOpen(true)}
                            className="
                                mt-2 flex h-12 w-full items-center justify-between px-[20px] py-[10px] text-[18px] text-[#fff]
                                after:hidden after:h-[6px] after:w-[6px] after:rounded-[50%] after:bg-white hover:rounded-[6px] hover:bg-[#272955] 
                                hover:after:block
                            "
                        >
                            Setting
                        </div> */}

                        {isHaveEvent && (
                            <>
                                <div
                                    onClick={() => setEventOpen(true)}
                                    className="
                                        mt-2 flex h-12 w-full items-center justify-between px-[20px] py-[10px] text-[18px] text-[#fff]
                                        after:hidden after:h-[6px] after:w-[6px] after:rounded-[50%] after:bg-white hover:rounded-[6px] hover:bg-[#272955] 
                                        hover:after:block
                                    "
                                >
                                    Host Events
                                </div>
                            </>
                        )}
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

const CardSkeleton = () => {
    return (
        <div className="group w-full overflow-hidden rounded-[16px] bg-[#191e2e]">
            <AspectRatio ratio={345 / 264}>
                <Skeleton.Button
                    className="!h-full !w-full !bg-[#191e2e] object-contain"
                    active={true}
                />
            </AspectRatio>
        </div>
    );
};
export default function SpaceMain({ show }: { show: boolean }) {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = identity && getYukuToken();
    const [loading, setLoading] = useState<boolean>(false);
    const [spaceList, setSpaceList] = useState<UserSpace[]>();
    const [eventList, setEventList] = useState<any[]>();
    const [templateOpen, setTemplateOpen] = useState<boolean>(false);

    const [templateList, setTemplateList] = useState<UnityPackage[]>([]);
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
    const param = useParams();
    const tab: WorldTab = param.tab as WorldTab;
    const isCreate = param.create;
    const maxCount = 3;

    useEffect(() => {
        if (tab && tab === 'space' && isCreate === 'create') {
            setTemplateOpen(true);
        }
    }, [tab, isCreate]);
    const updateSpaceList = (silence?: boolean) => {
        if (!token) {
            return;
        }
        if (!silence) setLoading(true);
        queryUserSpaces({
            params: token,
        })
            .then(setSpaceList)
            .catch((e) => console.error(e.message))
            .finally(() => {
                setLoading(false);
            });
    };

    const updateEventList = (silence?: boolean) => {
        if (!token) {
            return;
        }
        if (!silence) setLoading(true);
        queryUserSpaceEvent({
            params: token,
        })
            .then(setEventList)
            .catch((e) => console.error(e.message))
            .finally(() => {
                setLoading(false);
            });
    };
    useEffect(() => {
        querySpaceTemplates()
            .then((tl) => {
                if (!tl) {
                    setTemplateList([]);
                } else {
                    setTemplateList(tl);
                }
            })
            .catch((e) => e.message);
    }, []);

    useEffect(() => {
        updateSpaceList();
        updateEventList();
    }, []);
    useEffect(() => {
        updateSpaceList();
        updateEventList();
    }, [token?.user_token]);
    const sortedSpaceList =
        spaceList && _.sortBy(spaceList, (s) => -Date.parse((s as any).updatedAt));

    const [createSpaceOpen, setCreateSpaceOpen] = useState<boolean>(false);
    if (!show) {
        return <></>;
    }
    return (
        <>
            <TemplateModal
                open={templateOpen}
                onClose={() => {
                    setTemplateOpen(false);
                }}
                templateList={templateList}
                selectedTemplateIndex={selectedTemplateIndex}
                setSelectedTemplateIndex={setSelectedTemplateIndex}
                setCreateSpaceOpen={setCreateSpaceOpen}
            ></TemplateModal>
            <CreateSpaceModal
                open={createSpaceOpen}
                onClose={() => {
                    setCreateSpaceOpen(false);
                }}
                template={templateList[selectedTemplateIndex]}
                updateSpaceList={updateSpaceList}
            ></CreateSpaceModal>
            <div className="flex w-full items-center justify-between">
                {' '}
                <div className="flex items-center justify-around">
                    <CreateBtn
                        onClick={() => {
                            isMobile
                                ? message.warning('Please create the space on the computer.')
                                : setTemplateOpen(true);
                        }}
                    />
                    <div className="ml-[22px]">
                        <img className="animateArrow" src="/img/world/leftArrow.svg" alt="" />
                    </div>
                    <div className="ml-[12px] font-inter-medium text-[14px] leading-[28px] text-white">
                        Start to own your spaces
                    </div>
                </div>
                <div className="flex items-center justify-between gap-x-2 font-inter-semibold text-sm text-white/70">
                    <div>
                        Space <span className="text-white">{sortedSpaceList?.length}</span>/
                        {maxCount}
                    </div>
                    <Tooltip
                        placement="top"
                        title={`Maximum ${maxCount} Spaces for free users`}
                        overlayInnerStyle={{
                            textAlign: 'center',
                            padding: '10px 13px',
                            fontSize: '13px',

                            backgroundColor: '#191E2E',
                        }}
                        trigger={'hover'}
                        overlayClassName="max-space-tooltip"
                    >
                        <img
                            className=" cursor-pointer"
                            src={'/img/space/max-space-tooltip.svg'}
                            alt=""
                        />
                    </Tooltip>
                </div>
            </div>
            <div className="flex h-full w-full flex-1 items-start justify-center">
                {loading || !spaceList ? (
                    // <LoadingOutlined className="m-auto !mt-[30vh] !text-[50px]"></LoadingOutlined>
                    <div className="mt-8 grid w-full grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 md:gap-x-4 md:gap-y-4 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5">
                        {new Array(4).fill('').map((_, index) => (
                            <div key={index}>
                                <CardSkeleton />
                            </div>
                        ))}
                    </div>
                ) : sortedSpaceList?.length === 0 ? (
                    <div className="m-auto mt-[5vh] font-inter-semibold text-[20px] text-white opacity-75">
                        <img src="/img/world/no-space.svg" alt="" />
                        No space created yet
                    </div>
                ) : (
                    <div className="mt-8 grid w-full grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 md:gap-x-4 md:gap-y-4 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5">
                        {sortedSpaceList?.map((s) => (
                            <SpaceCard
                                space={s}
                                key={`${s.id}`}
                                updateSpaceList={updateSpaceList}
                                updateEventList={updateEventList}
                            ></SpaceCard>
                        ))}
                    </div>
                )}
            </div>

            <div>
                {eventList && eventList?.length > 0 && (
                    <div className="mt-[50px] font-inter-semibold text-[22px]">Event</div>
                )}
                <div className="flex h-full w-full flex-1 items-start justify-center">
                    {loading || !eventList ? (
                        <div className="mt-[20px] grid w-full grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 md:gap-x-4 md:gap-y-4 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5">
                            {new Array(4).fill('').map((_, index) => (
                                <div key={index}>
                                    <CardSkeleton />
                                </div>
                            ))}
                        </div>
                    ) : eventList?.length === 0 ? (
                        <div className="m-auto font-inter-semibold text-[20px] text-white opacity-75">
                            {/* <img src="/img/world/no-space.svg" alt="" />
                            No event created yet */}
                        </div>
                    ) : (
                        <div className="mt-[20px] grid w-full grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 md:gap-x-4 md:gap-y-4 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5">
                            {eventList?.map((s) => (
                                <EventCard
                                    event={s}
                                    key={`${s.id}`}
                                    updateEventList={updateEventList}
                                ></EventCard>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <SpaceBottomGuide />
        </>
    );
}

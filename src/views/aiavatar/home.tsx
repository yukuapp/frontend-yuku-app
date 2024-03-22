import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Tooltip } from 'antd';
import { ReactLenis } from '@studio-freight/react-lenis';
import message from '@/components/message';
import { queryAllAvatars } from '@/utils/apis/yuku/api';
import { AIAvatarType } from '@/apis/yuku/api';
import { useDeviceStore } from '@/stores/device';
import { useIdentityStore } from '@/stores/identity';
import Sidebar from './components/sidebar';
import './index.less';

const HomeItem = ({ itemData }: { itemData: AIAvatarType }) => {
    return (
        <div className="group flex h-[245px] w-full cursor-pointer flex-col items-center rounded-xl border border-[#283047] bg-[#191E2E] p-[20px]">
            <img
                className="h-[120px] w-[120px] flex-shrink-0 rounded-xl duration-200 group-hover:scale-[1.1]"
                src={itemData.avatar_url}
            />
            <div className="my-[15px] flex-shrink-0 font-inter-medium text-[14px] leading-[18px] text-white">
                {itemData.name}
            </div>
            <Tooltip
                placement="bottom"
                title={
                    <span className="whitespace-pre-wrap text-xs leading-tight">
                        {itemData.short_description}
                    </span>
                }
            >
                <div className="line-clamp-2 w-full flex-shrink-0 text-center font-inter-medium text-xs leading-[18px] text-white text-opacity-70">
                    {itemData.short_description}
                </div>
            </Tooltip>
            {/* <div className="mt-[14px] text-xs font-normal leading-[18px] text-white text-opacity-70">
                {itemData.user}
            </div> */}
        </div>
    );
};

const SkeletonItem = () => {
    return (
        <div className="flex h-[245px] w-full cursor-pointer flex-col items-center rounded-xl border border-[#283047] bg-[#191E2E] p-[20px]">
            <div className="h-[120px] w-[120px] flex-shrink-0 rounded-xl">
                <Skeleton.Image className="!h-full !w-full" active />
            </div>

            <div className="my-[15px] h-[14px] w-full opacity-70">
                <Skeleton.Input className="!h-full !w-full !min-w-0" active />
            </div>
            <div className="w-full flex-shrink-0 opacity-70">
                <div className="h-[14px] w-full">
                    <Skeleton.Input className="!h-full !w-full !min-w-0" active />
                </div>
            </div>
            <div className="mt-[8px] h-[14px] w-full opacity-70">
                <Skeleton.Input className="!h-full !w-full !min-w-0" active />
            </div>
        </div>
    );
};

function AIAvatarHome() {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);
    const [items, setItems] = useState<AIAvatarType[] | undefined>(undefined);
    const navigate = useNavigate();
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = connectedIdentity && getYukuToken();

    useEffect(() => {
        fetchAvatar();
    }, []);

    const fetchAvatar = () => {
        queryAllAvatars()
            .then((r) => {
                setItems(r);
            })
            .catch(() => {
                message.error('Get AI avatars failed');
                setItems([]);
            });
    };

    const openChat = (item: AIAvatarType) => {
        if (isMobile) {
            message.warning('Mobile Support Coming Soon...');
            return;
        }

        if (!connectedIdentity) {
            message.warning('Please log in, you can enter the space after logging in!');
            navigate('/connect');
            return;
        }

        if (!token) {
            message.warning('Please wait while still connecting your wallet.');
            return;
        }

        item._id && navigate(`/AIAvatar/${item._id}/chat`);
    };

    return (
        <>
            <ReactLenis root>
                <div className="mt-[44px] flex min-h-[calc(100vh-44px)] flex-col items-start md:mt-[75px] md:min-h-[calc(100vh-75px)] md:flex-row">
                    <Sidebar />
                    <div className="mt-[20px] grid w-full grid-cols-2 flex-wrap gap-[13px] px-[13px] pb-[100px] md:mt-[49px] md:flex md:grid-cols-none">
                        {typeof items === 'undefined'
                            ? new Array(12).fill('').map((_, index) => (
                                  <div className="inline-flex w-full md:w-[196px]" key={index}>
                                      <SkeletonItem />
                                  </div>
                              ))
                            : items.map((item, index) => {
                                  if (index > 2) return null;
                                  return (
                                      <div
                                          className="inline-flex w-full md:w-[196px]"
                                          key={index}
                                          onClick={() => openChat(item)}
                                      >
                                          <HomeItem itemData={item} />
                                      </div>
                                  );
                              })}
                    </div>
                </div>
            </ReactLenis>
        </>
    );
}

export default AIAvatarHome;

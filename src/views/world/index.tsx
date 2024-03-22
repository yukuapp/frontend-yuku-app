import { useEffect } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Link, useNavigate, useParams } from 'react-router-dom';
import message from '@/components/message';
import { cn } from '@/common/cn';
import { shrinkAccount, shrinkPrincipal } from '@/common/data/text';
import { useIdentityStore } from '@/stores/identity';
import AvatarMain from './components/avatar';
import SpaceMain from './components/space';

type NavigateItem = {
    label: string;
    path: string;
};
export type WorldTab = 'space' | 'avatar';
const WORLD_TABS: WorldTab[] = ['space', 'avatar'];
export const isValidExploreTab = (tab: string): boolean => WORLD_TABS.includes(tab as WorldTab);
export default function World() {
    const param = useParams();
    const navigate = useNavigate();
    const tab: WorldTab = param.tab as WorldTab;
    const identityProfile = useIdentityStore((s) => s.identityProfile);
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const tabs: NavigateItem[] = [
        {
            label: 'Spaces',
            path: '/world/space',
        },
        {
            label: 'Avatars',
            path: '/world/avatar',
        },
    ];
    useEffect(() => {
        if (!isValidExploreTab(tab)) {
            return navigate('/world/space', { replace: true });
        }
    }, [tab]);

    return (
        <>
            <div className="relative w-full overflow-hidden">
                <img
                    src={
                        tab !== 'avatar' ? '/img/world/banner.png' : '/img/world/avatar-banner.png'
                    }
                    className="min-h-[200px] w-full object-cover"
                    alt=""
                />
                <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full bg-gradient-to-b from-[#10152266] to-[#101522]"></div>
                <div className="absolute bottom-0 left-[16px] flex w-full md:left-[40px] md:mt-[-100px]">
                    <div className="group relative h-[65px] w-[65px] flex-shrink-0 cursor-pointer overflow-hidden rounded-full bg-gradient-to-r from-fuchsia-600 to-sky-500 md:h-[144px] md:w-[144px] md:rounded-full">
                        <img alt="" src={identityProfile?.avatar} />
                    </div>
                    <div className="relative ml-[15px] flex w-full flex-1 flex-col items-start justify-end md:ml-[40px]">
                        <div className="flex w-full items-center justify-between">
                            <p className="text-center font-['Inter'] text-[18px] font-bold text-white md:text-[26px]">
                                {identityProfile?.username}
                            </p>
                        </div>
                        <div className="flex">
                            <div className="flex items-center">
                                <p className="font-['Inter'] text-[14px] font-normal leading-[30px] text-white text-opacity-70 md:text-lg">
                                    {shrinkPrincipal(connectedIdentity?.principal)}
                                </p>
                                <CopyToClipboard
                                    text={connectedIdentity?.principal}
                                    onCopy={() => {
                                        message.success('Copied');
                                    }}
                                >
                                    <img
                                        src={'/img/profile/copy.svg'}
                                        className="ml-2.5 cursor-pointer"
                                    />
                                </CopyToClipboard>
                            </div>
                            <div className="ml-[15px] flex items-center md:ml-[30px]">
                                <p className="font-['Inter'] text-[14px] font-normal leading-[30px] text-white text-opacity-70 md:text-lg">
                                    {shrinkAccount(connectedIdentity?.account)}
                                </p>
                                <CopyToClipboard
                                    text={connectedIdentity?.account}
                                    onCopy={() => {
                                        message.success('Copied');
                                    }}
                                >
                                    <img
                                        src={'/img/profile/copy.svg'}
                                        className="ml-2.5 cursor-pointer"
                                    />
                                </CopyToClipboard>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-[16px] flex flex-col md:mx-[40px]">
                <div className="mt-[23px] flex gap-x-12">
                    {tabs.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={cn(
                                'relative flex h-[30px] cursor-pointer items-center font-inter-semibold text-[20px] text-white/60 duration-100 md:h-[35px] md:text-[24px]',
                                location.pathname.indexOf(item.path) !== -1 && 'text-white',
                            )}
                        >
                            {location.pathname.indexOf(item.path) !== -1 && (
                                <div className="absolute -bottom-[15px] h-[2px] w-full bg-white md:-bottom-[24px]"></div>
                            )}
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="mb-[14px] mt-[14px] h-px w-full bg-[#262e47] md:mb-[24px] md:mt-[24px]" />
                <SpaceMain show={tab === 'space'}></SpaceMain>
                <AvatarMain show={tab === 'avatar'}></AvatarMain>
            </div>
        </>
    );
}

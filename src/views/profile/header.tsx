import CopyToClipboard from 'react-copy-to-clipboard';
import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import message from '@/components/message';
import YukuIcon from '@/components/ui/yuku-icon';
import Credit from '@/components/user/credit';
import Username from '@/components/user/username';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { shrinkAccount, shrinkPrincipal } from '@/common/data/text';
import { useDeviceStore } from '@/stores/device';
import { useIdentityStore } from '@/stores/identity';
import { HeaderView } from './common';

function ProfileHeader({ profileLoading, view }: { profileLoading: boolean; view: HeaderView }) {
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const self = view.account === connectedIdentity?.account;

    const { isMobile } = useDeviceStore((s) => s.deviceInfo);

    return (
        <div className="">
            <div className="relative">
                <div className="relative h-[150px] w-full md:h-[300px]">
                    {profileLoading ? (
                        <Skeleton.Image className="!h-full !w-full" active={true} />
                    ) : (
                        <div
                            className="h-full w-full bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url('/img/profile/setting-bg.png')`,
                            }}
                        ></div>
                    )}
                    <div
                        className="absolute -bottom-20 left-0 right-0 top-0 h-full w-full"
                        style={{
                            background:
                                'linear-gradient(180deg, rgba(16, 21, 34, 0) 50%, #101522 100%)',
                        }}
                    ></div>
                </div>
                <div
                    className={cn(
                        'absolute bottom-0 left-[17px] right-3 h-[41.52px] w-[41.52px] translate-y-1/2 rounded-[8px] border-[2.5px] border-[#F6F6F6]  bg-[#F6F6F6]  md:left-[38px] md:h-[103px] md:w-[103px] md:rounded-2xl md:border-[4.5px]',
                        !profileLoading && 'border-black',
                    )}
                >
                    {profileLoading ? (
                        <Skeleton.Image className="!h-full !w-full !min-w-0 !rounded-none !bg-transparent" />
                    ) : (
                        <img className="w-full rounded-[8px]" src={cdn(view.avatar)} />
                    )}
                    {self && !profileLoading && (
                        <div className="absolute bottom-0 right-0 flex h-[16px] w-[16px] translate-x-1/2 translate-y-[40%] cursor-pointer items-center justify-center rounded-full border border-white bg-[#36F] md:h-[40px] md:w-[40px] md:border-[2px] ">
                            <Link
                                to={'/profile/settings'}
                                className="flex h-[24px] w-[24px] items-center justify-center"
                            >
                                <YukuIcon
                                    name="action-edit-pencil"
                                    size={20}
                                    color="white"
                                    className="-translate-y-[1px] translate-x-[1px]"
                                />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex px-[15px] pt-[28px] md:px-[40px] md:pt-[80px]">
                <div className="flex w-full flex-wrap justify-between">
                    <div>
                        <div className="flex items-center">
                            <div className="max-w-md overflow-hidden overflow-ellipsis whitespace-nowrap font-inter text-[16px]  font-bold md:text-[26px]">
                                <Username
                                    principal_or_account={view.principal ?? view.account}
                                    className="text-[26px]"
                                />
                            </div>
                        </div>
                        <div className="flex">
                            <div className="font-inter text-base font-normal leading-7 text-white/60">
                                {view.principal
                                    ? shrinkPrincipal(view.principal)
                                    : shrinkAccount(view.account)}
                            </div>
                            <CopyToClipboard
                                text={view.principal ?? view.account}
                                onCopy={() => message.success('Copied')}
                            >
                                <img
                                    src={'/img/profile/copy.svg'}
                                    className="ml-2.5 cursor-pointer"
                                />
                            </CopyToClipboard>
                        </div>
                    </div>
                    {isMobile && (
                        <YukuIcon
                            name="action-refresh"
                            size={18}
                            color="#8D8D8D"
                            className="self-start"
                        />
                    )}
                    <Credit
                        account={view.account}
                        className="ml-auto hidden gap-y-2 font-[12px] md:mt-0 md:flex md:flex-col"
                    />
                </div>
            </div>
            {/* <div className="mt-3 break-words pl-[38px] font-inter text-base font-normal text-gray-600">
                {view.bio}
            </div> */}
        </div>
    );
}

export default ProfileHeader;

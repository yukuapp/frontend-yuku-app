import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import DOMPurify from 'dompurify';
import message from '@/components/message';
import NftMedia from '@/components/nft/media';
import { Button } from '@/components/ui/button';
import YukuIcon from '@/components/ui/yuku-icon';
import { doLaunchpadAddWhitelist, doOatAddWhitelist } from '@/utils/apis/yuku/api_data';
import { queryCoreCollectionData } from '@/utils/canisters/yuku-old/core';
import { queryLaunchpadWhitelist } from '@/utils/canisters/yuku-old/launchpad';
import { queryOatWhitelist } from '@/utils/canisters/yuku-old/oat';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { principal2account } from '@/common/ic/account';
import { justPreventLink } from '@/common/react/link';
import { useIdentityStore } from '@/stores/identity';
import { CoreCollectionData } from '@/types/yuku';

type Status =
    | 'NOT_CONNECT'
    | 'CONNECTING'
    | 'CONNECTED'
    | 'ADDING_WHITELIST'
    | 'CLAIMING'
    | 'CLAIMED'
    | undefined;

type WhitelistType = 'LAUNCH_PAD' | 'OAT' | undefined;

const IconDone = () => <YukuIcon name="whitelist-status-done" size={44} color="#6B4BF6" />;
const IconBlank = () => <YukuIcon name="whitelist-status-blank" size={44} color="#EAEAEA" />;
const IconLoading = ({ className }: { className?: string }) => (
    <YukuIcon name="whitelist-status-loading" size={44} color="#999999" className={className} />
);

const getLink = ({
    whitelistType,
    args: { canister_id, eventId, projectId },
}: {
    whitelistType: WhitelistType;
    args: {
        canister_id?: string;
        eventId?: string;
        projectId?: string;
    };
}): string => {
    if (whitelistType === 'LAUNCH_PAD') {
        return `/launchpad/${canister_id}`;
    }
    if (whitelistType === 'OAT') {
        return `/oat/${projectId}/claim/${eventId}`;
    }
    return '';
};

const Whitelist = () => {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const navigate = useNavigate();

    const [status, setStatus] = useState<Status>('NOT_CONNECT');
    useEffect(() => {
        identity && setStatus('CONNECTED');
    }, [identity]);

    const [whitelistType, setWhitelistType] = useState<WhitelistType>();

    const { pathname } = useLocation();

    const [searchParams] = useSearchParams();
    const canister_id = searchParams.get('canister_id') || undefined;
    const eventId = searchParams.get('eventid') || undefined; /* cspell: disable-line */
    const projectId = searchParams.get('projectid') || undefined; /* cspell: disable-line */

    const [isLoading, setLoading] = useState<boolean>(false);

    const [collectionInfo, setCollectionInfo] = useState<CoreCollectionData | undefined>(undefined);

    const [whitelisted, setWhitelisted] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        canister_id &&
            queryCoreCollectionData(canister_id)
                .then(setCollectionInfo)
                .finally(() => setLoading(false));
    }, [canister_id]);

    useEffect(() => {
        if (pathname === '/add-oat-whitelist') {
            setWhitelistType('OAT');
        } else if (pathname === '/add-whitelist') {
            setWhitelistType('LAUNCH_PAD');
        }
    }, [pathname]);

    useEffect(() => {
        if (whitelistType === 'OAT') {
            identity &&
                canister_id &&
                queryOatWhitelist(canister_id)
                    .then((res) => {
                        const find = res.find(
                            (item) => item.account === principal2account(identity.principal!),
                        );
                        find && setWhitelisted(true);
                    })
                    .catch(console.error);
        }
        if (whitelistType === 'LAUNCH_PAD') {
            identity &&
                canister_id &&
                queryLaunchpadWhitelist(identity, canister_id)
                    .then((res) => {
                        res === 0 && setWhitelisted(true);
                    })
                    .catch(console.error);
        }
    }, [whitelistType, identity, eventId]);
    return (
        <div>
            <div className="flex flex-col items-center justify-center gap-x-[82px] bg-[#FAFAFA] px-[16px] py-[50px] md:flex-row md:px-[110px]">
                <div className="w-full md:w-[458px]">
                    <div className="flex h-full w-full items-center justify-center rounded-[8px]">
                        {/* <img src={cdn(getThumbnailByNftMetadata(card))} /> */}
                        <NftMedia
                            src={cdn(collectionInfo?.info.logo)}
                            skeleton={true}
                            className="rounded-[16px]"
                        />
                    </div>
                </div>

                <div className="w-full max-w-[500px]">
                    {!isLoading ? (
                        <>
                            {' '}
                            <div className="font-inter-semibold text-[32px]">
                                {collectionInfo?.info.name}
                            </div>
                            <div
                                className="mt-[18px] font-inter-medium text-[18px] leading-[30px] text-[#666666]/80"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(collectionInfo?.info.description),
                                }}
                            ></div>
                        </>
                    ) : (
                        <div className="mt-[13px] w-full md:mt-0">
                            {' '}
                            <Skeleton.Input className="!w-full md:!w-[500px]" />
                            <Skeleton.Input className="!mt-[18px] !h-[200px] !w-full md:!w-[500px]" />
                        </div>
                    )}
                </div>
            </div>
            <div className="px-[16px] py-[54px] md:px-[110px]">
                <div className="w-full text-center font-inter-semibold text-[20px] ">
                    Get Your Free Whitelist Now!
                </div>

                <div className="mt-[10px] flex justify-start md:block">
                    <div className="flex h-fit flex-col items-center justify-between md:w-full md:flex-row">
                        <div className="flex  flex-col items-center md:w-1/2 md:flex-row">
                            {identity ? (
                                <IconDone />
                            ) : status === 'CONNECTING' ? (
                                <IconLoading />
                            ) : (
                                <IconBlank />
                            )}
                            <div
                                className={cn(
                                    'h-[130px] w-[6px] bg-[#7149FF] md:h-[6px] md:flex-1',
                                    !identity && 'bg-[#EAEAEA]',
                                )}
                            ></div>
                        </div>
                        <div className="flex  items-center">
                            {status === 'ADDING_WHITELIST' ? (
                                <IconLoading className="animate-spin" />
                            ) : whitelisted ? (
                                <IconDone />
                            ) : (
                                <IconBlank />
                            )}
                        </div>
                        <div className="flex flex-col items-center md:w-1/2  md:flex-row">
                            <div
                                className={cn(
                                    'h-[130px] w-[6px] bg-[#7149FF] md:h-[6px] md:flex-1',
                                    !whitelisted && 'bg-[#EAEAEA]',
                                )}
                            ></div>
                            {status === 'CLAIMING' ? (
                                <IconLoading />
                            ) : status === 'CLAIMED' ? (
                                <IconDone />
                            ) : (
                                <IconBlank />
                            )}
                        </div>
                    </div>
                    <div className="ml-[10px] flex flex-col justify-between md:ml-0 md:mt-[10px] md:flex-row ">
                        <div className="flex w-fit flex-col font-inter-medium text-[18px] md:w-[20%] md:gap-y-[15px] ">
                            <div className=" font-inter-medium">Step 1: Connect Wallet</div>
                            <Button
                                onClick={() => {
                                    status !== 'CONNECTED' && setStatus('CONNECTING');
                                    !identity && navigate('/connect');
                                }}
                                className="w-[50%]"
                            >
                                {identity ? 'Connected' : 'Connect'}
                            </Button>
                        </div>
                        <div className="flex  w-fit flex-col items-start font-inter-medium text-[18px] md:w-[20%] md:items-center md:gap-y-[15px]">
                            <div className="font-inter-medium">Step 2: Add whitelist</div>
                            <Button
                                className={cn(
                                    'w-[50%]',
                                    status !== 'CONNECTED' &&
                                        'cursor-not-allowed bg-[#c1c1c1] hover:bg-[#c1c1c1]',
                                )}
                                onClick={() => {
                                    if (status === 'ADDING_WHITELIST' || whitelisted) {
                                        return;
                                    }

                                    if (status !== 'CONNECTED') {
                                        return;
                                    }
                                    setStatus('ADDING_WHITELIST');

                                    whitelistType === 'LAUNCH_PAD' &&
                                        identity &&
                                        canister_id &&
                                        doLaunchpadAddWhitelist(
                                            canister_id,
                                            principal2account(identity?.principal || ''),
                                        )
                                            .then(() => {
                                                setWhitelisted(true);
                                            })
                                            .catch(() => message.error('not in whitelist'))
                                            .finally(() =>
                                                identity
                                                    ? setStatus('CONNECTED')
                                                    : setStatus('NOT_CONNECT'),
                                            );

                                    whitelistType === 'OAT' &&
                                        identity &&
                                        eventId &&
                                        canister_id &&
                                        doOatAddWhitelist(
                                            canister_id,
                                            eventId,
                                            principal2account(identity?.principal || ''),
                                        )
                                            .then(() => {
                                                setWhitelisted(true);
                                            })
                                            .catch(() => message.error('not in whitelist'))
                                            .finally(() =>
                                                identity
                                                    ? setStatus('CONNECTED')
                                                    : setStatus('NOT_CONNECT'),
                                            );
                                }}
                            >
                                {whitelisted ? 'Added' : 'Add'}
                            </Button>
                        </div>
                        <div className="flex  w-fit flex-col items-start font-inter-medium text-[18px] md:w-[20%] md:items-end md:gap-y-[15px]">
                            <div className="font-inter-medium">Step 3: Claim NFT</div>

                            <Button
                                className={cn(
                                    'w-[50%]',
                                    !whitelisted &&
                                        'cursor-not-allowed bg-[#c1c1c1] hover:bg-[#c1c1c1]',
                                )}
                            >
                                <Link
                                    to={getLink({
                                        whitelistType,
                                        args: { canister_id, eventId, projectId },
                                    })}
                                    onClick={(e) => {
                                        !whitelisted && justPreventLink(e);
                                    }}
                                >
                                    Claim
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Whitelist;

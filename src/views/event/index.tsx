import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import message from '@/components/message';
import AspectRatio from '@/components/ui/aspect-ratio';
import { YukuButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SkeletonTW from '@/components/ui/skeleton';
import { accessUserEvent, queryEventInfo, queryUserMetadata } from '@/utils/apis/yuku/api';
import { queryAllTokenOwners } from '@/utils/canisters/nft/nft';
import {
    hasPermissionChainIdentity,
    hasPermissionChainNftOwner,
    hasPermissionPassword,
    SpaceEvent,
    UserMetadataView,
} from '@/apis/yuku/api';
import { url_cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { differDate } from '@/common/data/dates';
import { shrinkText } from '@/common/data/text';
import { useIdentityStore } from '@/stores/identity';
import { EventStatus } from '../space/components/event-card';

const formatEventDate = (d?: number): string[] => {
    if (!d) {
        return ['--', '--'];
    }
    return [
        dayjs
            .unix(Math.floor(d / 1000))
            .local()
            .format('D MMM'),
        dayjs
            .unix(Math.floor(d / 1000))
            .local()
            .format('h:mma'),
    ];
};
export default function EventDetail() {
    const { id } = useParams();
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = connectedIdentity && getYukuToken();
    const [event, setEvent] = useState<SpaceEvent>();
    const navigate = useNavigate();
    const ended = !event ? false : Date.now() >= (event.opening.end || Infinity);
    useEffect(() => {
        const n_id = Number(id);
        if (!isNaN(n_id)) {
            queryEventInfo(n_id)
                .then(setEvent)
                .catch((e) => {
                    message.error("Can't fetch event info: " + e);
                });
        }
    }, [id]);
    const [userMetadata, setUserMetadata] = useState<UserMetadataView>();
    useEffect(() => {
        const user_id = event?.user_id;
        user_id &&
            queryUserMetadata({ id: `${user_id}` })
                .then(setUserMetadata)
                .catch((e) => {
                    message.error("Can't fetch user metadata: " + e);
                });
    }, [event?.user_id]);
    const start_format = formatEventDate(event?.opening.start);
    const end_format = formatEventDate(event?.opening.end);

    const [hasAccess, setHasAccess] = useState<boolean>();
    const [checkingAccess, setCheckingAccess] = useState<boolean>();
    useEffect(() => {
        if (token?.user_token && event) {
            if (checkingAccess) {
                return;
            } else {
                setCheckingAccess(true);
                accessUserEvent({
                    user_id: token.user_id,
                    user_event_id: event.id,
                    user_token: token.user_token,
                })
                    .then(setHasAccess)
                    .finally(() => {
                        setCheckingAccess(false);
                    });
            }
        }
    }, [token?.user_token, event]);
    const [pwd, setPwd] = useState<string>();

    const need_password = event && hasPermissionPassword(event.permission);

    const need_chain_owner = event && hasPermissionChainNftOwner(event.permission);

    const need_whitelist = event && hasPermissionChainIdentity(event.permission);

    const fully_open = !need_password && !need_chain_owner && !need_whitelist;

    const show_password_input = !hasAccess && need_password;

    const [finalCheck, setFinalCheck] = useState<boolean>();

    const [deniedReason, setDeniedReason] = useState<string>('');

    const duration = differDate(event?.opening.start || 0, event?.opening.end || 0);
    const tz_offset = dayjs().utcOffset() / 60;
    const skeleton = !event;

    if (isMobile) {
        return (
            <div className="mt-[40vh] w-full text-center font-inter-medium text-lg">
                Please open this page on the computer.
            </div>
        );
    }
    return (
        <div className="flex w-full flex-col items-start justify-center gap-x-[20px] px-[30px] pt-[84px] md:pt-[100px]  lg:flex-row xl:gap-x-[50px]  2xl:px-[100px] 2xl:pt-[200px]">
            <div className="flex w-full max-w-[900px] flex-1 flex-col items-start justify-between">
                <div className="w-full rounded-2xl bg-[#1A2039] lg:w-[650px] xl:w-full">
                    <AspectRatio
                        ratio={16 / 9}
                        className="rounded-2xl bg-contain bg-center bg-no-repeat"
                        style={{ backgroundImage: url_cdn(event?.cover_image) }}
                    >
                        {skeleton && (
                            <SkeletonTW className="!h-full  w-full !rounded-2xl !bg-[#1A2039] bg-contain bg-center bg-no-repeat" />
                        )}
                    </AspectRatio>
                </div>

                <div className="mt-5 font-inter-semibold text-lg leading-[18px] text-white">
                    Description
                </div>
                <div className="mt-3 font-inter-medium text-sm leading-normal text-white text-opacity-60 2xl:w-[803px]">
                    {skeleton ? (
                        <div className="flex flex-col gap-y-[10px]">
                            <SkeletonTW className="!w-[200px] !bg-[#1A2039]"></SkeletonTW>
                            <SkeletonTW className="!w-[200px] !bg-[#1A2039]"></SkeletonTW>
                        </div>
                    ) : (
                        event?.description
                    )}
                </div>
            </div>
            <div className="mt-10 flex justify-center pb-[200px] lg:mt-0 lg:pb-0">
                <div>
                    <div className="flex items-center justify-start">
                        <div className="flex font-inter-semibold text-4xl  capitalize leading-tight text-white">
                            {skeleton ? (
                                <SkeletonTW className="!h-[45px] !w-[170px] rounded-[8px] !bg-[#1A2039]"></SkeletonTW>
                            ) : (
                                shrinkText(event?.title, 8, 8)
                            )}
                        </div>
                        <EventStatus
                            wrapperClass="ml-[30px] mt-0"
                            start={event?.opening.start}
                            end={event?.opening.end}
                            active={event?.active}
                        ></EventStatus>
                    </div>
                    <div className="flex items-center font-inter-medium text-base leading-normal text-white text-opacity-70">
                        by&nbsp;
                        {skeleton ? (
                            <SkeletonTW className="!h-5 !w-[100px] rounded-[8px] !bg-[#1A2039]"></SkeletonTW>
                        ) : (
                            userMetadata?.name
                        )}
                    </div>
                    <div
                        className="mt-7 flex h-[180px] flex-col items-center justify-between rounded-[16px] p-8 xl:w-[800px]"
                        style={{
                            background:
                                'linear-gradient(180deg, rgba(29, 31, 65, 0.54) 0%, rgba(46.87, 60.98, 111.03, 0.54) 100%)',
                        }}
                    >
                        <div className="relative flex h-[42px] w-full items-center justify-between">
                            <div className="flex w-fit items-center justify-between gap-x-[11px]">
                                <div className="flex h-[46px] flex-col justify-between">
                                    <div className="font-inter-medium text-base leading-none text-white">
                                        Starts at
                                    </div>
                                    <div className="font-inter-semibold text-xl leading-none text-white text-opacity-80">
                                        {skeleton ? (
                                            <SkeletonTW className="!h-5 !w-[60px] rounded-[8px] !bg-[#1A2039]"></SkeletonTW>
                                        ) : (
                                            start_format[0]
                                        )}
                                    </div>
                                </div>
                                <div className="flex font-inter-semibold text-[58px] leading-none tracking-wide text-white">
                                    {skeleton ? (
                                        <SkeletonTW className="!h-[60px] !w-[240px] rounded-[8px] !bg-[#1A2039]"></SkeletonTW>
                                    ) : (
                                        start_format[1]
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-y-[5px]">
                                <div className="font-inter-semibold text-[14px] text-white/60">
                                    UTC{tz_offset >= 0 ? '+' : '-'}
                                    {tz_offset}
                                </div>
                                <div className="h-0 w-[57px] border-[1px] border-white opacity-50"></div>
                            </div>
                            <div className="flex w-fit items-center justify-between gap-x-[11px]">
                                <div className="flex h-[46px] flex-col justify-between">
                                    <div className="font-inter-medium text-base leading-none text-white">
                                        Ends at
                                    </div>
                                    <div className="font-inter-semibold text-xl leading-none text-white text-opacity-80">
                                        {skeleton ? (
                                            <SkeletonTW className="!h-5 !w-[60px] rounded-[8px] !bg-[#1A2039]"></SkeletonTW>
                                        ) : (
                                            end_format[0]
                                        )}
                                    </div>
                                </div>
                                <div className="flex font-inter-semibold text-[58px] leading-none tracking-wide text-white">
                                    {skeleton ? (
                                        <SkeletonTW className="!h-[60px] !w-[240px] rounded-[8px] !bg-[#1A2039]"></SkeletonTW>
                                    ) : (
                                        end_format[1]
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="h-[42px] w-fit rounded-[23px] border border-[#FFB018] px-11 font-inter-medium text-base leading-[42px] text-[#FFB018]">
                            Duration:&nbsp;
                            {duration.days
                                ? `${duration.days} day${duration.days > 1 ? 's' : ''}`
                                : ''}
                            &nbsp;
                            {duration.hours
                                ? `${duration.hours} hr${duration.hours > 1 ? 's' : ''}`
                                : ''}
                            &nbsp;
                            {duration.minutes
                                ? `${duration.minutes} min${duration.minutes > 1 ? 's' : ''}`
                                : ''}
                            {/* &nbsp;
                            {duration.seconds
                                ? `${duration.seconds} sec${duration.seconds > 1 ? 's' : ''}`
                                : ''} */}
                        </div>
                    </div>
                    <div className="mt-7 flex items-center justify-start gap-x-[9px] font-inter-medium text-sm text-[#3391FF]">
                        <img src={'/img/home/event-warning.svg'} alt="" />{' '}
                        {skeleton ? (
                            <SkeletonTW className="!h-[15px] !w-[240px] rounded-[8px] !bg-[#1A2039]"></SkeletonTW>
                        ) : (
                            <div>
                                {need_password
                                    ? 'Authentication: this event requires a password for access'
                                    : need_chain_owner
                                    ? 'Authentication: this event only allows holders of certain NFT collection for access'
                                    : need_whitelist
                                    ? 'Authentication: this event has been set a whitelist for access.'
                                    : "This event doesn't include any authentication. Free to join."}
                            </div>
                        )}
                    </div>
                    <div className="mt-7 h-0.5 rounded-[20px] bg-[#262E51] backdrop-blur-[20px] xl:w-[800px]" />
                    <div className="mt-[50px]">
                        {show_password_input && (
                            <>
                                <div className="font-inter-bold text-xl leading-tight text-white">
                                    Password
                                </div>

                                <Input
                                    className="mt-[15px] h-12 w-[600px] border-0 bg-[#1E2543B2] font-inter-medium placeholder:font-inter-medium placeholder:text-white/60 "
                                    placeholder="Type here"
                                    onChange={(e: { target: { value: string } }) => {
                                        setPwd(e.target.value);
                                    }}
                                ></Input>
                            </>
                        )}

                        <div className="mt-[60px]">
                            {hasAccess
                                ? fully_open
                                    ? ''
                                    : "You're verified to enter."
                                : finalCheck
                                ? `You're not obliged. Reason: ${deniedReason.toLocaleLowerCase()}`
                                : ''}
                        </div>
                        <YukuButton
                            className={cn(
                                'mt-[30px] w-full xl:w-[800px]',
                                ended && 'cursor-not-allowed',
                            )}
                            type={!ended ? 'CONFIRM' : 'CANCEL'}
                            onClick={() => {
                                if (!event) {
                                    return;
                                }
                                if (ended) {
                                    return;
                                }
                                if (!token) {
                                    navigate('/connect');
                                    return;
                                } else {
                                    if (!hasAccess) {
                                        if (checkingAccess) {
                                            return;
                                        }
                                        setCheckingAccess(true);
                                        accessUserEvent({
                                            user_id: token.user_id,
                                            user_event_id: event.id,
                                            user_token: token.user_token,
                                            password: pwd,
                                        })
                                            .then(() => {
                                                if (need_chain_owner) {
                                                    queryAllTokenOwners(need_chain_owner)
                                                        .then((os) => {
                                                            for (const o of os) {
                                                                if (
                                                                    o.owner ===
                                                                        connectedIdentity?.principal ||
                                                                    o.owner ===
                                                                        connectedIdentity?.account
                                                                ) {
                                                                    setHasAccess(true);
                                                                    navigate(
                                                                        '/space/event/' + event.id,
                                                                    );
                                                                    return;
                                                                }
                                                            }
                                                            message.error(
                                                                `You are not ${need_chain_owner} collection owner`,
                                                            );
                                                            setDeniedReason('Not collection owner');
                                                        })
                                                        .catch(() => {
                                                            message.error('Check Owner Failed');
                                                        })
                                                        .finally(() => {
                                                            setCheckingAccess(false);
                                                        });
                                                } else {
                                                    setHasAccess(true);
                                                    setCheckingAccess(false);
                                                    navigate('/space/event/' + event.id);
                                                }
                                            })
                                            .catch((e) => {
                                                if (need_chain_owner) {
                                                    queryAllTokenOwners(need_chain_owner)
                                                        .then((os) => {
                                                            for (const o of os) {
                                                                if (
                                                                    o.owner ===
                                                                        connectedIdentity?.principal ||
                                                                    o.owner ===
                                                                        connectedIdentity?.account
                                                                ) {
                                                                    setHasAccess(true);
                                                                    navigate(
                                                                        '/space/event/' + event.id,
                                                                    );
                                                                    return;
                                                                }
                                                            }
                                                            message.error(
                                                                `You are not ${need_chain_owner} collection owner`,
                                                            );
                                                            setDeniedReason('Not collection owner');
                                                        })
                                                        .catch(() => {
                                                            message.error('Check Owner Failed');
                                                        })
                                                        .finally(() => {
                                                            setCheckingAccess(false);
                                                        });
                                                } else {
                                                    setCheckingAccess(false);
                                                    const e_json = JSON.parse(e.message);

                                                    const code = e_json.code;
                                                    let msg = e_json.message;

                                                    if (code === 3200) {
                                                        msg = msg.split(
                                                            'SpaceEvent access deny: ',
                                                        )[1];
                                                    }
                                                    setDeniedReason(msg);
                                                    message.error(
                                                        (need_password
                                                            ? 'Password incorrect!'
                                                            : need_chain_owner
                                                            ? `You are not ${need_chain_owner} collection owner`
                                                            : need_chain_owner
                                                            ? 'You are not in whitelist'
                                                            : '') +
                                                            ' ' +
                                                            msg,
                                                    );
                                                }
                                            })
                                            .finally(() => {
                                                if (!finalCheck) {
                                                    setFinalCheck(true);
                                                }
                                            });
                                    } else {
                                        navigate('/space/event/' + event.id);
                                    }
                                }
                            }}
                        >
                            {token
                                ? !ended
                                    ? checkingAccess
                                        ? 'Checking'
                                        : 'Enter'
                                    : 'Ended'
                                : ended
                                ? 'Ended'
                                : 'Connect'}{' '}
                            {checkingAccess && <LoadingOutlined className="ml-2"></LoadingOutlined>}
                        </YukuButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

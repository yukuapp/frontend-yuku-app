import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import DOMPurify from 'dompurify';
import { IconDirectionDownSelect } from '@/components/icons';
import message from '@/components/message';
import YukuIcon from '@/components/ui/yuku-icon';
import { useExploreOatDataList } from '@/hooks/views/explore';
import {
    claimOatNFT,
    getOatEventStatus,
    queryClaimableByUser,
    queryOatProjectsByProjectId,
} from '@/utils/canisters/yuku-old/oat';
import { OatCollectionEvent, OatProject } from '@/canisters/yuku-old/yuku_oat';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';
import { formatDateByNano } from '@/common/data/dates';
import { assureHttp } from '@/common/data/http';
import { useIdentityStore } from '@/stores/identity';

type ClaimAction = 'CLAIMING' | 'CLAIMED' | 'CLAIM_FAILED' | undefined;

const ClaimButton = (event: string | undefined, eligible: boolean) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const identity = useIdentityStore((s) => s.connectedIdentity);

    const [action, setAction] = useState<ClaimAction>(undefined);
    const onClick = () => {
        if (!identity) return navigate('/connect');

        if (!event || !eligible || action) return;
        setAction('CLAIMING');
        message.loading('Claiming', 1000);
        claimOatNFT(identity, event)
            .then((token_id) => {
                message.destroy();
                message.success(`claim token success ${token_id}`);
                setAction('CLAIMED');
            })
            .catch((e) => {
                message.destroy();
                message.error(`claim token failed ${e}`);
                setAction('CLAIM_FAILED');
                setTimeout(() => {
                    setAction(undefined);
                }, 500);
            });
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex h-[36px] w-[120px] flex-shrink-0 items-center justify-center text-[16px] text-[#fff] md:h-[48px] md:w-[160px]',
                eligible && !action
                    ? 'cursor-pointer bg-[#36F]'
                    : 'cursor-not-allowed bg-[#36F]/50',
            )}
        >
            {t('explore.oat.claim')}
        </div>
    );
};

function ExploreOatClaimPage() {
    const { t } = useTranslation();
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const { list } = useExploreOatDataList();
    const { event, project } = useParams();
    const realEvent = list?.find(
        (e) => Number(e.id) === Number(event) && Number(e.projectId) === Number(project),
    );
    const [projectInfo, setProjectInfo] = useState<OatProject | undefined>();

    useEffect(() => {
        if (project && !projectInfo) {
            queryOatProjectsByProjectId([project])
                .then((d) => setProjectInfo(d[0]))
                .catch((e) => message.error(`query project info error: ${e}`));
        }
    }, [project, projectInfo, event]);

    const [eligible, setEligible] = useState(false);

    useEffect(() => {
        if (!identity || !event) return;
        queryClaimableByUser(identity, event)
            .then(setEligible)
            .catch((e) => {
                message.error(`query user claimable failed ${e}`);
            });
    }, [identity]);

    const [mobileTab, setMobileTab] = useState<'contents' | 'about'>('contents');

    return (
        <div className="mx-auto mt-[60px] flex w-full max-w-[1100px] flex-col px-5 pt-5 md:mt-[96px] md:pt-0">
            <div className="mb-[15px] flex w-full flex-col md:mb-[30px] md:h-[64px] md:flex-row md:items-center md:border-l-[6px] md:border-[#7355ff]">
                {!projectInfo || !realEvent ? (
                    <>
                        <div className="flex text-[18px] text-white md:hidden">
                            <Skeleton.Input className="!h-[27px] !w-[100%] !min-w-0" />
                        </div>
                        <div className="mt-[15px] flex items-center md:mt-0">
                            <Skeleton.Button className="flex !h-[30px] !w-[30px] !min-w-0 flex-shrink-0 !rounded-full md:ml-[9px] md:!h-[52px] md:!w-[52px]" />
                            <div className="ml-[10px] flex w-[100px] md:ml-[30px]">
                                <Skeleton.Input className="!h-[18px] !w-[100%] !min-w-0 md:!h-[27px]" />
                            </div>
                            {/* <p className="flex cursor-pointer font-[Inter-Black] text-[14px] font-bold text-[#7355ff] underline underline-offset-4 hover:text-white hover:no-underline md:text-[24px]">
                                TinTinLand
                            </p> */}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex text-[18px] text-white md:hidden">
                            {realEvent.name}
                        </div>
                        <div className="mt-[15px] flex items-center md:mt-0">
                            <img
                                className="mr-[10px] flex h-[30px] w-[30px] flex-shrink-0 rounded-full border border-white md:ml-[19px] md:mr-[19px] md:h-[52px] md:w-[52px]"
                                alt=""
                                src={cdn(projectInfo.logo)}
                            />
                            <Link
                                to={`/oat/${projectInfo.id}`}
                                state={{
                                    project: projectInfo,
                                }}
                                className="flex cursor-pointer font-[Inter-Black] text-[14px] font-bold text-[#7355ff] underline underline-offset-4 hover:text-white hover:no-underline md:text-[24px]"
                            >
                                {realEvent.name}
                            </Link>
                        </div>
                    </>
                )}
            </div>
            <div className="flex flex-col md:flex-row">
                {!realEvent ? (
                    <div className="relative w-full overflow-hidden md:w-[500px]">
                        <div className="relative flex w-full items-center overflow-hidden rounded-[8px] pt-[100%]">
                            <Skeleton.Image className="absolute left-0 top-0 z-10 !h-full !w-full object-cover" />
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full overflow-hidden md:w-[500px]">
                        <div className="relative flex w-full items-center overflow-hidden rounded-[8px] pt-[100%]">
                            <img
                                className="absolute left-0 top-0 z-10 w-full object-cover"
                                alt=""
                                src={cdn(realEvent.featured)}
                            />
                            <i className="absolute left-0 top-0 z-20 h-full w-full backdrop-blur-[60px]"></i>
                        </div>
                        <img
                            className="absolute left-0 top-0 z-30 w-full object-cover px-5 py-5"
                            alt=""
                            src={cdn(realEvent.featured)}
                        />
                    </div>
                )}
                <div className="flex gap-x-[15px] md:hidden">
                    <div className="mt-5 flex">{ClaimButton(event, eligible)}</div>
                    {realEvent && (
                        <Link
                            to={`/market/${realEvent.collection}`}
                            className="mt-auto flex  h-full cursor-pointer items-center border border-[#9999] px-[8px] py-[4px]  font-inter-semibold text-[#9999] hover:bg-black hover:text-white md:hidden "
                        >
                            <span>{'View Collection'}</span>
                        </Link>
                    )}
                </div>

                <div className="hidden flex-1 md:ml-[30px] md:flex">
                    {!projectInfo || !realEvent ? (
                        <ContentsSkeleton />
                    ) : (
                        <Contents
                            eventId={event}
                            project={projectInfo}
                            event={realEvent}
                            eligible={eligible}
                        />
                    )}
                </div>
            </div>
            <div className="mt-[20px] hidden flex-1 flex-col md:mt-[80px] md:flex">
                {!realEvent ? <AboutSkeleton /> : <About event={realEvent} />}
            </div>
            <div className="mt-[20px] flex flex-1 flex-col md:mt-[80px] md:hidden">
                <div className="mb-2 flex items-center">
                    <div
                        className={`text-[16px] text-white ${
                            mobileTab === 'contents'
                                ? 'font-bold text-[#7355ff] underline underline-offset-8'
                                : null
                        }`}
                        onClick={() => setMobileTab('contents')}
                    >
                        {t('explore.oat.contents')}
                    </div>
                    <div
                        className={`ml-5 text-[16px] text-white ${
                            mobileTab === 'about'
                                ? 'font-bold text-[#7355ff] underline underline-offset-8'
                                : null
                        }`}
                        onClick={() => setMobileTab('about')}
                    >
                        {t('explore.oat.about')}
                    </div>
                </div>
                {mobileTab === 'contents' &&
                    (!projectInfo || !realEvent ? (
                        <ContentsSkeleton />
                    ) : (
                        <Contents
                            eventId={event}
                            project={projectInfo}
                            event={realEvent}
                            eligible={eligible}
                        />
                    ))}
                {mobileTab === 'about' &&
                    (!realEvent ? <AboutSkeleton /> : <About event={realEvent} />)}
            </div>
        </div>
    );
}

export default ExploreOatClaimPage;

function Contents({
    eventId,
    project,
    event,
    eligible,
}: {
    eventId: string | undefined;
    project: OatProject;
    event: OatCollectionEvent;
    eligible: boolean;
}) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-1 flex-col">
            <h2 className="mb-3 hidden font-inter-bold text-[22px] leading-none text-[#fff] md:flex md:text-[32px]">
                {event.name}
            </h2>
            <div className="mt-3 flex flex-col md:mt-10">
                <div className="mb-[10px] flex w-full items-center md:mb-[14px]">
                    <p className="flex w-4/12 text-[12px] text-[#fff]/80 md:w-4/12">
                        {t('explore.oat.status')}
                    </p>
                    <div className="flex w-8/12 capitalize md:w-9/12">
                        <p
                            className={cn(
                                'flex h-6 items-center rounded-[2px] bg-[#7355FF]/50 px-[15px] text-[14px] font-bold md:h-8 md:text-[16px]',
                                getOatEventStatus(event) !== 'ended'
                                    ? 'text-[#fff]/90'
                                    : 'text-[#fff]/90',
                            )}
                        >
                            {getOatEventStatus(event)}
                        </p>
                    </div>
                </div>
                <div className="mb-[10px] flex w-full items-center md:mb-[14px]">
                    <p className="flex w-4/12 text-[12px] text-[#fff]/80 md:w-4/12">
                        {t('explore.oat.cap')}
                    </p>
                    <div className="flex w-8/12 text-[14px] leading-[1.5] text-[#fff] md:w-9/12 md:text-[16px]">
                        {event.supply}
                    </div>
                </div>

                <div className="mb-[10px] flex w-full items-center md:mb-[14px]">
                    <p className="flex w-4/12 text-[12px] text-[#fff]/80 md:w-4/12">
                        {t('explore.oat.claimed')}
                    </p>
                    <div className="flex w-8/12 text-[14px] leading-[1.5] text-[#fff] md:w-9/12 md:text-[16px]">
                        {event.claimed}
                    </div>
                </div>
                <div className="mb-[10px] flex w-full items-center md:mb-[14px]">
                    <p className="flex w-4/12 text-[12px] text-[#fff]/80 md:w-4/12">
                        {t('explore.oat.oatStart')}
                    </p>
                    <div className="flex w-8/12 text-[14px] leading-[1.5] text-[#fff] md:w-9/12 md:text-[16px]">
                        {formatDateByNano(event.oat_release_start)}
                    </div>
                </div>
                <div className="mb-[10px] flex w-full items-center md:mb-[14px]">
                    <p className="flex w-4/12 text-[12px] text-[#fff]/80 md:w-4/12">
                        {t('explore.oat.oatEnd')}
                    </p>
                    <div className="flex w-8/12 text-[14px] leading-[1.5] text-[#fff] md:w-9/12 md:text-[16px]">
                        {formatDateByNano(event.oat_release_end)}
                    </div>
                </div>
                <div className="mb-[10px] flex w-full items-center md:mb-[14px]">
                    <p className="flex w-4/12 text-[12px] text-[#fff]/80 md:w-4/12">
                        {t('explore.oat.us')}
                    </p>
                    <div className="flex w-8/12 text-[14px] leading-[1.5] text-[#fff] md:w-9/12 md:text-[16px]">
                        <div className="flex">
                            {project.links &&
                                Object.keys(project.links)
                                    .filter((key) => project.links[key])
                                    .map((key) => (
                                        <Link
                                            key={key}
                                            to={assureHttp(project.links[key])}
                                            className="mr-[10px] flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-[8px]"
                                        >
                                            <YukuIcon
                                                name={`link-${key.toLocaleLowerCase()}`}
                                                size={24}
                                                className="text-[#fff] hover:text-white"
                                            />
                                        </Link>
                                    ))}
                        </div>
                    </div>
                </div>
                <div className="mb-[10px] flex w-full md:mb-[14px]">
                    <p className="flex w-4/12 text-[12px] text-[#fff] md:w-4/12">
                        {t('explore.oat.eligibility')}
                    </p>
                    <div className="flex w-8/12 text-[14px] leading-[1.5] text-white md:w-9/12 md:text-[16px]">
                        <span className="flex items-start">
                            <YukuIcon
                                name="alert"
                                size={12}
                                color="#E8B565"
                                className="mr-[6px] mt-[3px] w-[12px]"
                            />
                            <p
                                className={cn(
                                    'text-[12px]',
                                    eligible ? 'text-[#0c9]' : 'text-[#F1B354]',
                                )}
                            >
                                {eligible ? t('explore.oat.tipYes') : t('explore.oat.tipNo')}
                            </p>
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex w-full gap-x-[60px] ">
                {' '}
                <div className="mt-auto hidden md:flex">{ClaimButton(eventId, eligible)}</div>
                <Link
                    to={`/market/${event.collection}`}
                    className="mt-auto  hidden h-full cursor-pointer items-center border border-[#fff] px-[15px] py-[10px] font-inter-semibold text-[#fff] hover:border-[#36F] hover:bg-[#36F] hover:text-white md:flex "
                >
                    <span>{'View Collection'}</span>
                </Link>
            </div>
        </div>
    );
}

function ContentsSkeleton() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-1 flex-col">
            <div className="mb-3 hidden !w-[50%] md:flex">
                <Skeleton.Input className="!h-[22px] !w-[100%] rounded-[8px] md:!h-[32px]" />
            </div>

            <div className="mt-3 flex flex-col md:mt-10">
                {[
                    t('explore.oat.status'),
                    t('explore.oat.cap'),
                    t('explore.oat.claimed'),
                    t('explore.oat.oatStart'),
                    t('explore.oat.oatEnd'),
                    t('explore.oat.us'),
                    t('explore.oat.eligibility'),
                ].map((item, index) => (
                    <div key={item} className="mb-[10px] flex w-full items-center md:mb-[14px]">
                        <div className="flex w-4/12 text-[12px] text-[#fff]/60 md:w-4/12">
                            {item}
                        </div>
                        <div className="flex w-8/12 text-[14px] text-[#fff]/60 md:w-9/12 md:text-[16px]">
                            <Skeleton.Input
                                className={cn(
                                    'flex !w-[80%] !min-w-0 !rounded-[2px]',
                                    index === 0 && '!h-6 !w-[90px] md:!h-8',
                                    (index === 1 || index === 2) &&
                                        '!h-[21px] !w-[50px] md:!h-[24px]',
                                    (index === 3 || index === 4) &&
                                        '!h-[21px] !w-[150px] md:!h-[24px]',
                                    index === 5 && '!h-[24px] !w-[204px]',
                                    index === 6 && '!h-[18px] !w-[250px]',
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function About({ event }: { event: OatCollectionEvent }) {
    const { t } = useTranslation();

    const limit = 240;

    const [more, setMore] = useState<boolean | undefined>(
        event.description.length <= limit ? undefined : true,
    );

    const showDescription = useMemo(() => {
        if (more === undefined) return event.description;
        if (more) return event.description.substring(0, limit) + '...';
        return event.description;
    }, [event, more]);

    const toggle = () => setMore((m) => !m);

    return (
        <div className="">
            <h2 className="hidden text-[22px] font-bold text-[#fff] md:flex">
                {t('explore.oat.about')}
            </h2>
            <div className="mt-5 flex items-center">
                <p className="mr-3 text-[12px] font-bold text-[#fff]/50 md:mr-7">
                    {t('explore.oat.start')}
                </p>
                <p className="text-[14px] text-[#fff] md:text-[16px]">
                    {formatDateByNano(event.event_start)}{' '}
                </p>
            </div>
            <div className="mt-5 flex items-center">
                <p className="mr-3 text-[12px] font-bold text-[#fff]/50 md:mr-7">
                    {t('explore.oat.end')}
                </p>
                <p className="text-[14px] text-[#fff] md:text-[16px]">
                    {formatDateByNano(event.event_end)}{' '}
                </p>
            </div>
            <p
                className="mt-[10px] inline-block text-[12px] leading-[20px] text-[#fff]/80 md:leading-[28px]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(showDescription) }}
            ></p>
            {more !== undefined && (
                <span className="mt-[10px] items-center font-inter-semibold text-white">
                    {more ? (
                        <span className="cursor-pointer" onClick={toggle}>
                            {t('explore.oat.showMore')}
                        </span>
                    ) : (
                        <span className="cursor-pointer" onClick={toggle}>
                            {t('explore.oat.showLess')}
                        </span>
                    )}
                    <IconDirectionDownSelect
                        className={`ml-1 inline cursor-pointer text-white transition-transform duration-500 ${
                            !more
                                ? 'rotate-180 group-hover:rotate-180 md:group-hover:rotate-0'
                                : 'group-hover:rotate-0 md:group-hover:rotate-180'
                        }`}
                        onClick={toggle}
                    />
                </span>
            )}

            <p className="mt-5 text-[14px] font-bold text-[#fff]">How to get this OAT ?</p>
            <p
                className="mt-[10px] text-[12px] leading-[20px] text-[#fff]/80 md:leading-[28px]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.link) }}
            ></p>
        </div>
    );
}

function AboutSkeleton() {
    return (
        <div className="flex flex-col">
            <div className="hidden w-[50%] md:flex md:w-[20%]">
                <Skeleton.Input className="!h-[33px] !w-[100%] rounded-[8px]" />
            </div>
            <div className="mt-3 flex flex-col">
                {['', ''].map((_, index) => (
                    <div key={index} className="mb-[10px] flex w-full items-center md:mb-[20px]">
                        <div className="w-4/12 md:w-4/12">
                            <Skeleton.Input className="!h-[24px] !w-[70%] !min-w-0" />
                        </div>
                        <div className="w-8/12 md:w-9/12">
                            <Skeleton.Input className="!h-[24px] !w-[80%] !min-w-0" />
                        </div>
                    </div>
                ))}
                <Skeleton.Input className="mb-[10px] !h-[24px] !w-[100%] !min-w-0" />
                <Skeleton.Input className="mb-[10px] !h-[24px] !w-[100%] !min-w-0" />
                <Skeleton.Input className="mb-[10px] !h-[24px] !w-[100%] !min-w-0" />
            </div>
        </div>
    );
}
